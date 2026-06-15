/**
 * AdminPage — SIMAP Digital
 * Dashboard for admins to manage users, approvals, and roles
 */

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../services/db';
import { approveUser, rejectUser, suspendUser, resetUserPassword, updateUserRole } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { getSession } from '../services/authService';
import { formatFecha } from '../utils/formatters';
import './AdminPage.css';

export default function AdminPage() {
  const { showToast } = useToast();
  const session = getSession();
  const isDev = session?.rol === 'dev';
  
  // Real-time query of all registered users
  const users = useLiveQuery(async () => {
    const users = await db.registeredUsers.toArray();
    return users.filter(u => u.estado !== 'eliminado');
  }) || [];

  const auditoriaLogs = useLiveQuery(() => db.auditoria.orderBy('timestamp').reverse().toArray()) || [];
  
  const [activeTab, setActiveTab] = useState(isDev ? 'auditoria' : 'pendientes');
  const [searchTerm, setSearchTerm] = useState('');

  const pendientes = users.filter(u => u.estado === 'pendiente');
  const activos = users.filter(u => u.estado === 'activo' || u.estado === 'suspendido');
  
  const handleApprove = async (username) => {
    const res = await approveUser(username);
    if (res.success) {
      showToast(`Usuario ${username} aprobado`, { type: 'success' });
    } else {
      showToast(res.error, { type: 'error' });
    }
  };

  const handleReject = async (username) => {
    if (!window.confirm(`¿Rechazar solicitud de ${username}?`)) return;
    const res = await rejectUser(username);
    if (res.success) showToast(`Usuario ${username} rechazado`, { type: 'success' });
  };

  const handleSuspend = async (username, isSuspended) => {
    const res = isSuspended ? await approveUser(username) : await suspendUser(username);
    if (res.success) {
      showToast(`Usuario ${username} ${isSuspended ? 'reactivado' : 'suspendido'}`, { type: 'success' });
    }
  };

  const handleDelete = async (username) => {
    if (!window.confirm(`¿ELIMINAR cuenta de ${username}? Esta acción lo ocultará del sistema.`)) return;
    // Soft delete logic:
    const user = await db.registeredUsers.get(username);
    if (user) {
      user.estado = 'eliminado';
      await db.registeredUsers.put(user);
      
      // Registro en auditoria
      await db.auditoria.add({
        timestamp: new Date().toISOString(),
        accion: 'SOFT_DELETE',
        user_id: 'admin_global', // In real app, current session user
        afectado_id: username
      });

      showToast(`Usuario ${username} eliminado`, { type: 'info' });
    }
  };

  const handleResetPass = async (username) => {
    const newPass = window.prompt(`Nueva contraseña para ${username}:`);
    if (newPass) {
      const res = await resetUserPassword(username, newPass);
      if (res.success) {
        showToast(`Contraseña de ${username} actualizada`, { type: 'success' });
      } else {
        showToast(res.error, { type: 'error' });
      }
    }
  };

  const handleRoleChange = async (username, currentRole) => {
    const roles = ['cliente', 'cobrador', 'admin'];
    const newRole = window.prompt(`Cambiar rol de ${username}. Opciones: ${roles.join(', ')}`, currentRole);
    if (newRole && roles.includes(newRole.toLowerCase())) {
      const res = await updateUserRole(username, newRole.toLowerCase());
      if (res.success) {
        showToast(`Rol de ${username} actualizado a ${newRole}`, { type: 'success' });
      }
    } else if (newRole) {
      showToast('Rol inválido', { type: 'error' });
    }
  };

  const filteredActivos = activos.filter(u => 
    u.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.nombre && u.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>Panel de Administración</h2>
      </div>

      <div className="admin-tabs">
        {!isDev && (
          <>
            <button 
              className={`admin-tab ${activeTab === 'pendientes' ? 'active' : ''}`}
              onClick={() => setActiveTab('pendientes')}
            >
              Pendientes ({pendientes.length})
            </button>
            <button 
              className={`admin-tab ${activeTab === 'usuarios' ? 'active' : ''}`}
              onClick={() => setActiveTab('usuarios')}
            >
              Usuarios Activos ({activos.length})
            </button>
          </>
        )}
        <button 
          className={`admin-tab ${activeTab === 'auditoria' ? 'active' : ''}`}
          onClick={() => setActiveTab('auditoria')}
        >
          Logs de Auditoría
        </button>
      </div>

      {activeTab === 'pendientes' && (
        <div className="admin-tab-content">
          {pendientes.length === 0 ? (
            <EmptyState icon="✅" message="No hay solicitudes pendientes" />
          ) : (
            <div className="admin-list">
              {pendientes.map(user => (
                <Card key={user.user} className="admin-user-card animate-fade-in-up">
                  <div className="admin-user-info">
                    <h4>{user.nombre || user.user}</h4>
                    <span className="admin-user-sub">Usuario: {user.user}</span>
                    <span className="admin-user-sub">Lote: {user.casa} | {user.sector}</span>
                  </div>
                  <div className="admin-user-actions">
                    <Button variant="outline" size="sm" onClick={() => handleReject(user.user)}>Rechazar</Button>
                    <Button variant="primary" size="sm" onClick={() => handleApprove(user.user)}>Aprobar</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'usuarios' && (
        <div className="admin-tab-content">
          <input 
            type="text" 
            className="admin-search" 
            placeholder="Buscar por usuario o nombre..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          
          <div className="admin-list">
            {filteredActivos.map(user => (
              <Card key={user.user} className="admin-user-card animate-fade-in-up">
                <div className="admin-user-info">
                  <div className="admin-user-title">
                    <h4>{user.nombre || user.user}</h4>
                    <Badge variant={user.estado === 'activo' ? 'success' : 'danger'}>{user.estado}</Badge>
                    <Badge variant="primary">{user.rol}</Badge>
                  </div>
                  <span className="admin-user-sub">Usuario: {user.user}</span>
                </div>
                <div className="admin-user-actions-grid">
                  <Button variant="outline" size="sm" onClick={() => handleResetPass(user.user)}>🔑 Pass</Button>
                  <Button variant="outline" size="sm" onClick={() => handleRoleChange(user.user, user.rol)}>👤 Rol</Button>
                  <Button 
                    variant={user.estado === 'suspendido' ? 'primary' : 'warning'} 
                    size="sm" 
                    onClick={() => handleSuspend(user.user, user.estado === 'suspendido')}
                  >
                    {user.estado === 'suspendido' ? 'Activar' : 'Suspender'}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(user.user)}>🗑️ Borrar</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'auditoria' && (
        <div className="admin-tab-content">
          <div className="admin-list" style={{ gap: '0.5rem' }}>
            {auditoriaLogs.length === 0 ? (
              <EmptyState icon="📋" message="No hay registros de auditoría" />
            ) : (
              auditoriaLogs.map((log, index) => (
                <div key={index} style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>{log.accion}</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{formatFecha(log.timestamp)}</span>
                  </div>
                  <div>
                    Por: <Badge variant="primary" size="sm">{log.user_id}</Badge> → Afectado: <strong>{log.afectado_id}</strong>
                  </div>
                  {log.detalles && <div style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>{log.detalles}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
