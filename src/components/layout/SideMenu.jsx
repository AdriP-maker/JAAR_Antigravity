/**
 * SideMenu — JAAR Digital
 * Menú lateral deslizable para ítems de navegación secundarios
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './SideMenu.css';

const SIDE_ITEMS = {
  cobrador: [
    { path: '/foro',  icon: '📢', label: 'Avisos', desc: 'Muro comunitario' },
    { path: '/chat',  icon: '💬', label: 'Mensajes', desc: 'Chat con vecinos' },
    { path: '/mapa',  icon: '🗺️', label: 'Mapa de Sectores', desc: 'Estado por zona' },
  ],
};

export default function SideMenu({ isOpen, onClose }) {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const items = SIDE_ITEMS[role] || [];

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`sidemenu-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`sidemenu-panel ${isOpen ? 'open' : ''}`}
        aria-label="Menú lateral"
        role="navigation"
      >
        {/* Header del panel */}
        <div className="sidemenu-header">
          <div className="sidemenu-user-info">
            <div className="sidemenu-avatar">
              {(user?.nombre || user?.user || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="sidemenu-user-name">{user?.nombre || user?.user}</div>
              <div className="sidemenu-user-role">
                {role === 'cobrador' ? '🪙 Cobrador' :
                 role === 'admin' ? '🛡️ Administrador' :
                 role === 'cliente' ? '👤 Vecino' : role}
              </div>
            </div>
          </div>
          <button className="sidemenu-close-btn" onClick={onClose} aria-label="Cerrar menú">
            ✕
          </button>
        </div>

        {/* Logo */}
        <div className="sidemenu-brand">
          <span className="sidemenu-brand-icon">💧</span>
          <span className="sidemenu-brand-name">JAAR Digital</span>
        </div>

        <div className="sidemenu-divider" />

        {/* Items de navegación */}
        {items.length > 0 && (
          <>
            <p className="sidemenu-section-label">Módulos adicionales</p>
            <nav className="sidemenu-nav">
              {items.map(item => (
                <button
                  key={item.path}
                  className={`sidemenu-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => handleNavigate(item.path)}
                >
                  <span className="sidemenu-item-icon">{item.icon}</span>
                  <div className="sidemenu-item-text">
                    <span className="sidemenu-item-label">{item.label}</span>
                    <span className="sidemenu-item-desc">{item.desc}</span>
                  </div>
                  {location.pathname === item.path && (
                    <span className="sidemenu-active-dot" />
                  )}
                </button>
              ))}
            </nav>

            <div className="sidemenu-divider" />
          </>
        )}

        {/* Footer / Logout */}
        <div className="sidemenu-footer">
          <button className="sidemenu-logout" onClick={() => { logout(); onClose(); }}>
            <span>🚪</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
