import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsAPI, appointmentAPI } from '../../api/services';
import { StatCard, LoadingSpinner, Badge, PageHeader } from '../../components/common';
import toast from 'react-hot-toast';
export default function DoctorDashboard() {
  const [stats,setStats]=useState(null); const [todayApts,setTodayApts]=useState([]); const [loading,setLoading]=useState(true);
  const navigate=useNavigate();
  useEffect(()=>{
    const today=new Date().toISOString().split('T')[0];
    Promise.all([analyticsAPI.doctor(),appointmentAPI.getSchedule({date:today})])
      .then(([s,a])=>{setStats(s.data);setTodayApts(a.data);}).catch(()=>toast.error('Failed to load')).finally(()=>setLoading(false));
  },[]);
  const updateStatus=async(id,status)=>{await appointmentAPI.update(id,{status});setTodayApts(prev=>prev.map(a=>a._id===id?{...a,status}:a));toast.success('Updated');};
  if(loading) return <LoadingSpinner text="Loading dashboard..."/>;
  return (
    <div className="page">
      <PageHeader title="Doctor Dashboard" subtitle="Your daily overview"/>
      <div className="stats-grid">
        <StatCard title="Today's Appointments" value={stats?.todayAppointments??0} icon="📅" color="blue"/>
        <StatCard title="Completed Today" value={stats?.completedToday??0} icon="✅" color="green"/>
        <StatCard title="This Month" value={stats?.monthlyAppointments??0} icon="📆" color="purple"/>
        <StatCard title="Total Prescriptions" value={stats?.totalPrescriptions??0} icon="💊" color="amber"/>
      </div>
      <div className="charts-grid">
        <div className="card">
          <h3 className="card-title">Appointments — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={200}><BarChart data={stats?.weeklyData||[]}><XAxis dataKey="day" tick={{fontSize:12}}/><YAxis tick={{fontSize:12}}/><Tooltip/><Bar dataKey="count" fill="#10b981" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-header-row"><h3 className="card-title">Today's Schedule</h3><button className="btn btn-sm btn-primary" onClick={()=>navigate('/doctor/ai/symptoms')}>🤖 AI Checker</button></div>
          {todayApts.length===0?<p className="empty-text">No appointments today</p>:(
            <div className="apt-list">{todayApts.map(apt=>(
              <div key={apt._id} className="apt-item">
                <div className="apt-info"><strong>{apt.patientId?.name}</strong><span className="apt-time">{apt.timeSlot}</span><Badge status={apt.status}/></div>
                <div className="apt-actions">
                  {apt.status==='confirmed'&&<><button className="btn btn-sm btn-success" onClick={()=>updateStatus(apt._id,'completed')}>Done</button><button className="btn btn-sm btn-primary" onClick={()=>navigate(`/doctor/prescriptions/new?aptId=${apt._id}&patientId=${apt.patientId?._id}`)}>Prescribe</button></>}
                  {apt.status==='pending'&&<button className="btn btn-sm btn-outline" onClick={()=>updateStatus(apt._id,'confirmed')}>Confirm</button>}
                </div>
              </div>
            ))}</div>
          )}
        </div>
      </div>
    </div>
  );
}
