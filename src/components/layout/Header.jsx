/**
 * Header Component — JAAR Digital
 * Sticky top navigation with glassmorphism, sync button, and connectivity status
 */

import { useState, useEffect } from 'react';
import Badge from '../ui/Badge';
import ThemeToggle from './ThemeToggle';
import { useOnline } from '../../hooks/useOnline';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { getPendingSyncCount, clearPendingSync } from '../../services/pagosService';
import './Header.css';

export default function Header({ title = 'Piloto Caballero (Antón)', icon = '💧' }) {
  const isOnline = useOnline();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const showSync = user?.rol === 'admin' || user?.rol === 'cobrador';

  // Refresh pending count on mount
  useEffect(() => {
    let mounted = true;
    getPendingSyncCount().then(count => {
      if (mounted) setPendingCount(count);
    });
    return () => { mounted = false; };
  }, []);

  const handleSync = async () => {
    const count = await getPendingSyncCount();
    if (count === 0) {
      showToast('Todo está al día.', { type: 'info' });
      return;
    }
    if (!isOnline) {
      showToast('No hay internet para sincronizar.', { type: 'warning' });
      return;
    }

    setSyncing(true);
    // Simulate sync (replace with real Supabase sync in the future)
    await new Promise(r => setTimeout(r, 2000));
    await clearPendingSync();
    setPendingCount(0);
    setSyncing(false);
    showToast(`¡${count} cobros subidos a la nube con éxito!`, { type: 'success' });
  };

  return (
    <header className="header-nav">
      <div className="header-content">
        <div className="header-brand">
          <span className="header-logo">{icon}</span>
          <h1 className="header-title">{title}</h1>
        </div>
        <div className="header-actions">
          <ThemeToggle />
          {showSync && (
            <button
              className={`header-sync-btn ${syncing ? 'syncing' : ''}`}
              onClick={handleSync}
              disabled={syncing}
              aria-label="Sincronizar a la nube"
            >
              <span className="sync-icon">{syncing ? '⏳' : '☁️'}</span>
              <span className="sync-label">{syncing ? 'Subiendo...' : 'Sync'}</span>
            </button>
          )}
        </div>
      </div>
      <div className="header-status">
        <Badge variant={isOnline ? 'online' : 'offline'} size="sm">
          {isOnline ? 'Conectado' : 'Sin Conexión'}
        </Badge>
        {showSync && (
          <span className="header-pending">
            Cobros sin subir: <strong className={pendingCount > 0 ? 'pending-alert' : ''}>{pendingCount}</strong>
          </span>
        )}
      </div>
    </header>
  );
}
