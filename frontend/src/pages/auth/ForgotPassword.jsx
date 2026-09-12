import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('email'); // email | token
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setResetToken(res.data.resetToken);
      toast.success('Reset token generated!');
      setStep('token');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email not found');
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token: token || resetToken, password });
      toast.success('Password reset successfully! Please login.');
      setStep('done');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Token may have expired.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🔐</div>
        <h1 className="auth-title">Reset Password</h1>

        {step === 'email' && (
          <>
            <p className="auth-sub">Enter your email to get a reset token</p>
            <form onSubmit={handleEmailSubmit} className="auth-form">
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your registered email" />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Sending...' : 'Get Reset Token'}
              </button>
            </form>
          </>
        )}

        {step === 'token' && (
          <>
            <p className="auth-sub">Use the token below to reset your password</p>
            {resetToken && (
              <div className="token-box">
                <p className="token-label">Your Reset Token:</p>
                <code className="token-code">{resetToken}</code>
                <p className="token-note">⚠️ This token expires in 15 minutes. In production this would be sent via email.</p>
              </div>
            )}
            <form onSubmit={handleReset} className="auth-form">
              <div className="form-group">
                <label>Reset Token</label>
                <input required value={token} onChange={e => setToken(e.target.value)} placeholder="Paste your reset token" />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat new password" />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        {step === 'done' && (
          <div className="success-box">
            <div style={{ fontSize: '48px', textAlign: 'center' }}>✅</div>
            <p style={{ textAlign: 'center', marginTop: '12px', color: '#16a34a', fontWeight: '600' }}>Password reset successfully!</p>
            <Link to="/login" className="btn btn-primary btn-full" style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>Go to Login</Link>
          </div>
        )}

        <p className="auth-footer"><Link to="/login">← Back to Login</Link></p>
      </div>
    </div>
  );
}