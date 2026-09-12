import { useEffect, useState } from 'react';
import { userAPI } from '../../api/services';
import { PageHeader, Badge, Modal, LoadingSpinner, EmptyState } from '../../components/common';
import toast from 'react-hot-toast';

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planModal, setPlanModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => userAPI.getAll({ role: 'doctor' }).then(r => setDoctors(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const toggleActive = async (doc) => {
    await userAPI.update(doc._id, { isActive: !doc.isActive });
    toast.success(`Dr. ${doc.name} ${doc.isActive ? 'deactivated' : 'reactivated'}`);
    load();
  };

  const updatePlan = async (doc, plan) => {
    await userAPI.update(doc._id, { subscriptionPlan: plan });
    toast.success('Plan updated'); load(); setPlanModal(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userAPI.delete(selected._id);
      toast.success(`Dr. ${selected.name} permanently removed`);
      setDeleteModal(false); setSelected(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setDeleting(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <PageHeader title="Manage Doctors" subtitle={`${doctors.length} doctors`} />
      {doctors.length === 0 ? <EmptyState icon="👨‍⚕️" message="No doctors registered yet" /> : (
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Specialization</th><th>Phone</th><th>Plan</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {doctors.map(d => (
                  <tr key={d._id}>
                    <td><strong>Dr. {d.name}</strong></td>
                    <td>{d.email}</td>
                    <td>{d.specialization || '—'}</td>
                    <td>{d.phone || '—'}</td>
                    <td><Badge status={d.subscriptionPlan} /></td>
                    <td><Badge status={d.isActive ? 'confirmed' : 'cancelled'} /></td>
                    <td className="actions">
                      <button className="btn btn-sm btn-outline" onClick={() => { setSelected(d); setPlanModal(true); }}>Edit Plan</button>
                      <button className={`btn btn-sm ${d.isActive ? 'btn-warning' : 'btn-success'}`} onClick={() => toggleActive(d)}>
                        {d.isActive ? '⏸ Deactivate' : '▶ Activate'}
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => { setSelected(d); setDeleteModal(true); }}>🗑 Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={planModal} onClose={() => setPlanModal(false)} title="Update Subscription Plan">
        {selected && (
          <div>
            <p style={{ marginBottom: '16px', color: '#64748b' }}>Update plan for <strong>Dr. {selected.name}</strong></p>
            <div className="plan-btns">
              <button className={`btn ${selected.subscriptionPlan === 'free' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => updatePlan(selected, 'free')}>Free Plan</button>
              <button className={`btn ${selected.subscriptionPlan === 'pro' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => updatePlan(selected, 'pro')}>⭐ Pro Plan</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="⚠️ Confirm Remove Doctor">
        <div className="delete-confirm">
          <p>Permanently remove <strong>Dr. {selected?.name}</strong> from the system?</p>
          <p className="delete-warning">Their account will be deleted. All appointments and prescriptions they created will remain for records.</p>
          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button className="btn btn-outline" onClick={() => setDeleteModal(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Removing...' : '🗑 Remove Doctor'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}