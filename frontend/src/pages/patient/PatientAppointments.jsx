import { useEffect, useState } from 'react';
import { appointmentAPI } from '../../api/services';
import { PageHeader, Badge, LoadingSpinner, EmptyState } from '../../components/common';
export default function PatientAppointments() {
  const [appointments,setAppointments]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{appointmentAPI.getAll({limit:50}).then(r=>setAppointments(r.data.appointments)).finally(()=>setLoading(false));},[]);
  if(loading) return <LoadingSpinner/>;
  return (
    <div className="page">
      <PageHeader title="My Appointments" subtitle={`${appointments.length} total`}/>
      {appointments.length===0?<EmptyState icon="📅" message="No appointments yet"/>:(
        <div className="card"><div className="table-wrap"><table className="table"><thead><tr><th>Doctor</th><th>Specialization</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th></tr></thead><tbody>
          {appointments.map(a=><tr key={a._id}><td><strong>Dr. {a.doctorId?.name}</strong></td><td>{a.doctorId?.specialization||'—'}</td><td>{new Date(a.date).toLocaleDateString()}</td><td>{a.timeSlot}</td><td>{a.reason||'—'}</td><td><Badge status={a.status}/></td></tr>)}
        </tbody></table></div></div>
      )}
    </div>
  );
}
