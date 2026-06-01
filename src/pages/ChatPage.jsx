/**
 * ChatPage — JAAR Digital
 * Mensajería directa bidireccional entre cobrador y vecinos
 */

import { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../services/db';
import {
  enviarMensaje,
  getMensajes,
  marcarLeidos,
  getConversaciones,
  getConversacionId,
} from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/ui/EmptyState';
import './ChatPage.css';

/* ─── Helper: formateo de tiempo ─── */
function formatHora(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString('es-PA', { hour: '2-digit', minute: '2-digit' });
}

function formatDia(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(hoy.getDate() - 1);

  if (d.toDateString() === hoy.toDateString()) return 'Hoy';
  if (d.toDateString() === ayer.toDateString()) return 'Ayer';
  return d.toLocaleDateString('es-PA', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─── Vista: Lista de Conversaciones (cobrador) ─── */
function ConversacionesList({ usuarios, currentUser, onSelectContacto }) {
  const [conversaciones, setConversaciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  // Recargar la lista cada vez que llega un mensaje nuevo
  useLiveQuery(async () => {
    const contactos = usuarios.map(u => ({
      user: String(u.id),
      nombre: u.nombre,
      sector: u.sector,
    }));
    const convs = await getConversaciones(currentUser, contactos);
    setConversaciones(convs);
    setLoading(false);
  }, [usuarios]);

  const filtradas = conversaciones.filter(c =>
    c.contacto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.contacto.sector || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="chat-list-view">
      <div className="chat-list-header">
        <h2>Mensajes</h2>
        <p>Conversaciones con vecinos</p>
      </div>

      <div className="chat-search-bar">
        <input
          className="chat-search-input"
          type="text"
          placeholder="🔍 Buscar vecino..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="chat-loading">Cargando conversaciones...</div>
      ) : filtradas.length === 0 ? (
        <EmptyState icon="💬" message="No se encontraron vecinos" />
      ) : (
        <div className="chat-conv-list">
          {filtradas.map(({ contacto, conversacionId, ultimoMensaje, noLeidos }) => (
            <button
              key={conversacionId}
              className="chat-conv-item"
              onClick={() => onSelectContacto(contacto)}
            >
              <div className="chat-conv-avatar">
                {contacto.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="chat-conv-info">
                <div className="chat-conv-top">
                  <span className="chat-conv-name">{contacto.nombre}</span>
                  {ultimoMensaje && (
                    <span className="chat-conv-time">{formatHora(ultimoMensaje.fecha)}</span>
                  )}
                </div>
                <div className="chat-conv-bottom">
                  <span className="chat-conv-preview">
                    {ultimoMensaje
                      ? (ultimoMensaje.de === currentUser ? '✓ ' : '') + ultimoMensaje.texto
                      : `📍 ${contacto.sector || 'Sin sector'}`}
                  </span>
                  {noLeidos > 0 && (
                    <span className="chat-conv-badge">{noLeidos}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Vista: Conversación Individual ─── */
function ConversacionView({ contacto, currentUser, onVolver }) {
  const conversacionId = getConversacionId(currentUser, contacto.user);
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Live query de mensajes
  useLiveQuery(async () => {
    const msgs = await getMensajes(conversacionId);
    setMensajes(msgs);
    // Marcar como leídos los mensajes dirigidos al usuario actual
    await marcarLeidos(conversacionId, currentUser);
  }, [conversacionId]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!texto.trim() || enviando) return;

    setEnviando(true);
    await enviarMensaje({ de: currentUser, para: contacto.user, texto });
    setTexto('');
    setEnviando(false);
    inputRef.current?.focus();
  };

  // Agrupar mensajes por día
  const mensajesPorDia = [];
  let diaActual = null;
  for (const msg of mensajes) {
    const dia = formatDia(msg.fecha);
    if (dia !== diaActual) {
      mensajesPorDia.push({ type: 'separator', dia });
      diaActual = dia;
    }
    mensajesPorDia.push({ type: 'message', msg });
  }

  return (
    <div className="chat-conv-view">
      {/* Header */}
      <div className="chat-conv-header">
        <button className="chat-back-btn" onClick={onVolver}>
          ← Volver
        </button>
        <div className="chat-conv-avatar-sm">
          {contacto.nombre.charAt(0).toUpperCase()}
        </div>
        <div className="chat-conv-header-info">
          <span className="chat-conv-header-name">{contacto.nombre}</span>
          {contacto.sector && (
            <span className="chat-conv-header-sub">📍 {contacto.sector}</span>
          )}
        </div>
      </div>

      {/* Mensajes */}
      <div className="chat-messages-area">
        {mensajesPorDia.length === 0 ? (
          <div className="chat-empty-conv">
            <span>💬</span>
            <p>Inicia la conversación con {contacto.nombre}</p>
          </div>
        ) : (
          mensajesPorDia.map((item, i) => {
            if (item.type === 'separator') {
              return (
                <div key={`sep-${i}`} className="chat-day-separator">
                  <span>{item.dia}</span>
                </div>
              );
            }
            const { msg } = item;
            const esPropio = msg.de === currentUser;
            return (
              <div key={msg.id} className={`chat-bubble-wrapper ${esPropio ? 'own' : 'other'}`}>
                <div className={`chat-bubble ${esPropio ? 'bubble-own' : 'bubble-other'}`}>
                  <p className="bubble-text">{msg.texto}</p>
                  <div className="bubble-meta">
                    <span className="bubble-time">{formatHora(msg.fecha)}</span>
                    {esPropio && (
                      <span className={`bubble-status ${msg.leido ? 'leido' : ''}`}>
                        {msg.leido ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form className="chat-input-bar" onSubmit={handleEnviar}>
        <input
          ref={inputRef}
          className="chat-text-input"
          type="text"
          placeholder="Escribe un mensaje..."
          value={texto}
          onChange={e => setTexto(e.target.value)}
          disabled={enviando}
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!texto.trim() || enviando}
          aria-label="Enviar mensaje"
        >
          ➤
        </button>
      </form>
    </div>
  );
}

/* ─── Componente Principal ─── */
export default function ChatPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [contactoSeleccionado, setContactoSeleccionado] = useState(null);

  const currentUser = user?.user;
  const esCobrador = user?.rol === 'cobrador';

  // Para cobrador: lista de vecinos de la DB
  const usuarios = useLiveQuery(() => db.usuarios.toArray()) || [];

  // Para cliente: el cobrador (usuario del sistema)
  const COBRADOR_ID = 'cobrador'; // username del cobrador en registeredUsers

  if (!currentUser) return null;

  // VISTA CLIENTE: Ve directamente su conversación con el cobrador
  if (!esCobrador) {
    const cobradorContacto = { user: COBRADOR_ID, nombre: 'Cobrador JAAR', sector: '' };
    return (
      <div className="chat-page">
        <ConversacionView
          contacto={cobradorContacto}
          currentUser={currentUser}
          onVolver={null} // No hay botón volver para el cliente
        />
      </div>
    );
  }

  // VISTA COBRADOR
  return (
    <div className="chat-page">
      {contactoSeleccionado ? (
        <ConversacionView
          contacto={contactoSeleccionado}
          currentUser={currentUser}
          onVolver={() => setContactoSeleccionado(null)}
        />
      ) : (
        <ConversacionesList
          usuarios={usuarios}
          currentUser={currentUser}
          onSelectContacto={setContactoSeleccionado}
        />
      )}
    </div>
  );
}
