import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { prescriptionAPI, patientAPI, aiAPI } from '../../api/services';
import { PageHeader, LoadingSpinner } from '../../components/common';
import toast from 'react-hot-toast';
const emptyMed = { name:'',dosage:'',frequency:'',duration:'',instructions:'' };
export default function WritePrescription() {
  const [params]=useSearchParams(); const navigate=useNavigate();
  const patientId=params.get('patientId'); const aptId=params.get('aptId');
  const [patient,setPatient]=useState(null); const [medicines,setMedicines]=useState([{...emptyMed}]);
  const [form,setForm]=useState({diagnosis:'',instructions:'',followUpDate:''});
  const [patients,setPatients]=useState([]); const [selectedPatient,setSelectedPatient]=useState(patientId||'');
  const [aiLoading,setAiLoading]=useState(false); const [saving,setSaving]=useState(false);
  useEffect(()=>{patientAPI.getAll({limit:100}).then(r=>setPatients(r.data.patients));if(patientId)patientAPI.getOne(patientId).then(r=>setPatient(r.data));},[patientId]);
  const addMed=()=>setMedicines([...medicines,{...emptyMed}]);
  const removeMed=(i)=>setMedicines(medicines.filter((_,idx)=>idx!==i));
  const updateMed=(i,field,val)=>setMedicines(medicines.map((m,idx)=>idx===i?{...m,[field]:val}:m));
  const handleSubmit=async(e)=>{
    e.preventDefault();
    if(!selectedPatient) return toast.error('Select a patient');
    if(medicines.some(m=>!m.name||!m.dosage)) return toast.error('Fill all medicine details');
    setSaving(true);
    try {
      const res=await prescriptionAPI.create({patientId:selectedPatient,appointmentId:aptId,medicines,...form});
      toast.success('Prescription saved!');
      setAiLoading(true);
      try { await aiAPI.explainPrescription({prescriptionId:res.data._id,language:'english'}); toast.success('AI explanation generated!'); }
      catch { toast.error('AI unavailable'); } finally { setAiLoading(false); }
      navigate(-1);
    } catch(err) { toast.error(err.response?.data?.message||'Failed'); } finally { setSaving(false); }
  };
  return (
    <div className="page">
      <PageHeader title="Write Prescription"/>
      <form onSubmit={handleSubmit} className="prescription-form">
        <div className="card">
          <h3 className="card-title">Patient</h3>
          {!patientId?<div className="form-group"><label>Select Patient</label><select value={selectedPatient} onChange={e=>setSelectedPatient(e.target.value)} required><option value="">— Select —</option>{patients.map(p=><option key={p._id} value={p._id}>{p.name} ({p.age}y)</option>)}</select></div>
          :<div className="patient-info-box"><strong>{patient?.name}</strong> — {patient?.age}y, {patient?.gender}{patient?.allergies?.length>0&&<span className="allergy-warn"> ⚠️ Allergies: {patient.allergies.join(', ')}</span>}</div>}
        </div>
        <div className="card">
          <h3 className="card-title">Diagnosis</h3>
          <div className="form-row"><div className="form-group"><label>Diagnosis</label><input value={form.diagnosis} onChange={e=>setForm({...form,diagnosis:e.target.value})} placeholder="e.g. Acute Pharyngitis"/></div><div className="form-group"><label>Follow-up Date</label><input type="date" value={form.followUpDate} onChange={e=>setForm({...form,followUpDate:e.target.value})}/></div></div>
          <div className="form-group"><label>General Instructions</label><textarea value={form.instructions} onChange={e=>setForm({...form,instructions:e.target.value})} rows={2} placeholder="Rest, drink fluids..."/></div>
        </div>
        <div className="card">
          <div className="card-header-row"><h3 className="card-title">Medicines</h3><button type="button" className="btn btn-sm btn-outline" onClick={addMed}>+ Add</button></div>
          {medicines.map((med,i)=>(
            <div key={i} className="medicine-row">
              <div className="form-row med-form">
                <div className="form-group"><label>Name</label><input required value={med.name} onChange={e=>updateMed(i,'name',e.target.value)} placeholder="Paracetamol 500mg"/></div>
                <div className="form-group"><label>Dosage</label><input required value={med.dosage} onChange={e=>updateMed(i,'dosage',e.target.value)} placeholder="1 tablet"/></div>
                <div className="form-group"><label>Frequency</label><input required value={med.frequency} onChange={e=>updateMed(i,'frequency',e.target.value)} placeholder="3x daily"/></div>
                <div className="form-group"><label>Duration</label><input required value={med.duration} onChange={e=>updateMed(i,'duration',e.target.value)} placeholder="5 days"/></div>
              </div>
              <div className="form-group"><label>Instructions</label><input value={med.instructions} onChange={e=>updateMed(i,'instructions',e.target.value)} placeholder="Take after meals"/></div>
              {medicines.length>1&&<button type="button" className="btn btn-sm btn-danger" onClick={()=>removeMed(i)}>Remove</button>}
            </div>
          ))}
        </div>
        {aiLoading&&<div className="card"><LoadingSpinner text="Generating AI explanation..."/></div>}
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={()=>navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving...':'💾 Save Prescription'}</button>
        </div>
      </form>
    </div>
  );
}
