/**
 * Configuración de la Base de Datos IndexedDB con Dexie.js
 * JAAR Digital — Capa de almacenamiento Offline-First
 */

import Dexie from 'dexie';
import { DEMO_USERS, DEMO_GASTOS, DEFAULT_CONFIG } from '../utils/constants';

export const db = new Dexie('JAARDigital');

db.version(1).stores({
  usuarios: '++id, nombre, sector',
  pagos: '++idPago, usuarioId, tipo, mesTarget, fecha',
  saldos: '[usuarioId+mes], estado',
  gastos: '++id, fecha',
  jornales: '++id, miembroId, fecha',
  pendingSync: '++id, type, timestamp',
  config: 'key',
  registeredUsers: 'user, rol, estado',
});

db.version(2).stores({
  foro: '++id, fecha, autor',
});

db.version(3).stores({
  juntas: '++id, nombre, ruc, estado', // For B2B registration
  auditoria: '++id, timestamp, accion, user_id, afectado_id', // Audit logs
  archivos: '++id, pagoId, fileHash, fileName' // Blob storage metadata
});

db.version(4).stores({
  puntos_historial: '++id, usuarioId, fecha, tipo_transaccion',
});

db.version(5).stores({
  notificaciones: '++id, usuarioId, fecha, leido',
});

/**
 * Inicializa la base de datos con datos de prueba si está vacía.
 * También ejecuta la migración desde localStorage si existen datos antiguos.
 */
export async function initDB() {
  const userCount = await db.usuarios.count();
  if (userCount === 0) {
    await db.usuarios.bulkAdd(DEMO_USERS.map(u => ({
      ...u,
      id: u.id,
    })));
  }

  const gastoCount = await db.gastos.count();
  if (gastoCount === 0) {
    await db.gastos.bulkAdd(DEMO_GASTOS);
  }

  const configExists = await db.config.get('general');
  if (!configExists) {
    await db.config.put({ key: 'general', ...DEFAULT_CONFIG });
  }

  // Migrate from localStorage if data exists there
  await migrateFromLocalStorage();
}

/**
 * Migra los datos heredados desde localStorage a IndexedDB (se ejecuta una sola vez)
 */
async function migrateFromLocalStorage() {
  const migrated = await db.config.get('ls_migrated');
  if (migrated) return;

  try {
    // Migrate users
    const lsUsers = localStorage.getItem('jaar_users');
    if (lsUsers) {
      const users = JSON.parse(lsUsers);
      if (users.length > 0) {
        await db.usuarios.clear();
        await db.usuarios.bulkAdd(users);
      }
    }

    // Migrate pagos
    const lsPagos = localStorage.getItem('jaar_pagos');
    if (lsPagos) {
      const pagos = JSON.parse(lsPagos);
      if (pagos.length > 0) {
        for (const p of pagos) {
          const existing = await db.pagos.get(p.idPago);
          if (!existing) {
            await db.pagos.add(p);
          }
        }
      }
    }

    // Migrate gastos
    const lsGastos = localStorage.getItem('jaar_gastos');
    if (lsGastos) {
      const gastos = JSON.parse(lsGastos);
      if (gastos.length > 0) {
        await db.gastos.clear();
        await db.gastos.bulkAdd(gastos);
      }
    }

    // Migrate registered users
    const lsRegistered = localStorage.getItem('jaar_usuarios');
    if (lsRegistered) {
      const registered = JSON.parse(lsRegistered);
      if (registered.length > 0) {
        for (const u of registered) {
          const existing = await db.registeredUsers.get(u.user);
          if (!existing) {
            await db.registeredUsers.add(u);
          }
        }
      }
    }

    // Mark as migrated
    await db.config.put({ key: 'ls_migrated', value: true });
    console.log('[JAAR] localStorage → IndexedDB migration complete');
  } catch (err) {
    console.warn('[JAAR] Migration error:', err);
  }
}

/**
 * Obtiene la configuración general del sistema
 */
export async function getConfig() {
  const cfg = await db.config.get('general');
  return cfg || DEFAULT_CONFIG;
}

/**
 * Guarda o actualiza la configuración general del sistema
 */
export async function saveConfig(cfg) {
  await db.config.put({ key: 'general', ...cfg });
}

export default db;
