import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const routes = { admin: '/admin', doctor: '/doctor', receptionist: '/receptionist', patient: '/patient' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(routes[user.role]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🏥</div>
        <h1 className="auth-title">MediCare</h1>
        <p className="auth-sub">AI-Powered Clinic Management System</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="Enter your email" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password" />
          </div>
          <div style={{ textAlign: 'right', marginBottom: '14px', marginTop: '-8px' }}>
            <Link to="/forgot-password" style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider"><span>New to MediCare?</span></div>

        <div className="register-links">
          <Link to="/register/patient" className="reg-link reg-link-patient">🧑‍🤝‍🧑 Register as Patient</Link>
          <Link to="/register/doctor" className="reg-link reg-link-doctor">👨‍⚕️ Register as Doctor</Link>
          <Link to="/register/receptionist" className="reg-link reg-link-receptionist">🗂️ Register as Receptionist</Link>
        </div>
      </div>
    </div>
  );
}