/**
 * BottomNav Component — JAAR Digital
 * Role-based bottom navigation bar with glassmorphism
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './BottomNav.css';

const NAV_ITEMS = {
  cobrador: [
    { path: '/cobros', icon: '💧', label: 'Cobros' },
    { path: '/jornales', icon: '⛏️', label: 'Jornales' },
    { path: '/gastos', icon: '🧾', label: 'Gastos' },
    { path: '/comisiones', icon: '💰', label: 'Ganancia' },
    { path: '/reporte', icon: '📊', label: 'MINSA' },
  ],
  cliente: [
    { path: '/historial', icon: '👤', label: 'Mi Cuenta' },
    { path: '/foro', icon: '📢', label: 'Avisos' },
    { path: '/chat', icon: '💬', label: 'Mensajes' },
  ],
  minsa: [
    { path: '/reporte', icon: '📊', label: 'Reportes' },
  ],
  admin: [
    { path: '/admin', icon: '🛡️', label: 'Usuarios' },
    { path: '/puntos-admin', icon: '⚙️', label: 'Config' },
  ],
};

export default function BottomNav() {
  const { role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!role) return null;

  const items = NAV_ITEMS[role] || [];

  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {items.map((item) => (
        <button
          key={item.path}
          className={`nav-item ${location.pathname === item.path ? 'nav-active' : ''}`}
          onClick={() => navigate(item.path)}
          aria-current={location.pathname === item.path ? 'page' : undefined}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
          {location.pathname === item.path && <span className="nav-indicator" />}
        </button>
      ))}
      <button className="nav-item" onClick={logout} aria-label="Cerrar sesión">
        <span className="nav-icon">🚪</span>
        <span className="nav-label">Salir</span>
      </button>
    </nav>
  );
}
