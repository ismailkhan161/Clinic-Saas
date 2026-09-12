import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAPI } from '../../api/services';
import { PageHeader } from '../../components/common';
import toast from 'react-hot-toast';
export default function RegisterPatient() {
  const navigate=useNavigate();
  const [form,setForm]=useState({name:'',age:'',gender:'male',contact:'',email:'',address:'',bloodGroup:'',allergies:'',chronicConditions:'',emergencyContact:{name:'',phone:'',relation:''}});
  const [saving,setSaving]=useState(false);
  const set=(f,v)=>setForm(p=>({...p,[f]:v}));
  const setEC=(f,v)=>setForm(p=>({...p,emergencyContact:{...p.emergencyContact,[f]:v}}));
  const handleSubmit=async(e)=>{
    e.preventDefault(); setSaving(true);
    try {
      await patientAPI.create({...form,allergies:form.allergies?form.allergies.split(',').map(s=>s.trim()):[],chronicConditions:form.chronicConditions?form.chronicConditions.split(',').map(s=>s.trim()):[]});
      toast.success('Patient registered!'); navigate('/receptionist/patients');
    } catch(err){toast.error(err.response?.data?.message||'Failed');} finally{setSaving(false);}
  };
  return (
    <div className="page">
      <PageHeader title="Register New Patient"/>
      <form onSubmit={handleSubmit} className="form-card-layout">
        <div className="card">
          <h3 className="card-title">Basic Information</h3>
          <div className="form-row">
            <div className="form-group"><label>Full Name *</label><input required value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Muhammad Ali"/></div>
            <div className="form-group"><label>Age *</label><input type="number" required value={form.age} onChange={e=>set('age',e.target.value)}/></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Gender *</label><select value={form.gender} onChange={e=>set('gender',e.target.value)}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
            <div className="form-group"><label>Blood Group</label><select value={form.bloodGroup} onChange={e=>set('bloodGroup',e.target.value)}><option value="">Unknown</option>{['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b=><option key={b} value={b}>{b}</option>)}</select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Contact *</label><input required value={form.contact} onChange={e=>set('contact',e.target.value)} placeholder="+92 300 0000000"/></div>
            <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)}/></div>
          </div>
          <div className="form-group"><label>Address</label><input value={form.address} onChange={e=>set('address',e.target.value)}/></div>
        </div>
        <div className="card">
          <h3 className="card-title">Medical Information</h3>
          <div className="form-group"><label>Allergies (comma-separated)</label><input value={form.allergies} onChange={e=>set('allergies',e.target.value)} placeholder="Penicillin, Aspirin"/></div>
          <div className="form-group"><label>Chronic Conditions (comma-separated)</label><input value={form.chronicConditions} onChange={e=>set('chronicConditions',e.target.value)} placeholder="Diabetes, Hypertension"/></div>
        </div>
        <div className="card">
          <h3 className="card-title">Emergency Contact</h3>
          <div className="form-row">
            <div className="form-group"><label>Name</label><input value={form.emergencyContact.name} onChange={e=>setEC('name',e.target.value)}/></div>
            <div className="form-group"><label>Phone</label><input value={form.emergencyContact.phone} onChange={e=>setEC('phone',e.target.value)}/></div>
            <div className="form-group"><label>Relation</label><input value={form.emergencyContact.relation} onChange={e=>setEC('relation',e.target.value)} placeholder="Father"/></div>
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={()=>navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Registering...':'✅ Register Patient'}</button>
        </div>
      </form>
    </div>
  );
}