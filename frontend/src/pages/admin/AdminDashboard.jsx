import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyticsAPI } from '../../api/services';
import { StatCard, LoadingSpinner, PageHeader, Badge } from '../../components/common';
import toast from 'react-hot-toast';
const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6'];
export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { analyticsAPI.admin().then(r=>setData(r.data)).catch(()=>toast.error('Failed to load')).finally(()=>setLoading(false)); }, []);
  if (loading) return <LoadingSpinner text="Loading analytics..." />;
  if (!data) return null;
  const pieData = data.appointmentsByStatus?.map(s=>({name:s._id,value:s.count}));
  return (
    <div className="page">
      <PageHeader title="Admin Dashboard" subtitle="Clinic overview & analytics" />
      <div className="stats-grid">
        <StatCard title="Total Patients" value={data.totalPatients} icon="👥" color="blue"/>
        <StatCard title="Total Doctors" value={data.totalDoctors} icon="👨‍⚕️" color="green"/>
        <StatCard title="This Month" value={data.monthlyAppointments} icon="📅" color="purple" sub="appointments"/>
        <StatCard title="Revenue (Sim.)" value={`PKR ${(data.revenue?.monthly||0).toLocaleString()}`} icon="💰" color="amber" sub="this month"/>
      </div>
      <div className="charts-grid">
        <div className="card">
          <h3 className="card-title">Monthly Appointments (6 months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.monthlyData}><XAxis dataKey="month" tick={{fontSize:12}}/><YAxis tick={{fontSize:12}}/><Tooltip/><Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]}/></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="card-title">Appointments by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value})=>`${name}(${value})`}>{pieData?.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip/></PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="cards-row">
        <div className="card card-half">
          <h3 className="card-title">Recent Patients</h3>
          <div className="table-wrap"><table className="table"><thead><tr><th>Name</th><th>Age</th><th>Gender</th><th>Joined</th></tr></thead><tbody>
            {data.recentPatients?.map(p=><tr key={p._id}><td><strong>{p.name}</strong></td><td>{p.age}</td><td><Badge status={p.gender}/></td><td>{new Date(p.createdAt).toLocaleDateString()}</td></tr>)}
          </tbody></table></div>
        </div>
        <div className="card card-half">
          <h3 className="card-title">Top AI Diagnoses</h3>
          {data.topDiagnoses?.length>0?data.topDiagnoses.map((d,i)=><div key={i} className="diagnosis-item"><span className="diagnosis-rank">#{i+1}</span><span className="diagnosis-name">{d._id}</span><span className="diagnosis-count">{d.count} cases</span></div>):<p className="empty-text">No AI diagnoses yet</p>}
        </div>
      </div>
    </div>
  );
}
