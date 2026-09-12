import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAPI } from '../../api/services';
import { PageHeader, Badge, LoadingSpinner, EmptyState } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
export default function PatientList() {
  const [patients,setPatients]=useState([]); const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState(''); const [page,setPage]=useState(1); const [totalPages,setTotalPages]=useState(1);
  const navigate=useNavigate(); const {user}=useAuth();
  const base=user?.role==='admin'?'/admin':'/receptionist';
  useEffect(()=>{
    const t=setTimeout(()=>{setLoading(true);patientAPI.getAll({search,page,limit:15}).then(r=>{setPatients(r.data.patients);setTotalPages(r.data.pages);}).finally(()=>setLoading(false));},300);
    return()=>clearTimeout(t);
  },[search,page]);
  return (
    <div className="page">
      <PageHeader title="All Patients" action={user?.role==='receptionist'&&<button className="btn btn-primary" onClick={()=>navigate('/receptionist/patients/new')}>➕ Register</button>}/>
      <div className="search-bar"><input placeholder="🔍 Search by name or contact..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></div>
      {loading?<LoadingSpinner/>:patients.length===0?<EmptyState icon="👥" message="No patients found"/>:(
        <>
          <div className="card"><div className="table-wrap"><table className="table"><thead><tr><th>Name</th><th>Age</th><th>Gender</th><th>Contact</th><th>Blood</th><th>Conditions</th><th>Actions</th></tr></thead><tbody>
            {patients.map(p=><tr key={p._id}><td><strong>{p.name}</strong></td><td>{p.age}</td><td><Badge status={p.gender}/></td><td>{p.contact}</td><td>{p.bloodGroup||'—'}</td><td>{p.chronicConditions?.join(', ')||'—'}</td><td><button className="btn btn-sm btn-outline" onClick={()=>navigate(`${base}/patients/${p._id}`)}>View History</button></td></tr>)}
          </tbody></table></div></div>
          {totalPages>1&&<div className="pagination"><button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="btn btn-sm btn-outline">← Prev</button><span>Page {page} of {totalPages}</span><button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="btn btn-sm btn-outline">Next →</button></div>}
        </>
      )}
    </div>
  );
}
