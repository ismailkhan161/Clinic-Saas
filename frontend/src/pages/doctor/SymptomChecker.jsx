import { useState, useEffect } from 'react';
import { aiAPI, patientAPI } from '../../api/services';
import { PageHeader, Badge, LoadingSpinner } from '../../components/common';
import toast from 'react-hot-toast';

export default function SymptomChecker() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ patientId: '', symptoms: '', age: '', gender: 'male', history: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(null);

  useEffect(() => {
    patientAPI.getAll({ limit: 200 }).then(r => setPatients(r.data.patients));
    aiAPI.getTokenBalance().then(r => setTokenBalance(r.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId) return toast.error('Please select a patient');
    setLoading(true);
    setResult(null);
    try {
      const res = await aiAPI.checkSymptoms({
        ...form,
        symptoms: form.symptoms.split(',').map(s => s.trim()).filter(Boolean),
      });
      setResult(res.data);
      // Update token balance
      aiAPI.getTokenBalance().then(r => setTokenBalance(r.data));
      toast.success('AI analysis complete!');
    } catch (err) {
      if (err.response?.data?.upgradeRequired) {
        toast.error('No tokens left! Contact admin for more tokens.');
      } else {
        toast.error('AI check failed');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <PageHeader title="🤖 AI Symptom Checker" subtitle="Powered by Gemini AI" />

      {/* Token Balance Card */}
      {tokenBalance && (
        <div className={`token-balance-card ${tokenBalance.isPro ? 'token-balance-pro' : tokenBalance.tokensRemaining === 0 ? 'token-balance-empty' : 'token-balance-free'}`}>
          <div className="token-balance-left">
            <span className="token-balance-icon">{tokenBalance.isPro ? '⭐' : '🎫'}</span>
            <div>
              <div className="token-balance-title">
                {tokenBalance.isPro ? 'Pro Plan — Unlimited AI Access' : `Free Plan — ${tokenBalance.tokensRemaining} AI tokens remaining`}
              </div>
              <div className="token-balance-sub">
                {tokenBalance.isPro ? 'You have unlimited AI Symptom Checker access' : `${tokenBalance.tokensUsed} tokens used · Each analysis uses 1 token`}
              </div>
            </div>
          </div>
          {!tokenBalance.isPro && (
            <div className="token-bar-wrap">
              <div className="token-bar">
                <div className="token-bar-fill" style={{ width: `${Math.min(100, (tokenBalance.tokensRemaining / 10) * 100)}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {tokenBalance?.tokensRemaining === 0 && !tokenBalance?.isPro ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
          <h3 style={{ marginBottom: '8px' }}>No AI Tokens Remaining</h3>
          <p style={{ color: '#64748b', marginBottom: '16px' }}>You've used all your free AI tokens. Contact your admin to get more tokens or upgrade to Pro for unlimited access.</p>
          <div className="badge badge-yellow" style={{ fontSize: '13px', padding: '6px 16px' }}>Contact Admin for More Tokens</div>
        </div>
      ) : (
        <div className="ai-layout">
          <div className="card">
            <h3 className="card-title">Patient Symptoms</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Patient *</label>
                <select required value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}>
                  <option value="">— Select Patient —</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.age}y, {p.gender})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Symptoms (comma-separated) *</label>
                <textarea required rows={3} value={form.symptoms}
                  onChange={e => setForm({ ...form, symptoms: e.target.value })}
                  placeholder="fever, sore throat, headache, fatigue..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Age *</label>
                  <input type="number" required min="1" max="120" value={form.age}
                    onChange={e => setForm({ ...form, age: e.target.value })} placeholder="25" />
                </div>
                <div className="form-group">
                  <label>Gender *</label>
                  <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Medical History (optional)</label>
                <textarea rows={2} value={form.history}
                  onChange={e => setForm({ ...form, history: e.target.value })}
                  placeholder="Diabetes, hypertension, previous surgeries..." />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? '🤖 Analyzing...' : `🔍 Analyze Symptoms ${!tokenBalance?.isPro ? `(Uses 1 Token)` : ''}`}
              </button>
            </form>
          </div>

          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
              <div className="ai-pulse">🤖</div>
              <p style={{ marginTop: '12px', color: '#64748b' }}>Gemini AI is analyzing symptoms...</p>
            </div>
          )}

          {result && (
            <div className="card ai-result-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="card-title" style={{ margin: 0 }}>🤖 AI Analysis Result</h3>
                {!result.aiWorked && <span className="badge badge-yellow">Fallback Response</span>}
                {result.aiWorked && <span className="badge badge-green">Gemini AI</span>}
              </div>
              <div className="result-risk">Risk Level: <Badge status={result.aiResponse.riskLevel} /></div>
              <div className="result-section">
                <h4>Possible Conditions</h4>
                <div className="condition-tags">
                  {result.aiResponse.possibleConditions?.map(c => <span key={c} className="condition-tag">{c}</span>)}
                </div>
              </div>
              <div className="result-section">
                <h4>Suggested Tests</h4>
                <ul className="test-list">
                  {result.aiResponse.suggestedTests?.map(t => <li key={t}>🔬 {t}</li>)}
                </ul>
              </div>
              <div className="result-section">
                <h4>Summary</h4>
                <p className="result-summary">{result.aiResponse.summary}</p>
              </div>
              {!tokenBalance?.isPro && (
                <div style={{ marginTop: '12px', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '12px', color: '#64748b' }}>
                  🎫 Tokens remaining after this: <strong>{result.tokensRemaining}</strong>
                </div>
              )}
              <p className="ai-disclaimer">⚠️ AI suggestion only. Clinical judgment takes priority.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}