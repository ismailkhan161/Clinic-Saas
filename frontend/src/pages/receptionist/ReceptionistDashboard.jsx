import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAPI, appointmentAPI } from '../../api/services';
import { StatCard, LoadingSpinner, Badge, PageHeader } from '../../components/common';
export default function ReceptionistDashboard() {
  const [stats,setStats]=useState({patients:0,todayApts:0});
  const [todayApts,setTodayApts]=useState([]);
  const [loading,setLoading]=useState(true);
  const navigate=useNavigate();
  useEffect(()=>{
    const today=new Date().toISOString().split('T')[0];
    Promise.all([patientAPI.getAll({limit:1}),appointmentAPI.getAll({date:today,limit:50})])
      .then(([p,a])=>{setStats({patients:p.data.total,todayApts:a.data.total});setTodayApts(a.data.appointments);})
      .finally(()=>setLoading(false));
  },[]);
  if(loading) return <LoadingSpinner/>;
  return (
    <div className="page">
      <PageHeader title="Receptionist Dashboard" subtitle="Today's clinic overview"/>
      <div className="stats-grid">
        <StatCard title="Total Patients" value={stats.patients} icon="👥" color="blue"/>
        <StatCard title="Today's Appointments" value={stats.todayApts} icon="📅" color="green"/>
      </div>
      <div className="quick-actions">
        <button className="quick-btn" onClick={()=>navigate('/receptionist/patients/new')}>➕ Register Patient</button>
        <button className="quick-btn" onClick={()=>navigate('/receptionist/appointments/new')}>📅 Book Appointment</button>
        <button className="quick-btn" onClick={()=>navigate('/receptionist/patients')}>👥 View All Patients</button>
      </div>
      <div className="card">
        <h3 className="card-title">Today's Appointments</h3>
        {todayApts.length===0?<p className="empty-text">No appointments today</p>:(
          <div className="table-wrap"><table className="table"><thead><tr><th>Patient</th><th>Doctor</th><th>Time</th><th>Status</th></tr></thead><tbody>
            {todayApts.map(apt=><tr key={apt._id}><td><strong>{apt.patientId?.name}</strong></td><td>Dr. {apt.doctorId?.name}</td><td>{apt.timeSlot}</td><td><Badge status={apt.status}/></td></tr>)}
          </tbody></table></div>
        )}
      </div>
    </div>
  );
}