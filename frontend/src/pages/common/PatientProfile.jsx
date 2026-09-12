import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { patientAPI, prescriptionAPI, aiAPI } from '../../api/services';
import { PageHeader, Badge, LoadingSpinner } from '../../components/common';
import toast from 'react-hot-toast';
export default function PatientProfile() {
  const {id}=useParams();
  const [patient,setPatient]=useState(null); const [history,setHistory]=useState({appointments:[],prescriptions:[],diagnosisLogs:[]});
  const [flags,setFlags]=useState([]); const [loading,setLoading]=useState(true); const [tab,setTab]=useState('appointments');
  useEffect(()=>{
    Promise.all([patientAPI.getOne(id),patientAPI.getHistory(id),aiAPI.getRiskFlags(id).catch(()=>({data:{flags:[]}}))])
      .then(([p,h,f])=>{setPatient(p.data);setHistory(h.data);setFlags(f.data.flags||[]);}).finally(()=>setLoading(false));
  },[id]);
  const downloadPDF=async(prescId)=>{
    try { const res=await prescriptionAPI.downloadPDF(prescId); const url=URL.createObjectURL(new Blob([res.data],{type:'application/pdf'})); const a=document.createElement('a');a.href=url;a.download=`prescription-${prescId}.pdf`;a.click(); toast.success('PDF downloaded!'); }
    catch { toast.error('Download failed'); }
  };
  if(loading) return <LoadingSpinner/>;
  if(!patient) return <p>Patient not found</p>;
  return (
    <div className="page">
      <PageHeader title={patient.name} subtitle="Patient Profile & Medical History"/>
      <div className="profile-grid">
        <div className="card profile-card">
          <div className="profile-avatar">{patient.name.charAt(0)}</div>
          <h2>{patient.name}</h2>
          <div className="profile-details">
            {[['Age',patient.age],['Contact',patient.contact],['Blood Group',patient.bloodGroup||'—'],['Address',patient.address||'—']].map(([k,v])=><div key={k} className="detail-row"><span>{k}</span><strong>{v}</strong></div>)}
            <div className="detail-row"><span>Gender</span><Badge status={patient.gender}/></div>
          </div>
          {patient.allergies?.length>0&&<div className="allergy-box"><h4>⚠️ Allergies</h4><div className="tag-list">{patient.allergies.map(a=><span key={a} className="tag tag-red">{a}</span>)}</div></div>}
          {patient.chronicConditions?.length>0&&<div className="condition-box"><h4>🔄 Conditions</h4><div className="tag-list">{patient.chronicConditions.map(c=><span key={c} className="tag tag-amber">{c}</span>)}</div></div>}
          {flags.length>0&&<div className="flags-box"><h4>🚩 Risk Flags</h4>{flags.map((f,i)=><div key={i} className="flag-item"><span className="flag-type">{f.type}</span><p>{f.message}</p></div>)}</div>}
        </div>
        <div className="history-panel">
          <div className="tab-bar">
            {['appointments','prescriptions','diagnosisLogs'].map(t=>(
              <button key={t} className={`tab ${tab===t?'tab-active':''}`} onClick={()=>setTab(t)}>
                {t==='appointments'?'📅 Appointments':t==='prescriptions'?'💊 Prescriptions':'🤖 AI Logs'}
                <span className="tab-count">{history[t]?.length}</span>
              </button>
            ))}
          </div>
          <div className="timeline">
            {tab==='appointments'&&(history.appointments.length===0?<p className="empty-text">No appointments yet</p>:history.appointments.map(apt=>(
              <div key={apt._id} className="timeline-item"><div className="timeline-dot"/>
                <div className="timeline-content"><div className="timeline-header"><strong>{new Date(apt.date).toLocaleDateString()}</strong><Badge status={apt.status}/></div>
                  <p>Dr. {apt.doctorId?.name} ({apt.doctorId?.specialization})</p>
                  <p className="timeline-time">{apt.timeSlot}</p>
                  {apt.reason&&<p className="timeline-reason">Reason: {apt.reason}</p>}
                </div>
              </div>
            )))}
            {tab==='prescriptions'&&(history.prescriptions.length===0?<p className="empty-text">No prescriptions yet</p>:history.prescriptions.map(rx=>(
              <div key={rx._id} className="timeline-item"><div className="timeline-dot timeline-dot-green"/>
                <div className="timeline-content"><div className="timeline-header"><strong>{new Date(rx.createdAt).toLocaleDateString()}</strong><button className="btn btn-sm btn-outline" onClick={()=>downloadPDF(rx._id)}>📄 PDF</button></div>
                  <p>Dr. {rx.doctorId?.name}</p>
                  {rx.diagnosis&&<p><strong>Diagnosis:</strong> {rx.diagnosis}</p>}
                  <div className="med-list">{rx.medicines?.map((m,i)=><span key={i} className="med-tag">{m.name} — {m.dosage} — {m.frequency}</span>)}</div>
                  {rx.aiExplanation&&<details className="ai-explain-toggle"><summary>🤖 AI Explanation</summary><p>{rx.aiExplanation}</p></details>}
                </div>
              </div>
            )))}
            {tab==='diagnosisLogs'&&(history.diagnosisLogs.length===0?<p className="empty-text">No AI logs yet</p>:history.diagnosisLogs.map(log=>(
              <div key={log._id} className="timeline-item"><div className="timeline-dot timeline-dot-purple"/>
                <div className="timeline-content"><div className="timeline-header"><strong>{new Date(log.createdAt).toLocaleDateString()}</strong><Badge status={log.riskLevel}/></div>
                  <p><strong>Symptoms:</strong> {log.symptoms?.join(', ')}</p>
                  <p><strong>Conditions:</strong> {log.aiResponse?.possibleConditions?.join(', ')}</p>
                  <p><strong>Tests:</strong> {log.aiResponse?.suggestedTests?.join(', ')}</p>
                </div>
              </div>
            )))}
          </div>
        </div>
      </div>
    </div>
  );
}


