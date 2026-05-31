/**
 * EmptyState Component — JAAR Digital
 */

import './EmptyState.css';

export default function EmptyState({ icon = '📭', title, message }) {
  return (
    <div className="empty-state animate-fade-in">
      <span className="empty-icon">{icon}</span>
      {title && <h3 className="empty-title">{title}</h3>}
      <p className="empty-message">{message || 'No hay datos para mostrar.'}</p>
    </div>
  );
}
