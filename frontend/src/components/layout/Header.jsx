import { useAuth } from '../../context/AuthContext';
export default function Header({ onMenuClick }) {
  const { user } = useAuth();
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return (
    <header className="header">
      <button className="menu-btn" onClick={onMenuClick}>☰</button>
      <div className="header-greeting">{greeting}, <strong>{user?.name}</strong></div>
      <div className="header-right">
        <span className={`plan-badge plan-${user?.subscriptionPlan}`}>{user?.subscriptionPlan === 'pro' ? '⭐ Pro' : 'Free'}</span>
        <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
      </div>
    </header>
  );
}