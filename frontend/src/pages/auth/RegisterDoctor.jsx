import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../api/services';
import toast from 'react-hot-toast';

const SPECIALIZATIONS = ['General Physician','Cardiologist','Dermatologist','Neurologist','Orthopedic Surgeon','Pediatrician','Gynecologist','Psychiatrist','ENT Specialist','Ophthalmologist','Urologist','Gastroenterologist','Pulmonologist','Endocrinologist','Oncologist'];

export default function RegisterDoctor() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'', phone:'', specialization:'General Physician', experience:'' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await authAPI.register({ name: form.name, email: form.email, password: form.password, role: 'doctor', phone: form.phone, specialization: form.specialization });
      toast.success('Doctor account created! Please login.');
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
        <div className="auth-logo">👨‍⚕️</div>
        <h1 className="auth-title">Doctor Registration</h1>
        <p className="auth-sub">Create your doctor account</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row-2">
            <div className="form-group">
              <label>Full Name *</label>
              <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Dr. Ahmed Khan" />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="doctor@email.com" />
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
          <div className="form-row-2">
            <div className="form-group">
              <label>Phone Number *</label>
              <input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+92 300 0000000" />
            </div>
            <div className="form-group">
              <label>Years of Experience</label>
              <input type="number" value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})} placeholder="5" />
            </div>
          </div>
          <div className="form-group">
            <label>Specialization *</label>
            <select required value={form.specialization} onChange={e=>setForm({...form,specialization:e.target.value})}>
              {SPECIALIZATIONS.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Doctor Account'}
          </button>
        </form>

        <p className="auth-footer">Already have an account? <Link to="/login">Sign In</Link></p>
      </div>
    </div>
  );
}
