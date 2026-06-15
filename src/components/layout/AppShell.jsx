/**
 * AppShell Component — SIMAP Digital
 * Main layout wrapper with header, content area, and bottom navigation
 */

import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import './AppShell.css';

export default function AppShell() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
