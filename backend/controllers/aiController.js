const { GoogleGenerativeAI } = require('@google/generative-ai');
const DiagnosisLog = require('../models/DiagnosisLog');
const Prescription = require('../models/Prescription');
const User = require('../models/User');

const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') return null;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

// Get token balance
const getTokenBalance = async (req, res) => {
  const user = await User.findById(req.user._id).select('subscriptionPlan aiTokens aiTokensUsed name role');
  res.json({
    plan: user.subscriptionPlan,
    tokensRemaining: user.subscriptionPlan === 'pro' ? 'Unlimited' : (user.aiTokens || 0),
    tokensUsed: user.aiTokensUsed || 0,
    isPro: user.subscriptionPlan === 'pro',
  });
};

// Add tokens - admin only - FIXED
const addTokens = async (req, res) => {
  console.log('addTokens called with body:', req.body);
  
  const { userId, tokens } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }
  if (!tokens) {
    return res.status(400).json({ message: 'tokens is required' });
  }

  const tokenCount = Number(tokens);
  if (isNaN(tokenCount) || tokenCount <= 0) {
    return res.status(400).json({ message: 'tokens must be a positive number' });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found with id: ' + userId });
  }

  // Directly update tokens
  await User.findByIdAndUpdate(
    userId,
    { $inc: { aiTokens: tokenCount } },
    { new: true }
  );

  const updatedUser = await User.findById(userId).select('name aiTokens subscriptionPlan');
  console.log('Tokens updated for:', updatedUser.name, 'new balance:', updatedUser.aiTokens);

  res.json({
    message: `Successfully added ${tokenCount} tokens to ${updatedUser.name}`,
    tokensRemaining: updatedUser.aiTokens,
    name: updatedUser.name,
  });
};

// Symptom Checker
const symptomChecker = async (req, res) => {
  const { symptoms, age, gender, history, patientId } = req.body;
  const user = await User.findById(req.user._id);
  if (!user.hasAITokens()) {
    return res.status(403).json({ message: 'No AI tokens remaining.', tokensRemaining: 0, upgradeRequired: true });
  }
  let aiResponse = {
    possibleConditions: ['Viral Infection', 'Common Cold', 'Stress-related condition'],
    riskLevel: 'low',
    suggestedTests: ['CBC', 'CRP'],
    summary: 'Mild condition based on symptoms. Clinical examination recommended.',
  };
  let aiWorked = false;
  try {
    const prompt = `You are a medical AI. Patient: Age ${age}, Gender ${gender}, Symptoms: ${Array.isArray(symptoms) ? symptoms.join(', ') : symptoms}, History: ${history || 'None'}.
Respond ONLY in this JSON: {"possibleConditions":["c1","c2","c3"],"riskLevel":"low","suggestedTests":["t1","t2"],"summary":"summary"}
riskLevel must be: low, medium, or high`;
    const text = await callGemini(prompt);
    if (text) {
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      if (parsed.possibleConditions && parsed.riskLevel) { aiResponse = parsed; aiWorked = true; }
    }
  } catch (err) { console.error('AI fallback:', err.message); }
  await user.useAIToken();
  const log = await DiagnosisLog.create({
    patientId, doctorId: req.user._id,
    symptoms: Array.isArray(symptoms) ? symptoms : symptoms.split(',').map(s => s.trim()),
    age, gender, history, aiResponse, riskLevel: aiResponse.riskLevel,
  });
  const updated = await User.findById(req.user._id).select('aiTokens subscriptionPlan');
  res.json({ aiResponse, logId: log._id, aiWorked, tokensRemaining: updated.subscriptionPlan === 'pro' ? 'Unlimited' : updated.aiTokens });
};

// Explain Prescription
const explainPrescription = async (req, res) => {
  const { prescriptionId, language = 'english' } = req.body;
  const user = await User.findById(req.user._id);
  if (!user.hasAITokens()) {
    return res.status(403).json({ message: 'No AI tokens remaining.', upgradeRequired: true });
  }
  const prescription = await Prescription.findById(prescriptionId).populate('patientId', 'name age');
  if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
  const medicineList = prescription.medicines.map(m => `- ${m.name}: ${m.dosage}, ${m.frequency} for ${m.duration}`).join('\n');
  let explanation = `Your prescription has ${prescription.medicines.length} medicine(s):\n${medicineList}\n\nFollow dosage carefully.`;
  let aiWorked = false;
  try {
    const langNote = language === 'urdu' ? 'Respond entirely in Urdu.' : 'Respond in simple English.';
    const prompt = `${langNote} Explain this prescription simply:\nMedicines:\n${medicineList}\nDiagnosis: ${prescription.diagnosis || 'N/A'}\nUnder 250 words.`;
    const text = await callGemini(prompt);
    if (text) { explanation = text; aiWorked = true; }
  } catch (err) { console.error('AI explain fallback:', err.message); }
  await user.useAIToken();
  const update = language === 'urdu' ? { aiExplanationUrdu: explanation } : { aiExplanation: explanation };
  await Prescription.findByIdAndUpdate(prescriptionId, update);
  res.json({ explanation, language, aiWorked });
};

// Risk Flagging
const riskFlagging = async (req, res) => {
  const { patientId } = req.params;
  const recentLogs = await DiagnosisLog.find({ patientId }).sort('-createdAt').limit(10);
  let flags = [];
  const highRisk = recentLogs.filter(l => l.riskLevel === 'high');
  if (highRisk.length >= 2) flags.push({ type: 'HIGH_RISK_REPEATED', message: 'Multiple high-risk diagnoses detected.' });
  res.json({ flags, totalLogs: recentLogs.length });
};

module.exports = { symptomChecker, explainPrescription, riskFlagging, getTokenBalance, addTokens };