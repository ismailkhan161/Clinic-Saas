import { useEffect, useState } from 'react';
import { userAPI } from '../../api/services';
import { PageHeader, LoadingSpinner, Badge } from '../../components/common';
import toast from 'react-hot-toast';

const PLAN_FEATURES = {
  free: {
    label: 'Free Plan',
    price: 'PKR 0 / month',
    color: 'plan-free-card',
    features: ['Up to 50 patients', 'Basic appointments', 'PDF prescription download', '10 AI tokens (doctors)', '3 AI tokens (patients)'],
    locked: ['Unlimited patients', 'Unlimited AI access', 'Predictive analytics', 'Priority support'],
  },
  pro: {
    label: 'Pro Plan',
    price: 'PKR 2,999 / month',
    color: 'plan-pro-card',
    features: ['Unlimited patients', 'All appointment features', 'PDF prescription download', 'Unlimited AI Symptom Checker', 'AI Explanation in English & Urdu', 'Risk Flagging system', 'Predictive Analytics', 'Priority support'],
    locked: [],
  },
};

export default function SubscriptionPlans() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [tab, setTab] = useState('doctors');

  const load = async () => {
    setLoading(true);
    const [d, p] = await Promise.all([
      userAPI.getAll({ role: 'doctor' }),
      userAPI.getAll({ role: 'patient' }),
    ]);
    setUsers({ doctors: d.data, patients: p.data });
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const changePlan = async (userId, name, newPlan) => {
    setUpdating(userId);
    try {
      await userAPI.update(userId, { subscriptionPlan: newPlan });
      toast.success(`${name} moved to ${newPlan === 'pro' ? '⭐ Pro' : 'Free'} plan`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update plan');
    } finally { setUpdating(null); }
  };

  if (loading) return <LoadingSpinner />;

  const currentUsers = tab === 'doctors' ? users.doctors : users.patients;
  const freeCount = currentUsers?.filter(u => u.subscriptionPlan === 'free').length || 0;
  const proCount = currentUsers?.filter(u => u.subscriptionPlan === 'pro').length || 0;

  return (
    <div className="page">
      <PageHeader title="Subscription Plans" subtitle="Manage user subscription plans" />

      {/* Plan Overview Cards */}
      <div className="plans-overview">
        {Object.entries(PLAN_FEATURES).map(([key, plan]) => (
          <div key={key} className={`plan-overview-card ${plan.color}`}>
            <div className="plan-overview-header">
              <h3 className="plan-overview-name">{plan.label}</h3>
              <span className="plan-overview-price">{plan.price}</span>
            </div>
            <ul className="plan-overview-features">
              {plan.features.map(f => <li key={f}><span className="check">✓</span> {f}</li>)}
              {plan.locked.map(f => <li key={f} className="locked"><span>✗</span> {f}</li>)}
            </ul>
          </div>
        ))}
      </div>

      {/* User Plan Management */}
      <div className="card">
        <div className="card-header-row">
          <h3 className="card-title">Manage User Plans</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-gray">Free: {freeCount}</span>
            <span className="badge badge-purple">Pro: {proCount}</span>
          </div>
        </div>

        <div className="tab-bar" style={{ marginBottom: '16px' }}>
          <button className={`tab ${tab === 'doctors' ? 'tab-active' : ''}`} onClick={() => setTab('doctors')}>
            👨‍⚕️ Doctors <span className="tab-count">{users.doctors?.length}</span>
          </button>
          <button className={`tab ${tab === 'patients' ? 'tab-active' : ''}`} onClick={() => setTab('patients')}>
            👥 Patients <span className="tab-count">{users.patients?.length}</span>
          </button>
        </div>

        {currentUsers?.length === 0 ? (
          <p className="empty-text">No {tab} registered yet</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  {tab === 'doctors' && <th>Specialization</th>}
                  <th>Current Plan</th>
                  <th>Status</th>
                  <th>Change Plan</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map(u => (
                  <tr key={u._id}>
                    <td><strong>{tab === 'doctors' ? `Dr. ${u.name}` : u.name}</strong></td>
                    <td>{u.email}</td>
                    {tab === 'doctors' && <td>{u.specialization || '—'}</td>}
                    <td>
                      <span className={`badge ${u.subscriptionPlan === 'pro' ? 'badge-purple' : 'badge-gray'}`}>
                        {u.subscriptionPlan === 'pro' ? '⭐ Pro' : 'Free'}
                      </span>
                    </td>
                    <td><Badge status={u.isActive ? 'confirmed' : 'cancelled'} /></td>
                    <td>
                      <div className="plan-toggle-btns">
                        <button
                          className={`btn btn-sm ${u.subscriptionPlan === 'free' ? 'btn-primary' : 'btn-outline'}`}
                          disabled={u.subscriptionPlan === 'free' || updating === u._id}
                          onClick={() => changePlan(u._id, u.name, 'free')}>
                          {updating === u._id ? '...' : 'Free'}
                        </button>
                        <button
                          className={`btn btn-sm ${u.subscriptionPlan === 'pro' ? 'btn-primary' : 'btn-success'}`}
                          disabled={u.subscriptionPlan === 'pro' || updating === u._id}
                          onClick={() => changePlan(u._id, u.name, 'pro')}>
                          {updating === u._id ? '...' : '⭐ Pro'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}