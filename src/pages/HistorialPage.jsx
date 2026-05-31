/**
 * HistorialPage — JAAR Digital
 * Client-facing history page with account status, jornales, points, and payment history
 */

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../services/db';
import { calcularEstado, getResumenUsuario, getPagosUsuario } from '../services/pagosService';
import { obtenerSaldoPuntos, calcularDescuentoBalboas } from '../services/puntosService';
import { formatMonto, formatFecha } from '../utils/formatters';
import { TIPO_PAGO_LABELS } from '../utils/constants';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import './HistorialPage.css';

export default function HistorialPage() {
  const usuarios = useLiveQuery(() => db.usuarios.toArray()) || [];
  const [yo, setYo] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [jornales, setJornales] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [puntos, setPuntos] = useState(0);

  useEffect(() => {
    if (usuarios.length > 0) {
      const user = usuarios[0]; // First user as demo client
      setYo(user);
      loadData(user.id);
    }
  }, [usuarios]);

  const loadData = async (userId) => {
    const res = await getResumenUsuario(userId);
    setResumen(res);

    const allPagos = await getPagosUsuario(userId);
    setPagos(allPagos.slice(-10).reverse());

    const allJornales = await db.jornales.where('miembroId').equals(String(userId)).toArray();
    setJornales(allJornales);

    const recientes = await db.foro.orderBy('fecha').reverse().limit(2).toArray();
    setAvisos(recientes);

    const misNotif = await db.notificaciones.where('usuarioId').equals(String(userId)).reverse().toArray();
    setNotificaciones(misNotif);

    const saldoPuntos = await obtenerSaldoPuntos(userId);
    setPuntos(saldoPuntos);
  };

  if (!yo || !resumen) {
    return (
      <div className="historial-page">
        <EmptyState icon="⏳" message="Cargando datos..." />
      </div>
    );
  }

  const misHoras = jornales
    .filter(j => j.asiste === 'si')
    .reduce((sum, j) => sum + parseFloat(j.horas || 0), 0);
  const misMultas = jornales
    .filter(j => j.asiste !== 'si')
    .reduce((sum, j) => sum + parseFloat(j.multa || 0), 0);

  let statusText = 'Al día (Pagado)';
  let statusVariant = 'good';
  if (resumen.estado === 'corte') { statusText = 'Para Corte'; statusVariant = 'bad'; }
  else if (resumen.estado === 'moroso') { statusText = 'Moroso'; statusVariant = 'bad'; }
  else if (resumen.estado === 'parcial') { statusText = 'Pago Parcial'; statusVariant = 'bad'; }

  return (
    <div className="historial-page">
      {/* Account Status */}
      <Card delay={0} className="hist-section">
        <h3 className="hist-title">Estado de Cuenta General</h3>
        <div className="hist-row">
          <span>Estatus de Agua</span>
          <span className={`hist-status ${statusVariant}`}>{statusText}</span>
        </div>
        <div className="hist-row">
          <span>Último Pago</span>
          <span>{resumen.ultimoPago ? formatFecha(resumen.ultimoPago) : 'Sin pago reciente'}</span>
        </div>
        <div className="hist-row">
          <span>Meses sin pagar</span>
          <span className={resumen.mesesDeuda > 0 ? 'hist-danger' : ''} style={{ fontWeight: 600 }}>
            {resumen.mesesDeuda}
          </span>
        </div>
        {resumen.deuda > 0 && (
          <div className="hist-row">
            <span>Deuda total</span>
            <span className="hist-danger" style={{ fontWeight: 700 }}>{formatMonto(resumen.deuda)}</span>
          </div>
        )}
      </Card>

      {/* Convocatorias / Avisos Activos */}
      <Card delay={40} className="hist-section">
        <h3 className="hist-title">📢 Avisos Recientes</h3>
        {avisos.length === 0 ? (
          <EmptyState icon="📬" message="Sin avisos nuevos" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {avisos.map(aviso => (
              <div key={aviso.id} style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ display: 'block', marginBottom: '0.2rem' }}>{aviso.titulo}</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{formatFecha(aviso.fecha)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Notificaciones (Mensajes de IA / Cobrador) */}
      {notificaciones.length > 0 && (
        <Card delay={60} className="hist-section" style={{ border: '2px solid var(--primary-color)' }}>
          <h3 className="hist-title" style={{ color: 'var(--primary-color)' }}>🔔 Mensajes para ti</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {notificaciones.map(notif => (
              <div key={notif.id} style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary-color)' }}>
                <strong style={{ display: 'block', marginBottom: '0.2rem' }}>{notif.titulo}</strong>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>{notif.mensaje}</p>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatFecha(notif.fecha)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Jornales */}
      <Card delay={80} className="hist-section">
        <h3 className="hist-title">Registro de Jornales</h3>
        <div className="hist-row">
          <span>Horas Aportadas 2026</span>
          <span style={{ fontWeight: 600 }}>{misHoras} Hrs</span>
        </div>
        <div className="hist-row">
          <span>Multas por inasistencia</span>
          <span className={misMultas > 0 ? 'hist-danger' : ''}>{formatMonto(misMultas)}</span>
        </div>
      </Card>

      {/* Points */}
      <Card delay={160} className="hist-section">
        <h3 className="hist-title">⭐ Mis Puntos JAAR</h3>
        <div className="hist-row">
          <span>Puntos acumulados</span>
          <span className="hist-points">{puntos} pts</span>
        </div>
        <div className="hist-row">
          <span>Equivale en descuento</span>
          <span className="hist-good">{formatMonto(calcularDescuentoBalboas(puntos))}</span>
        </div>
        <details className="hist-tips">
          <summary>💡 ¿Cómo gano más puntos?</summary>
          <ul>
            <li>Pagar antes del día 15 → <strong>+5 pts</strong></li>
            <li>Pagar varios meses a la vez → <strong>+10 pts por mes extra</strong></li>
            <li>Asistir al jornal comunitario → <strong>+8 pts</strong></li>
            <li>Trimestre sin multas → <strong>+15 pts</strong></li>
            <li>Año completo pagado → <strong>+30 pts</strong></li>
          </ul>
        </details>
      </Card>

      {/* Payment History */}
      <Card delay={240} className="hist-section">
        <h3 className="hist-title">💳 Historial de Pagos</h3>
        {pagos.length === 0 ? (
          <EmptyState icon="📭" message="Sin pagos registrados." />
        ) : (
          <div className="hist-pagos-list">
            {pagos.map((p, i) => (
              <div key={p.idPago || i} className="hist-pago-row">
                <div>
                  <span className="hist-pago-tipo">{TIPO_PAGO_LABELS[p.tipo] || 'Pago'}</span>
                  <span className="hist-pago-fecha">
                    {formatFecha(p.fecha)}{p.mesTarget ? ` · ${p.mesTarget}` : ''}
                  </span>
                </div>
                <span className="hist-pago-monto">{formatMonto(p.monto)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Risk Status */}
      <Card delay={320} className="hist-section">
        <h3 className="hist-title">🏡 Estado de tu Hogar</h3>
        <p className="hist-risk-message">
          {resumen.estado === 'activo'
            ? '🟢 Tu hogar está al día. ¡Mantén este buen comportamiento para acumular más puntos y beneficios!'
            : resumen.estado === 'corte'
              ? '🔴 ¡Atención! Tu hogar está en riesgo de corte de agua. Acércate a la directiva para regularizar tu situación.'
              : '🟡 Tienes pagos pendientes. Regulariza tu situación para mantener tu servicio de agua activo.'}
        </p>
      </Card>

      <div className="hist-footer">
        <p>Para realizar pagos o disputar multas, acérquese a la directiva de la JAAR en los días laborables indicados en la pestaña de Avisos.</p>
      </div>
    </div>
  );
}
