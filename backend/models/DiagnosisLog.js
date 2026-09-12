const mongoose = require('mongoose');
 
const diagnosisLogSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symptoms: [String],
  age: { type: Number },
  gender: { type: String },
  history: { type: String },
  aiResponse: {
    possibleConditions: [String],
    riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
    suggestedTests: [String],
    summary: String,
  },
  riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
  flagged: { type: Boolean, default: false },
  flagReason: { type: String },
}, { timestamps: true });
 
module.exports = mongoose.model('DiagnosisLog', diagnosisLogSchema);