/**
 * chatService.js — JAAR Digital
 * Servicio de mensajería directa Cobrador ↔ Vecino (offline-first con IndexedDB)
 */

import db from './db';

/**
 * Genera un ID de conversación consistente entre dos usuarios
 * (independiente del orden en que se pasen los nombres)
 */
export function getConversacionId(user1, user2) {
  return [user1, user2].sort().join('__');
}

/**
 * Envía un mensaje de `de` a `para`
 */
export async function enviarMensaje({ de, para, texto }) {
  if (!texto?.trim()) return { success: false, error: 'Mensaje vacío' };

  const conversacionId = getConversacionId(de, para);
  try {
    await db.mensajes.add({
      conversacionId,
      de,
      para,
      texto: texto.trim(),
      fecha: new Date().toISOString(),
      leido: false,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Obtiene todos los mensajes de una conversación, ordenados por fecha
 */
export async function getMensajes(conversacionId) {
  return db.mensajes
    .where('conversacionId')
    .equals(conversacionId)
    .sortBy('fecha');
}

/**
 * Marca como leídos todos los mensajes dirigidos a `userId` en una conversación
 */
export async function marcarLeidos(conversacionId, userId) {
  const ids = await db.mensajes
    .where('conversacionId')
    .equals(conversacionId)
    .filter(m => m.para === userId && !m.leido)
    .primaryKeys();

  if (ids.length > 0) {
    await db.mensajes.bulkUpdate(ids.map(id => ({ key: id, changes: { leido: true } })));
  }
}

/**
 * Obtiene un resumen de conversaciones para mostrar en la lista,
 * enriquecido con el último mensaje y el número de no leídos.
 * @param {string} userId - Usuario que consulta sus conversaciones
 * @param {Array} contactos - Lista de posibles contactos { user, nombre, sector? }
 */
export async function getConversaciones(userId, contactos) {
  const conversaciones = [];

  for (const contacto of contactos) {
    const convId = getConversacionId(userId, contacto.user);
    const mensajes = await db.mensajes
      .where('conversacionId')
      .equals(convId)
      .sortBy('fecha');

    const ultimoMensaje = mensajes[mensajes.length - 1] || null;
    const noLeidos = mensajes.filter(m => m.para === userId && !m.leido).length;

    conversaciones.push({
      contacto,
      conversacionId: convId,
      ultimoMensaje,
      noLeidos,
    });
  }

  // Ordenar: conversaciones con mensajes primero, luego por fecha del último mensaje
  return conversaciones.sort((a, b) => {
    if (!a.ultimoMensaje && !b.ultimoMensaje) return 0;
    if (!a.ultimoMensaje) return 1;
    if (!b.ultimoMensaje) return -1;
    return new Date(b.ultimoMensaje.fecha) - new Date(a.ultimoMensaje.fecha);
  });
}
