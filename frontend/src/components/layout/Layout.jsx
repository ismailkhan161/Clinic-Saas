import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useState } from 'react';
export default function Layout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="layout">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="layout-main">
        <Header onMenuClick={() => setOpen(true)} />
        <main className="layout-content"><Outlet /></main>
      </div>
    </div>
  );
}