/**
 * UserCard — SIMAP Digital
 * Vecino card with avatar, status badge, debt info, and payment button
 */

import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { ESTADO_LABELS } from '../../utils/constants';
import { formatMonto, getInitials, stringToColor } from '../../utils/formatters';
import './UserCard.css';

export default function UserCard({ user, estado, deuda, adelantados, puntos, onCobrar, onAISuggest, delay = 0, pagadoEnMes }) {
  const estadoInfo = ESTADO_LABELS[estado] || ESTADO_LABELS.activo;
  const initials = getInitials(user.nombre);
  const avatarColor = stringToColor(user.nombre);

  return (
    <Card delay={delay} className="user-card-wrapper">
      <div className="user-card-content">
        <div className="user-avatar" style={{ background: avatarColor }}>
          {initials}
        </div>
        <div className="user-info">
          <div className="user-name-row">
            <h3 className="user-name">{user.nombre}</h3>
            <Badge variant={estadoInfo.variant} size="sm">{estadoInfo.text}</Badge>
          </div>
          <p className="user-sector">📍 {user.sector}
            {puntos > 0 && <span className="user-points">⭐ {puntos} pts</span>}
          </p>
          {deuda > 0 && (
            <span className="user-debt">Deuda: {formatMonto(deuda)} ({user.mesesSinPagar || 0} mes{(user.mesesSinPagar || 0) > 1 ? 'es' : ''})</span>
          )}
          {adelantados > 0 && (
            <span className="user-advance">Adelantado {adelantados} mes{adelantados > 1 ? 'es' : ''}</span>
          )}
        </div>
      </div>
      <div className="user-card-actions">
        {onAISuggest && (
          <button className="user-ai-btn" onClick={() => onAISuggest(user)} title="Sugerencia IA">
            🧠 IA
          </button>
        )}
        <button
          className={`user-pay-btn ${pagadoEnMes && estado === 'activo' ? 'user-pay-btn-advance' : ''}`}
          onClick={() => onCobrar(user)}
        >
          {pagadoEnMes && estado === 'activo' ? '💰 Adelantar' : '💰 Cobrar'}
        </button>
      </div>
    </Card>
  );
}
