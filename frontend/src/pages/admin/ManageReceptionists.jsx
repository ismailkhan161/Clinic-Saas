import { useEffect, useState } from 'react';
import { userAPI } from '../../api/services';
import { PageHeader, Badge, LoadingSpinner, EmptyState, Modal } from '../../components/common';
import toast from 'react-hot-toast';

export default function ManageReceptionists() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => userAPI.getAll({ role: 'receptionist' }).then(r => setList(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const toggleActive = async (user) => {
    await userAPI.update(user._id, { isActive: !user.isActive });
    toast.success(`${user.name} ${user.isActive ? 'deactivated' : 'reactivated'}`);
    load();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userAPI.delete(selected._id);
      toast.success(`${selected.name} permanently removed`);
      setDeleteModal(false); setSelected(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setDeleting(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <PageHeader title="Manage Receptionists" subtitle={`${list.length} receptionists`} />
      {list.length === 0 ? <EmptyState icon="🗂️" message="No receptionists registered yet" /> : (
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Registered</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {list.map(r => (
                  <tr key={r._id}>
                    <td><strong>{r.name}</strong></td>
                    <td>{r.email}</td>
                    <td>{r.phone || '—'}</td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td><Badge status={r.isActive ? 'confirmed' : 'cancelled'} /></td>
                    <td className="actions">
                      <button className={`btn btn-sm ${r.isActive ? 'btn-warning' : 'btn-success'}`} onClick={() => toggleActive(r)}>
                        {r.isActive ? '⏸ Deactivate' : '▶ Activate'}
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => { setSelected(r); setDeleteModal(true); }}>🗑 Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="⚠️ Confirm Remove">
        <div className="delete-confirm">
          <p>Permanently remove <strong>{selected?.name}</strong>?</p>
          <p className="delete-warning">This cannot be undone.</p>
          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button className="btn btn-outline" onClick={() => setDeleteModal(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Removing...' : '🗑 Remove'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}