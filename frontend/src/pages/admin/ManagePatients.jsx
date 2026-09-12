import { useEffect, useState } from 'react';
import { userAPI } from '../../api/services';
import { PageHeader, Badge, LoadingSpinner, EmptyState, Modal } from '../../components/common';
import toast from 'react-hot-toast';

export default function ManagePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    userAPI.getAll({ role: 'patient' })
      .then(r => setPatients(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDeactivate = async (user) => {
    try {
      await userAPI.update(user._id, { isActive: !user.isActive });
      toast.success(`${user.name} ${user.isActive ? 'deactivated' : 'reactivated'}`);
      load();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      await userAPI.delete(selected._id);
      toast.success(`${selected.name} permanently removed`);
      setDeleteModal(false);
      setSelected(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally { setDeleting(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <PageHeader title="Manage Patients" subtitle={`${patients.length} registered patients`} />

      {patients.length === 0 ? <EmptyState icon="👥" message="No patients registered yet" /> : (
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Registered</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p._id}>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.email}</td>
                    <td>{p.phone || '—'}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td><Badge status={p.isActive ? 'confirmed' : 'cancelled'} /></td>
                    <td className="actions">
                      <button
                        className={`btn btn-sm ${p.isActive ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleDeactivate(p)}>
                        {p.isActive ? '⏸ Deactivate' : '▶ Activate'}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => { setSelected(p); setDeleteModal(true); }}>
                        🗑 Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="⚠️ Confirm Delete">
        <div className="delete-confirm">
          <p>Are you sure you want to <strong>permanently remove</strong> <span className="text-danger">{selected?.name}</span>?</p>
          <p className="delete-warning">This will delete their account and all associated records. This action <strong>cannot be undone</strong>.</p>
          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button className="btn btn-outline" onClick={() => setDeleteModal(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Removing...' : '🗑 Yes, Remove Permanently'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}