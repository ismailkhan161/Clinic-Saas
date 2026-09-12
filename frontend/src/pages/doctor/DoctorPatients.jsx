import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAPI } from '../../api/services';
import { PageHeader, LoadingSpinner, EmptyState, Badge } from '../../components/common';
export default function DoctorPatients() {
  const [patients,setPatients]=useState([]); const [loading,setLoading]=useState(true); const [search,setSearch]=useState('');
  const navigate=useNavigate();
  useEffect(()=>{const t=setTimeout(()=>{setLoading(true);patientAPI.getAll({search,limit:50}).then(r=>setPatients(r.data.patients)).finally(()=>setLoading(false));},300);return()=>clearTimeout(t);},[search]);
  return (
    <div className="page">
      <PageHeader title="Patients" subtitle={`${patients.length} patients`}/>
      <div className="search-bar"><input placeholder="🔍 Search by name or contact..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
      {loading?<LoadingSpinner/>:patients.length===0?<EmptyState icon="👥" message="No patients found"/>:(
        <div className="card"><div className="table-wrap"><table className="table"><thead><tr><th>Name</th><th>Age</th><th>Gender</th><th>Contact</th><th>Blood</th><th>Actions</th></tr></thead><tbody>
          {patients.map(p=><tr key={p._id}><td><strong>{p.name}</strong></td><td>{p.age}</td><td><Badge status={p.gender}/></td><td>{p.contact}</td><td>{p.bloodGroup||'—'}</td><td><button className="btn btn-sm btn-outline" onClick={()=>navigate(`/doctor/patients/${p._id}`)}>View</button><button className="btn btn-sm btn-primary" onClick={()=>navigate(`/doctor/prescriptions/new?patientId=${p._id}`)}>Prescribe</button></td></tr>)}
        </tbody></table></div></div>
      )}
    </div>
  );
}
