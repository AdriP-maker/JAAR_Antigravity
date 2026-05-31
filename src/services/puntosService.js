/**
 * puntosService.js — JAAR Digital
 * Motor de Gamificación para recompensar el buen comportamiento
 */

import db from './db';

/**
 * Otorgar puntos a un vecino por una buena acción
 * @param {string|number} usuarioId - ID del vecino
 * @param {number} cantidad - Puntos a sumar
 * @param {string} motivo - Descripción de la acción
 */
export async function otorgarPuntos(usuarioId, cantidad, motivo) {
  if (cantidad <= 0) return;
  
  await db.puntos_historial.add({
    usuarioId: String(usuarioId),
    cantidad: cantidad,
    tipo_transaccion: 'ganancia',
    motivo: motivo,
    fecha: new Date().toISOString()
  });
}

/**
 * Canjear puntos como descuento
 * @param {string|number} usuarioId - ID del vecino
 * @param {number} cantidad - Puntos a descontar
 * @param {string} motivo - Descripción de la compra/canje
 */
export async function canjearPuntos(usuarioId, cantidad, motivo = 'Descuento en cobro') {
  const saldoActual = await obtenerSaldoPuntos(usuarioId);
  if (cantidad > saldoActual) {
    throw new Error('No hay suficientes puntos para canjear');
  }

  await db.puntos_historial.add({
    usuarioId: String(usuarioId),
    cantidad: cantidad,
    tipo_transaccion: 'canje',
    motivo: motivo,
    fecha: new Date().toISOString()
  });
}

/**
 * Obtener el saldo total de puntos de un vecino
 * @param {string|number} usuarioId 
 * @returns {number} Saldo actual
 */
export async function obtenerSaldoPuntos(usuarioId) {
  const historial = await db.puntos_historial
    .where('usuarioId').equals(String(usuarioId))
    .toArray();
    
  let saldo = 0;
  for (const h of historial) {
    if (h.tipo_transaccion === 'ganancia') {
      saldo += h.cantidad;
    } else if (h.tipo_transaccion === 'canje') {
      saldo -= h.cantidad;
    }
  }
  return saldo;
}

/**
 * Equivalencia de puntos a balboas (Ej. 100 puntos = $1.00)
 */
export function calcularDescuentoBalboas(puntos) {
  return puntos / 100; // 1 punto = 1 centavo
}

export function balboasAPuntos(balboas) {
  return Math.floor(balboas * 100);
}
