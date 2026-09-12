
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../api/services';
import toast from 'react-hot-toast';

export default function RegisterReceptionist() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'', phone:'' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await authAPI.register({ name: form.name, email: form.email, password: form.password, role: 'receptionist', phone: form.phone });
      toast.success('Receptionist account created! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-logo">🗂️</div>
        <h1 className="auth-title">Receptionist Registration</h1>
        <p className="auth-sub">Create your receptionist account</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row-2">
            <div className="form-group">
              <label>Full Name *</label>
              <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Sara Ahmed" />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="sara@clinic.com" />
            </div>
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label>Password *</label>
              <input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Min 6 characters" />
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input type="password" required value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} placeholder="Repeat password" />
            </div>
          </div>
          <div className="form-group">
            <label>Phone Number *</label>
            <input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+92 300 0000000" />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Receptionist Account'}
          </button>
        </form>

        <p className="auth-footer">Already have an account? <Link to="/login">Sign In</Link></p>
      </div>
    </div>
  );
}
