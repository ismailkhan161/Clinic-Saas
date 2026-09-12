import { useEffect, useState } from 'react';
import { appointmentAPI, aiAPI } from '../../api/services';
import { StatCard, LoadingSpinner, Badge, PageHeader, EmptyState } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [apts, setApts] = useState([]);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    Promise.all([
      appointmentAPI.getAll({ limit: 5 }),
      aiAPI.getTokenBalance(),
    ]).then(([a, t]) => {
      setApts(a.data.appointments || []);
      setTokenBalance(t.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <PageHeader title={`Welcome, ${user?.name}`} subtitle="Your health overview" />

      <div className="stats-grid">
        <StatCard title="My Appointments" value={apts.length} icon="📅" color="blue" />
        <StatCard
          title="Current Plan"
          value={user?.subscriptionPlan === 'pro' ? '⭐ Pro' : 'Free'}
          icon="💳"
          color={user?.subscriptionPlan === 'pro' ? 'purple' : 'amber'}
        />
        <StatCard
          title="AI Tokens"
          value={tokenBalance?.isPro ? 'Unlimited' : tokenBalance?.tokensRemaining ?? 0}
          icon="🤖"
          color={tokenBalance?.tokensRemaining === 0 && !tokenBalance?.isPro ? 'amber' : 'green'}
          sub={tokenBalance?.isPro ? 'Pro plan' : `${tokenBalance?.tokensUsed ?? 0} used`}
        />
      </div>

      {/* Plan Status Card */}
      {user?.subscriptionPlan !== 'pro' ? (
        <div className="upgrade-banner">
          <div className="upgrade-banner-left">
            <div className="upgrade-banner-icon">🚀</div>
            <div>
              <div className="upgrade-banner-title">You are on the Free Plan</div>
              <div className="upgrade-banner-sub">
                You have <strong>{tokenBalance?.tokensRemaining ?? 0} AI tokens</strong> remaining.
                Upgrade to Pro for unlimited AI prescription explanations in English & Urdu.
              </div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowUpgrade(!showUpgrade)}>
            {showUpgrade ? 'Hide Plans' : '⭐ View Pro Plans'}
          </button>
        </div>
      ) : (
        <div className="pro-banner">
          <div className="upgrade-banner-icon">⭐</div>
          <div>
            <div className="upgrade-banner-title">You are on the Pro Plan</div>
            <div className="upgrade-banner-sub">Enjoy unlimited AI features — prescription explanations in English & Urdu.</div>
          </div>
        </div>
      )}

      {/* Upgrade Plans */}
      {showUpgrade && (
        <div className="patient-plans-grid">
          <div className="patient-plan-card patient-plan-free">
            <h3>Free Plan</h3>
            <div className="patient-plan-price">PKR 0 / month</div>
            <ul className="plan-features" style={{ margin: '12px 0' }}>
              <li><span className="check">✓</span> View appointments</li>
              <li><span className="check">✓</span> Download PDF prescriptions</li>
              <li><span className="check">✓</span> 3 AI explanation tokens</li>
              <li className="disabled"><span>✗</span> Unlimited AI explanations</li>
              <li className="disabled"><span>✗</span> Urdu AI explanations</li>
            </ul>
            <div className="btn btn-outline btn-full" style={{ textAlign: 'center', cursor: 'default' }}>
              Current Plan
            </div>
          </div>
          <div className="patient-plan-card patient-plan-pro">
            <div className="popular-badge">Recommended</div>
            <h3>Pro Plan</h3>
            <div className="patient-plan-price">PKR 999 / month</div>
            <ul className="plan-features" style={{ margin: '12px 0' }}>
              <li><span className="check">✓</span> Everything in Free</li>
              <li><span className="check">✓</span> Unlimited AI explanations</li>
              <li><span className="check">✓</span> Urdu AI explanations</li>
              <li><span className="check">✓</span> Priority support</li>
            </ul>
            <button className="btn btn-primary btn-full" onClick={() => {
              toast.success('Contact admin to upgrade your plan to Pro!');
              setShowUpgrade(false);
            }}>
              Contact Admin to Upgrade
            </button>
          </div>
        </div>
      )}

      {/* Tokens info */}
      {!tokenBalance?.isPro && tokenBalance?.tokensRemaining === 0 && (
        <div className="token-empty-alert">
          <strong>🔒 AI tokens exhausted.</strong> Contact your admin to get more free tokens, or ask to upgrade to Pro.
        </div>
      )}

      <div className="card">
        <h3 className="card-title">Recent Appointments</h3>
        {apts.length === 0 ? (
          <EmptyState icon="📅" message="No appointments yet. Visit the clinic to book one." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr>
              </thead>
              <tbody>
                {apts.map(a => (
                  <tr key={a._id}>
                    <td>Dr. {a.doctorId?.name}</td>
                    <td>{new Date(a.date).toLocaleDateString()}</td>
                    <td>{a.timeSlot}</td>
                    <td><Badge status={a.status} /></td>
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