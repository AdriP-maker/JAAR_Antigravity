/**
 * CobrosPage — SIMAP Digital
 * Main collection view for cobradores with user list, filters, KPIs, and payment modal
 */

import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../services/db';
import { calcularEstado, getResumenUsuario, getPendingSyncCount } from '../services/pagosService';
import FilterBar from '../components/cobros/FilterBar';
import KPIGrid from '../components/cobros/KPIGrid';
import UserCard from '../components/cobros/UserCard';
import CobroModal from '../components/cobros/CobroModal';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { getSugerenciaCobrador } from '../services/aiService';
import { useToast } from '../context/ToastContext';
import './CobrosPage.css';

export default function CobrosPage() {
  const { showToast } = useToast();
  const usuarios = useLiveQuery(() => db.usuarios.toArray()) || [];

  const [searchText, setSearchText] = useState('');
  const [filtroMes, setFiltroMes] = useState(String(new Date().getMonth() + 1));
  const [filtroEstado, setFiltroEstado] = useState('');
  const [rutaActiva, setRutaActiva] = useState(false);

  // User data enriched with payment status
  const [enrichedUsers, setEnrichedUsers] = useState([]);
  const [metrics, setMetrics] = useState({ tasaRecaudo: 0, enRiesgo: 0, alertas: 0, pendientes: 0 });

  // Modal state
  const [modalUser, setModalUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // AI Modal
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const enrichUsers = useCallback(async () => {
    if (!usuarios.length) return;

    const enriched = await Promise.all(usuarios.map(async (u) => {
      const estado = await calcularEstado(u.id);
      const resumen = await getResumenUsuario(u.id);
      return {
        ...u,
        estado,
        deuda: resumen.deuda,
        adelantados: resumen.adelantados,
        mesesDeuda: resumen.mesesDeuda,
        puntos: 0, // stub until puntos service is migrated
      };
    }));

    setEnrichedUsers(enriched);

    // Calculate metrics
    const total = enriched.length;
    const alDia = enriched.filter(u => u.estado === 'activo').length;
    const enRiesgo = enriched.filter(u => u.estado === 'moroso' || u.estado === 'corte').length;
    const pending = await getPendingSyncCount();

    setMetrics({
      tasaRecaudo: total > 0 ? alDia / total : 0,
      enRiesgo,
      alertas: enriched.filter(u => u.estado === 'corte').length,
      pendientes: pending,
    });
  }, [usuarios, refreshKey]);

  useEffect(() => {
    enrichUsers();
  }, [enrichUsers]);

  // Filter users
  const filtered = enrichedUsers.filter(u => {
    const matchText = !searchText ||
      u.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      u.sector.toLowerCase().includes(searchText.toLowerCase());
    const matchEstado = !filtroEstado || u.estado === filtroEstado;
    return matchText && matchEstado;
  });

  const handlePagoComplete = () => {
    setRefreshKey(k => k + 1);
  };

  const handleAISuggestion = async (user) => {
    setLoadingAI(true);
    setAiSuggestion({ user, text: 'Generando sugerencia...' });
    const res = await getSugerenciaCobrador(user);
    if (res.success) {
      setAiSuggestion({ user, text: res.text });
    } else {
      showToast(res.text, { type: 'error' });
      setAiSuggestion(null);
    }
    setLoadingAI(false);
  };

  const handleSendNotification = async () => {
    if (!aiSuggestion) return;
    try {
      await db.notificaciones.add({
        usuarioId: String(aiSuggestion.user.id),
        titulo: 'Mensaje de tu Cobrador',
        mensaje: aiSuggestion.text,
        fecha: new Date().toISOString(),
        leido: false
      });
      showToast('Notificación enviada al vecino ✅', { type: 'success' });
      setAiSuggestion(null);
    } catch (err) {
      showToast('Error enviando notificación', { type: 'error' });
    }
  };

  return (
    <div className="cobros-page">
      <KPIGrid metrics={metrics} />

      <FilterBar
        searchText={searchText}
        onSearchChange={setSearchText}
        mes={filtroMes}
        onMesChange={setFiltroMes}
        estado={filtroEstado}
        onEstadoChange={setFiltroEstado}
        rutaActiva={rutaActiva}
        onToggleRuta={() => setRutaActiva(!rutaActiva)}
      />

      <section className="cobros-list-section">
        <div className="cobros-list-header">
          <h2>Comunidad (Cobro Offline)</h2>
          <span className="cobros-count">{filtered.length} vecinos</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            message="No se encontraron vecinos con ese filtro."
          />
        ) : (
          <div className="cobros-list">
            {filtered.map((user, i) => (
              <UserCard
                key={user.id}
                user={user}
                estado={user.estado}
                deuda={user.deuda}
                adelantados={user.adelantados}
                puntos={user.puntos}
                pagadoEnMes={user.estado === 'activo'}
                onCobrar={() => setModalUser(user)}
                onAISuggest={() => handleAISuggestion(user)}
                delay={i * 50}
              />
            ))}
          </div>
        )}
      </section>

      <CobroModal
        isOpen={!!modalUser}
        onClose={() => setModalUser(null)}
        user={modalUser}
        onPagoComplete={handlePagoComplete}
      />

      {aiSuggestion && (
        <div className="ai-modal-overlay">
          <div className="ai-modal-content animate-scale-in">
            <h3>🧠 Asistente IA</h3>
            <p className="ai-target">Sugerencia para: <strong>{aiSuggestion.user.nombre}</strong></p>
            <div className="ai-box">
              {aiSuggestion.text}
            </div>
            <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', gap: '0.5rem'}}>
              <Button variant="outline" onClick={() => setAiSuggestion(null)} disabled={loadingAI}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSendNotification} disabled={loadingAI}>
                Enviar al Vecino
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
