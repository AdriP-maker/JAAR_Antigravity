/**
 * jornalesService.js — SIMAP Digital
 * Service layer for managing community workdays (jornales)
 */

import db from './db';
import { generateId } from '../utils/formatters';

/**
 * Get all jornales records
 * @returns {Promise<Array>} List of jornales
 */
export async function getAllJornales() {
  return await db.jornales.toArray();
}

/**
 * Get jornales for a specific user
 * @param {string|number} userId 
 * @returns {Promise<Array>} List of jornales
 */
export async function getJornalesByUser(userId) {
  return await db.jornales.where('miembroId').equals(String(userId)).toArray();
}

/**
 * Register a new jornal record
 * @param {Object} data - Jornal data (miembroId, fecha, asiste, quien, multa, horas)
 */
export async function registerJornal(data) {
  const { miembroId, fecha, asiste, quien, multa, horas } = data;

  if (!miembroId || !fecha || !asiste) {
    return { success: false, error: 'Faltan datos obligatorios' };
  }

  const record = {
    id: generateId('jor'),
    miembroId: String(miembroId),
    fecha,
    asiste,
    quien: asiste === 'si' ? (quien || 'titular') : null,
    multa: asiste === 'no' ? parseFloat(multa) || 0 : 0,
    horas: asiste === 'si' ? parseFloat(horas) || 0 : 0,
    timestamp: new Date().toISOString()
  };

  await db.jornales.add(record);
  
  // Create sync task for offline-first
  await db.pendingSync.add({
    type: 'ADD_JORNAL',
    payload: record,
    timestamp: new Date().getTime(),
  });

  return { success: true, record };
}

/**
 * Delete a jornal record
 * @param {string} jornalId 
 */
export async function deleteJornal(jornalId) {
  await db.jornales.delete(jornalId);
  return { success: true };
}
