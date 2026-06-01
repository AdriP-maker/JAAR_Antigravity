/**
 * MapaPage — JAAR Digital
 * Vista de sectores de la comunidad coloreados por estado de pago
 * Solo accesible para el cobrador
 */

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../services/db';
import { calcularEstado } from '../services/pagosService';
import { formatMonto } from '../utils/formatters';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import './MapaPage.css';

/* ─── Helper: color y estado del sector ─── */
function getSectorColor(porcentajeAlDia) {
  if (porcentajeAlDia >= 0.8) return 'sector-verde';
  if (porcentajeAlDia >= 0.5) return 'sector-amarillo';
  return 'sector-rojo';
}

function getSectorEmoji(porcentajeAlDia) {
  if (porcentajeAlDia >= 0.8) return '✅';
  if (porcentajeAlDia >= 0.5) return '⚠️';
  return '🔴';
}

function getEstadoBadge(estado) {
  const map = {
    activo: 'success',
    moroso: 'warning',
    corte: 'danger',
    adelantado: 'primary',
  };
  return map[estado] || 'default';
}

/* ─── Componente de Sector ─── */
function SectorCard({ nombre, vecinos, expandido, onToggle }) {
  const total = vecinos.length;
  const alDia = vecinos.filter(v => v.estado === 'activo' || v.estado === 'adelantado').length;
  const porcentaje = total > 0 ? alDia / total : 0;
  const colorClass = getSectorColor(porcentaje);
  const emoji = getSectorEmoji(porcentaje);

  return (
    <div className={`sector-card ${colorClass} ${expandido ? 'expandido' : ''}`}>
      <button className="sector-card-header" onClick={onToggle}>
        <div className="sector-card-left">
          <span className="sector-emoji">{emoji}</span>
          <div className="sector-info">
            <h3 className="sector-nombre">{nombre}</h3>
            <p className="sector-sub">{total} vecinos · {Math.round(porcentaje * 100)}% al día</p>
          </div>
        </div>
        <div className="sector-card-right">
          <div className="sector-progress-ring">
            <svg viewBox="0 0 40 40" className="ring-svg">
              <circle
                className="ring-bg"
                cx="20" cy="20" r="16"
                fill="none" strokeWidth="4"
              />
              <circle
                className="ring-fill"
                cx="20" cy="20" r="16"
                fill="none" strokeWidth="4"
                strokeDasharray={`${porcentaje * 100.5} 100.5`}
                strokeLinecap="round"
                transform="rotate(-90 20 20)"
              />
            </svg>
            <span className="ring-label">{Math.round(porcentaje * 100)}%</span>
          </div>
          <span className="sector-toggle-icon">{expandido ? '▲' : '▼'}</span>
        </div>
      </button>

      {expandido && (
        <div className="sector-vecinos-list animate-fade-in-up">
          {vecinos.map(v => (
            <div key={v.id} className="sector-vecino-item">
              <div className="sector-vecino-info">
                <span className="sector-vecino-nombre">{v.nombre}</span>
                {v.deuda > 0 && (
                  <span className="sector-vecino-deuda">
                    Debe: {formatMonto(v.deuda)}
                  </span>
                )}
              </div>
              <Badge variant={getEstadoBadge(v.estado)}>
                {v.estado}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Página Principal ─── */
export default function MapaPage() {
  const usuarios = useLiveQuery(() => db.usuarios.toArray()) || [];
  const [sectores, setSectores] = useState([]);
  const [expandidos, setExpandidos] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuarios.length) return;

    async function enriquecerUsuarios() {
      setLoading(true);
      const enriched = await Promise.all(
        usuarios.map(async u => {
          const estado = await calcularEstado(u.id);
          // Approximate deuda calculation (moroso/corte = 3 per month, simplistic)
          const deuda = (estado === 'moroso' || estado === 'corte') ? 3 : 0;
          return { ...u, estado, deuda };
        })
      );

      // Agrupar por sector
      const grouped = {};
      for (const u of enriched) {
        const s = u.sector || 'Sin sector';
        if (!grouped[s]) grouped[s] = [];
        grouped[s].push(u);
      }

      // Convertir a array y ordenar: sectores con más morosos primero
      const sectoresArray = Object.entries(grouped).map(([nombre, vecinos]) => ({
        nombre,
        vecinos,
      }));

      sectoresArray.sort((a, b) => {
        const morososA = a.vecinos.filter(v => v.estado === 'moroso' || v.estado === 'corte').length;
        const morososB = b.vecinos.filter(v => v.estado === 'moroso' || v.estado === 'corte').length;
        return morososB - morososA;
      });

      setSectores(sectoresArray);
      setLoading(false);
    }

    enriquecerUsuarios();
  }, [usuarios]);

  // KPIs globales
  const totalVecinos = sectores.reduce((sum, s) => sum + s.vecinos.length, 0);
  const alDiaGlobal = sectores.reduce(
    (sum, s) => sum + s.vecinos.filter(v => v.estado === 'activo' || v.estado === 'adelantado').length,
    0
  );
  const morososGlobal = sectores.reduce(
    (sum, s) => sum + s.vecinos.filter(v => v.estado === 'moroso' || v.estado === 'corte').length,
    0
  );
  const porcentajeGlobal = totalVecinos > 0 ? Math.round((alDiaGlobal / totalVecinos) * 100) : 0;

  const toggleSector = (nombre) => {
    setExpandidos(prev => ({ ...prev, [nombre]: !prev[nombre] }));
  };

  return (
    <div className="mapa-page">
      {/* Header */}
      <div className="mapa-header">
        <h2>Mapa de Sectores</h2>
        <p>Estado de recaudación por zona</p>
      </div>

      {/* KPIs Globales */}
      <div className="mapa-kpi-grid">
        <div className="mapa-kpi-card kpi-primary">
          <span className="kpi-icon">🏘️</span>
          <div>
            <div className="kpi-value">{totalVecinos}</div>
            <div className="kpi-label">Vecinos</div>
          </div>
        </div>
        <div className="mapa-kpi-card kpi-success">
          <span className="kpi-icon">✅</span>
          <div>
            <div className="kpi-value">{porcentajeGlobal}%</div>
            <div className="kpi-label">Al día</div>
          </div>
        </div>
        <div className="mapa-kpi-card kpi-danger">
          <span className="kpi-icon">⚠️</span>
          <div>
            <div className="kpi-value">{morososGlobal}</div>
            <div className="kpi-label">En riesgo</div>
          </div>
        </div>
        <div className="mapa-kpi-card kpi-neutral">
          <span className="kpi-icon">📍</span>
          <div>
            <div className="kpi-value">{sectores.length}</div>
            <div className="kpi-label">Sectores</div>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="mapa-leyenda">
        <span className="leyenda-item verde">✅ Al día ≥80%</span>
        <span className="leyenda-item amarillo">⚠️ Riesgo 50-79%</span>
        <span className="leyenda-item rojo">🔴 Crítico &lt;50%</span>
      </div>

      {/* Lista de Sectores */}
      {loading ? (
        <div className="mapa-loading">Calculando estados de pago...</div>
      ) : sectores.length === 0 ? (
        <EmptyState icon="🗺️" message="No hay vecinos registrados" />
      ) : (
        <div className="mapa-sectores-list">
          {sectores.map(s => (
            <SectorCard
              key={s.nombre}
              nombre={s.nombre}
              vecinos={s.vecinos}
              expandido={!!expandidos[s.nombre]}
              onToggle={() => toggleSector(s.nombre)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
