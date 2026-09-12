import { useEffect, useState } from 'react';
import { userAPI, aiAPI } from '../../api/services';
import { PageHeader, LoadingSpinner, EmptyState } from '../../components/common';
import toast from 'react-hot-toast';

export default function ManageTokens() {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null);
  const [inputs, setInputs] = useState({});
  const [tab, setTab] = useState('doctors');

  const load = async () => {
    setLoading(true);
    try {
      const [d, p] = await Promise.all([
        userAPI.getAll({ role: 'doctor' }),
        userAPI.getAll({ role: 'patient' }),
      ]);
      setDoctors(d.data || []);
      setPatients(p.data || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (user) => {
    const val = inputs[user._id];
    const num = parseInt(val, 10);

    if (!val || isNaN(num) || num <= 0) {
      return toast.error('Please enter a valid number of tokens');
    }

    setAdding(user._id);
    try {
      // Pass exactly userId and tokens as numbers
      const res = await aiAPI.addTokens(user._id, num);
      toast.success(`✅ ${res.data.message}`);
      // Clear input for this user
      setInputs(prev => ({ ...prev, [user._id]: '' }));
      // Reload to show updated balance
      load();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add tokens';
      toast.error('❌ ' + msg);
      console.error('addTokens error:', err.response?.data);
    } finally {
      setAdding(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  const list = tab === 'doctors' ? doctors : patients;

  return (
    <div className="page">
      <PageHeader
        title="🎫 AI Token Management"
        subtitle="Add free AI tokens to doctors and patients"
      />

      {/* Info Cards */}
      <div className="token-info-cards">
        <div className="token-info-card token-info-blue">
          <div className="token-info-icon">👨‍⚕️</div>
          <div>
            <div className="token-info-title">Doctors — Free</div>
            <div className="token-info-sub">Start with 10 tokens. Each AI symptom check = 1 token.</div>
          </div>
        </div>
        <div className="token-info-card token-info-green">
          <div className="token-info-icon">👥</div>
          <div>
            <div className="token-info-title">Patients — Free</div>
            <div className="token-info-sub">Start with 3 tokens. Each AI explanation = 1 token.</div>
          </div>
        </div>
        <div className="token-info-card token-info-purple">
          <div className="token-info-icon">⭐</div>
          <div>
            <div className="token-info-title">Pro Plan</div>
            <div className="token-info-sub">Unlimited AI. No tokens deducted ever.</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="tab-bar" style={{ marginBottom: '16px' }}>
          <button
            className={`tab ${tab === 'doctors' ? 'tab-active' : ''}`}
            onClick={() => setTab('doctors')}>
            👨‍⚕️ Doctors <span className="tab-count">{doctors.length}</span>
          </button>
          <button
            className={`tab ${tab === 'patients' ? 'tab-active' : ''}`}
            onClick={() => setTab('patients')}>
            👥 Patients <span className="tab-count">{patients.length}</span>
          </button>
        </div>

        {list.length === 0 ? (
          <EmptyState icon="📭" message={`No ${tab} registered yet`} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Tokens Left</th>
                  <th>Used</th>
                  <th>Add Tokens</th>
                </tr>
              </thead>
              <tbody>
                {list.map(u => {
                  const isPro = u.subscriptionPlan === 'pro';
                  const tokens = u.aiTokens ?? 0;
                  const isEmpty = tokens === 0 && !isPro;
                  const isLow = tokens <= 3 && tokens > 0 && !isPro;

                  return (
                    <tr key={u._id}>
                      <td>
                        <strong>
                          {tab === 'doctors' ? `Dr. ${u.name}` : u.name}
                        </strong>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${isPro ? 'badge-purple' : 'badge-gray'}`}>
                          {isPro ? '⭐ Pro' : 'Free'}
                        </span>
                      </td>
                      <td>
                        {isPro
                          ? <span className="badge badge-green">Unlimited</span>
                          : <span className={`token-count ${isEmpty ? 'token-empty' : isLow ? 'token-low' : 'token-ok'}`}>
                              {tokens} tokens
                            </span>
                        }
                      </td>
                      <td>{u.aiTokensUsed ?? 0} used</td>
                      <td>
                        {isPro ? (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Pro — no limit</span>
                        ) : (
                          <div className="token-add-row">
                            <input
                              type="number"
                              min="1"
                              max="999"
                              placeholder="e.g. 10"
                              value={inputs[u._id] || ''}
                              onChange={e =>
                                setInputs(prev => ({ ...prev, [u._id]: e.target.value }))
                              }
                              onKeyDown={e => e.key === 'Enter' && handleAdd(u)}
                              className="token-input"
                            />
                            <button
                              className="btn btn-sm btn-primary"
                              disabled={adding === u._id}
                              onClick={() => handleAdd(u)}
                            >
                              {adding === u._id ? '...' : '+ Add'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}