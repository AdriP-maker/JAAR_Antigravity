/**
 * gastosService.js — JAAR Digital
 * Service layer for managing community expenses
 */

import db from './db';
import { generateId } from '../utils/formatters';

/**
 * Get all gastos
 * @returns {Promise<Array>} List of gastos ordered by date
 */
export async function getAllGastos() {
  const gastos = await db.gastos.toArray();
  // Sort descending by date/timestamp
  return gastos.sort((a, b) => {
    return new Date(b.fecha) - new Date(a.fecha);
  });
}

/**
 * Add a new gasto
 * @param {Object} data - Gasto data (monto, desc, fecha)
 */
export async function addGasto(data) {
  const { monto, desc, fecha } = data;

  if (!monto || !desc || !fecha) {
    return { success: false, error: 'Faltan datos obligatorios (monto, descripción, fecha)' };
  }

  const record = {
    id: generateId('gst'),
    monto: parseFloat(monto),
    desc,
    fecha,
    timestamp: new Date().toISOString()
  };

  await db.gastos.add(record);

  // Create sync task for offline-first
  await db.pendingSync.add({
    type: 'ADD_GASTO',
    payload: record,
    timestamp: new Date().getTime(),
  });

  return { success: true, record };
}

/**
 * Calculate total expenses
 * @returns {Promise<number>} Total amount of expenses
 */
export async function getTotalGastos() {
  const gastos = await db.gastos.toArray();
  return gastos.reduce((sum, g) => sum + (parseFloat(g.monto) || 0), 0);
}
