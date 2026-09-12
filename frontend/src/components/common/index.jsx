export const StatCard = ({ title, value, icon, color = 'blue', sub }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-body"><div className="stat-value">{value}</div><div className="stat-title">{title}</div>{sub && <div className="stat-sub">{sub}</div>}</div>
  </div>
);
export const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="loading-center"><div className="spinner" /><span>{text}</span></div>
);
export const Badge = ({ status }) => {
  const colors = { pending:'badge-yellow',confirmed:'badge-blue',completed:'badge-green',cancelled:'badge-red',low:'badge-green',medium:'badge-yellow',high:'badge-red',free:'badge-gray',pro:'badge-purple',admin:'badge-red',doctor:'badge-blue',receptionist:'badge-teal',patient:'badge-green',male:'badge-blue',female:'badge-purple',other:'badge-gray' };
  return <span className={`badge ${colors[status] || 'badge-gray'}`}>{status}</span>;
};
export const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return <div className="modal-overlay" onClick={onClose}><div className="modal" onClick={e => e.stopPropagation()}><div className="modal-header"><h3>{title}</h3><button className="modal-close" onClick={onClose}>✕</button></div><div className="modal-body">{children}</div></div></div>;
};
export const PageHeader = ({ title, subtitle, action }) => (
  <div className="page-header"><div><h1 className="page-title">{title}</h1>{subtitle && <p className="page-subtitle">{subtitle}</p>}</div>{action && <div>{action}</div>}</div>
);
export const EmptyState = ({ icon = '📭', message = 'No data found' }) => (
  <div className="empty-state"><div className="empty-icon">{icon}</div><p>{message}</p></div>
);