import { useEffect, useState } from 'react';
import { prescriptionAPI, aiAPI } from '../../api/services';
import { PageHeader, LoadingSpinner, EmptyState } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
export default function PatientPrescriptions() {
  const {user}=useAuth();
  const [prescriptions,setPrescriptions]=useState([]); const [loading,setLoading]=useState(true);
  const [explaining,setExplaining]=useState(null); const [explanations,setExplanations]=useState({});
  useEffect(()=>{prescriptionAPI.getAll({limit:50}).then(r=>setPrescriptions(r.data.prescriptions)).finally(()=>setLoading(false));},[]);
  const downloadPDF=async(id)=>{
    try { const res=await prescriptionAPI.downloadPDF(id); const url=URL.createObjectURL(new Blob([res.data],{type:'application/pdf'})); const a=document.createElement('a');a.href=url;a.download=`prescription-${id}.pdf`;a.click(); toast.success('PDF downloaded!'); }
    catch { toast.error('Download failed'); }
  };
  const getExplanation=async(id,lang='english')=>{
    if(user?.subscriptionPlan!=='pro'){toast.error('Upgrade to Pro for AI explanations');return;}
    setExplaining(id);
    try { const res=await aiAPI.explainPrescription({prescriptionId:id,language:lang}); setExplanations(prev=>({...prev,[id]:{text:res.data.explanation,lang}})); toast.success('AI explanation ready!'); }
    catch { toast.error('AI failed'); } finally { setExplaining(null); }
  };
  if(loading) return <LoadingSpinner/>;
  return (
    <div className="page">
      <PageHeader title="My Prescriptions" subtitle={`${prescriptions.length} prescriptions`}/>
      {prescriptions.length===0?<EmptyState icon="💊" message="No prescriptions yet"/>:(
        <div className="prescriptions-list">
          {prescriptions.map(rx=>(
            <div key={rx._id} className="card rx-card">
              <div className="rx-header">
                <div><h3>Dr. {rx.doctorId?.name}</h3><span className="rx-date">{new Date(rx.createdAt).toLocaleDateString()}</span></div>
                <div className="rx-actions">
                  <button className="btn btn-sm btn-outline" onClick={()=>downloadPDF(rx._id)}>📄 Download PDF</button>
                  {user?.subscriptionPlan==='pro'&&<><button className="btn btn-sm btn-primary" disabled={explaining===rx._id} onClick={()=>getExplanation(rx._id,'english')}>{explaining===rx._id?'...':'🤖 Explain (EN)'}</button><button className="btn btn-sm btn-outline" disabled={explaining===rx._id} onClick={()=>getExplanation(rx._id,'urdu')}>🤖 اردو</button></>}
                </div>
              </div>
              {rx.diagnosis&&<p className="rx-diagnosis"><strong>Diagnosis:</strong> {rx.diagnosis}</p>}
              <div className="medicines-grid">
                {rx.medicines?.map((m,i)=><div key={i} className="medicine-card"><div className="med-name">💊 {m.name}</div><div className="med-detail">Dosage: {m.dosage}</div><div className="med-detail">Frequency: {m.frequency}</div><div className="med-detail">Duration: {m.duration}</div>{m.instructions&&<div className="med-note">📝 {m.instructions}</div>}</div>)}
              </div>
              {rx.instructions&&<div className="rx-instructions"><strong>Instructions:</strong> {rx.instructions}</div>}
              {rx.followUpDate&&<div className="rx-followup">📅 Follow-up: {new Date(rx.followUpDate).toLocaleDateString()}</div>}
              {explanations[rx._id]&&<div className="ai-explanation-box"><h4>🤖 AI Explanation {explanations[rx._id].lang==='urdu'?'(اردو)':'(English)'}</h4><p>{explanations[rx._id].text}</p></div>}
              {user?.subscriptionPlan!=='pro'&&<div className="upgrade-hint">🔒 Upgrade to Pro for AI explanations in English & Urdu</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
