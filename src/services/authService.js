/**
 * Servicio de Autenticación — SIMAP Digital (Migrado a Supabase)
 */

import { supabase } from './supabase';
import { ROLE_HOME } from '../utils/constants';
import db from './db';
import { syncFromSupabase } from './syncService';

const SESSION_KEY = 'simap_session';

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return { success: false, error: 'Usuario o contraseña incorrectos o error de red.' };
  }

  // Get user profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();

  if (profile) {
    if (profile.estado === 'pendiente') return { success: false, error: '⏳ Tu cuenta aún no ha sido aprobada.' };
    if (profile.estado === 'rechazado') return { success: false, error: '❌ Tu solicitud fue rechazada.' };
    if (profile.estado === 'suspendido') return { success: false, error: '⚠️ Tu cuenta ha sido suspendida.' };
  }

  const session = {
    user: data.user.email,
    rol: profile?.rol || 'cliente',
    nombre: profile?.nombre || data.user.email,
    uid: data.user.id,
    loginAt: new Date().toISOString(),
  };

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

  // Iniciar sincronización Offline-First con Dexie
  await syncFromSupabase();

  return { success: true, user: session };
}

export async function logout() {
  await supabase.auth.signOut();
  sessionStorage.removeItem(SESSION_KEY);
  // Limpiar base local por seguridad al cerrar sesión
  await db.usuarios.clear();
  await db.pagos.clear();
  await db.saldos.clear();
}

export function getSession() {
  try {
    const data = sessionStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return getSession() !== null;
}

export function getHomeRoute(role) {
  return ROLE_HOME[role] || '/login';
}

export function isRouteAllowed(role, path) {
  const rules = {
    admin: ['/admin', '/puntos-admin'],
    cobrador: ['/cobros', '/jornales', '/gastos', '/comisiones', '/reporte', '/foro', '/chat', '/mapa'],
    minsa: ['/reporte'],
    cliente: ['/historial', '/foro', '/chat'],
    dev: ['/admin'],
  };
  const allowed = rules[role] || [];
  return allowed.some(r => path.startsWith(r));
}

export async function registerUser({ email, pass, nombre, sector }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password: pass,
    options: {
      data: {
        nombre: nombre,
        sector: sector,
      }
    }
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}
