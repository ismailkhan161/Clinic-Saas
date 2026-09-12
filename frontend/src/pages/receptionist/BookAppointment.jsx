import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI, patientAPI, userAPI } from '../../api/services';
import { PageHeader } from '../../components/common';
import toast from 'react-hot-toast';
const SLOTS=['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM'];
export default function BookAppointment() {
  const navigate=useNavigate();
  const [patients,setPatients]=useState([]); const [doctors,setDoctors]=useState([]);
  const [form,setForm]=useState({patientId:'',doctorId:'',date:'',timeSlot:'',reason:''});
  const [saving,setSaving]=useState(false);
  useEffect(()=>{Promise.all([patientAPI.getAll({limit:200}),userAPI.getDoctors()]).then(([p,d])=>{setPatients(p.data.patients);setDoctors(d.data);});},[]);
  const handleSubmit=async(e)=>{
    e.preventDefault(); setSaving(true);
    try { await appointmentAPI.create(form); toast.success('Appointment booked!'); navigate('/receptionist'); }
    catch(err){toast.error(err.response?.data?.message||'Failed');} finally{setSaving(false);}
  };
  return (
    <div className="page">
      <PageHeader title="Book Appointment"/>
      <form onSubmit={handleSubmit} className="form-card-layout">
        <div className="card">
          <h3 className="card-title">Appointment Details</h3>
          <div className="form-group"><label>Patient *</label><select required value={form.patientId} onChange={e=>setForm({...form,patientId:e.target.value})}><option value="">— Select Patient —</option>{patients.map(p=><option key={p._id} value={p._id}>{p.name} ({p.age}y, {p.gender})</option>)}</select></div>
          <div className="form-group"><label>Doctor *</label><select required value={form.doctorId} onChange={e=>setForm({...form,doctorId:e.target.value})}><option value="">— Select Doctor —</option>{doctors.map(d=><option key={d._id} value={d._id}>Dr. {d.name} — {d.specialization||'General'}</option>)}</select></div>
          <div className="form-row">
            <div className="form-group"><label>Date *</label><input type="date" required value={form.date} min={new Date().toISOString().split('T')[0]} onChange={e=>setForm({...form,date:e.target.value})}/></div>
            <div className="form-group"><label>Time Slot *</label><select required value={form.timeSlot} onChange={e=>setForm({...form,timeSlot:e.target.value})}><option value="">— Select Time —</option>{SLOTS.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
          </div>
          <div className="form-group"><label>Reason</label><textarea rows={3} value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} placeholder="Fever, checkup, follow-up..."/></div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={()=>navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Booking...':'📅 Book Appointment'}</button>
        </div>
      </form>
    </div>
  );
}
