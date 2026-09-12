import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
    { to: '/admin/patients', label: 'Patients', icon: '👥' },
    { to: '/admin/doctors', label: 'Doctors', icon: '👨‍⚕️' },
    { to: '/admin/receptionists', label: 'Receptionists', icon: '🗂️' },
    { to: '/admin/tokens', label: 'AI Tokens', icon: '🎫' },
    { to: '/admin/subscriptions', label: 'Subscriptions', icon: '💳' },
  ],
  doctor: [
    { to: '/doctor', label: 'Dashboard', icon: '📊', end: true },
    { to: '/doctor/appointments', label: 'Appointments', icon: '📅' },
    { to: '/doctor/patients', label: 'My Patients', icon: '👥' },
    { to: '/doctor/prescriptions/new', label: 'Write Prescription', icon: '📝' },
    { to: '/doctor/ai/symptoms', label: 'AI Symptom Checker', icon: '🤖' },
  ],
  receptionist: [
    { to: '/receptionist', label: 'Dashboard', icon: '📊', end: true },
    { to: '/receptionist/patients', label: 'All Patients', icon: '👥' },
    { to: '/receptionist/patients/new', label: 'Register Patient', icon: '➕' },
    { to: '/receptionist/appointments/new', label: 'Book Appointment', icon: '📅' },
  ],
  patient: [
    { to: '/patient', label: 'Dashboard', icon: '🏠', end: true },
    { to: '/patient/appointments', label: 'My Appointments', icon: '📅' },
    { to: '/patient/prescriptions', label: 'My Prescriptions', icon: '💊' },
  ],
};

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const items = navItems[user?.role] || [];

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <span>🏥</span>
          <span className="logo-text">MediCare</span>
        </div>
        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {items.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={onClose}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={logout}>🚪 Logout</button>
      </aside>
    </>
  );
}