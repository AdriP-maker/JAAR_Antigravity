/**
 * KPIGrid — SIMAP Digital
 * Quick stats KPI cards
 */

import './KPIGrid.css';

export default function KPIGrid({ metrics }) {
  const items = [
    { value: `${Math.round((metrics.tasaRecaudo || 0) * 100)}%`, label: 'Recaudo', icon: '📊' },
    { value: metrics.enRiesgo || 0, label: 'En Riesgo', icon: '⚠️' },
    { value: metrics.alertas || 0, label: 'Alertas', icon: '🔔' },
    { value: metrics.pendientes || 0, label: 'Pendientes', icon: '📤' },
  ];

  return (
    <div className="kpi-grid animate-fade-in-up">
      {items.map((item, i) => (
        <div key={i} className="kpi-card" style={{ animationDelay: `${i * 60}ms` }}>
          <span className="kpi-icon">{item.icon}</span>
          <span className="kpi-value">{item.value}</span>
          <span className="kpi-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
