import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../../api/services';
import { PageHeader, Badge, LoadingSpinner, EmptyState } from '../../components/common';
import toast from 'react-hot-toast';
export default function DoctorAppointments() {
  const [appointments,setAppointments]=useState([]); const [loading,setLoading]=useState(true); const [filter,setFilter]=useState('all');
  const navigate=useNavigate();
  const load=()=>{const params=filter!=='all'?{status:filter}:{};appointmentAPI.getAll(params).then(r=>setAppointments(r.data.appointments)).finally(()=>setLoading(false));};
  useEffect(()=>{load();},[filter]);
  const updateStatus=async(id,status)=>{await appointmentAPI.update(id,{status});toast.success('Updated');load();};
  if(loading) return <LoadingSpinner/>;
  return (
    <div className="page">
      <PageHeader title="My Appointments" subtitle={`${appointments.length} appointments`}/>
      <div className="filter-tabs">{['all','pending','confirmed','completed','cancelled'].map(f=><button key={f} className={`filter-tab ${filter===f?'active':''}`} onClick={()=>setFilter(f)}>{f}</button>)}</div>
      {appointments.length===0?<EmptyState icon="📅" message="No appointments found"/>:(
        <div className="card"><div className="table-wrap"><table className="table"><thead><tr><th>Patient</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {appointments.map(apt=><tr key={apt._id}><td><strong>{apt.patientId?.name}</strong><br/><small>{apt.patientId?.age}y, {apt.patientId?.gender}</small></td><td>{new Date(apt.date).toLocaleDateString()}</td><td>{apt.timeSlot}</td><td>{apt.reason||'—'}</td><td><Badge status={apt.status}/></td><td className="actions">
            {apt.status==='pending'&&<button className="btn btn-sm btn-outline" onClick={()=>updateStatus(apt._id,'confirmed')}>Confirm</button>}
            {apt.status==='confirmed'&&<><button className="btn btn-sm btn-success" onClick={()=>updateStatus(apt._id,'completed')}>Complete</button><button className="btn btn-sm btn-primary" onClick={()=>navigate(`/doctor/prescriptions/new?patientId=${apt.patientId?._id}&aptId=${apt._id}`)}>Prescribe</button></>}
          </td></tr>)}
        </tbody></table></div></div>
      )}
    </div>
  );
}
