/**
 * FilterBar — JAAR Digital
 * Search + filter bar for the cobros page
 */

import { MESES } from '../../utils/constants';
import './FilterBar.css';

export default function FilterBar({
  searchText, onSearchChange,
  mes, onMesChange,
  estado, onEstadoChange,
  rutaActiva, onToggleRuta,
}) {
  return (
    <section className="filter-section animate-fade-in-up" style={{ animationDelay: '50ms' }}>
      <div className="filter-search">
        <span className="filter-search-icon">🔍</span>
        <input
          type="text"
          className="filter-search-input"
          placeholder="Buscar vecino o sector..."
          value={searchText}
          onChange={e => onSearchChange(e.target.value)}
          autoComplete="off"
        />
      </div>
      <div className="filter-row">
        <select className="filter-select" value={mes} onChange={e => onMesChange(e.target.value)}>
          <option value="">📅 Todos los meses</option>
          {MESES.map((m, i) => (
            <option key={i + 1} value={i + 1}>{m}</option>
          ))}
        </select>
        <select className="filter-select" value={estado} onChange={e => onEstadoChange(e.target.value)}>
          <option value="">🟢 Todos</option>
          <option value="activo">✅ Al Día</option>
          <option value="parcial">🟡 Parcial</option>
          <option value="moroso">⚠️ Moroso</option>
          <option value="corte">🔴 Corte</option>
        </select>
        <button
          className={`filter-ruta-btn ${rutaActiva ? 'filter-ruta-active' : ''}`}
          onClick={onToggleRuta}
        >
          🧠 {rutaActiva ? 'IA Activa' : 'Ruta IA'}
        </button>
      </div>
    </section>
  );
}
