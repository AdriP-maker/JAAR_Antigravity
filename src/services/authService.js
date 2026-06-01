/**
 * Servicio de Autenticación — JAAR Digital
 * Maneja el inicio de sesión, cierre de sesión, persistencia de sesión y acceso basado en roles.
 */

import { SYSTEM_USERS, ROLE_HOME } from '../utils/constants';
import db from './db';

const SESSION_KEY = 'jaar_session';

/**
 * Intenta iniciar sesión con credenciales provistas.
 * Verifica primero los usuarios del sistema (constantes) y luego la base local.
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Promise<{ success: boolean, error?: string, user?: object }>}
 */
export async function login(username, password) {
  const u = username.trim().toLowerCase();

  // Check system users first
  let user = SYSTEM_USERS.find(x => x.user === u && x.pass === password);

  // Check registered users in IndexedDB
  if (!user) {
    const registered = await db.registeredUsers.get(u);
    if (registered && registered.pass === password) {
      user = registered;
    }
  }

  if (!user) {
    return { success: false, error: 'Usuario o contraseña incorrectos.' };
  }

  if (user.estado === 'pendiente') {
    return { success: false, error: '⏳ Tu cuenta aún no ha sido aprobada por el administrador.' };
  }
  if (user.estado === 'rechazado') {
    return { success: false, error: '❌ Tu solicitud fue rechazada. Contacta al administrador.' };
  }
  if (user.estado === 'suspendido') {
    return { success: false, error: '⚠️ Tu cuenta ha sido suspendida. Contacta al administrador.' };
  }

  // Save session
  const session = {
    user: user.user,
    rol: user.rol,
    nombre: user.nombre || user.user,
    loginAt: new Date().toISOString(),
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return { success: true, user: session };
}

/**
 * Cierra la sesión del usuario actual eliminándola de sessionStorage
 */
export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Obtiene la sesión actual almacenada, si existe
 * @returns {object|null} Objeto de sesión o null si no hay sesión activa
 */
export function getSession() {
  try {
    const data = sessionStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Verifica si existe un usuario autenticado en el sistema
 * @returns {boolean} true si está autenticado
 */
export function isAuthenticated() {
  return getSession() !== null;
}

/**
 * Obtiene la ruta de inicio (home) correspondiente a un rol específico
 * @param {string} role - Rol del usuario (ej. 'admin', 'cobrador')
 * @returns {string} Ruta de redirección
 */
export function getHomeRoute(role) {
  return ROLE_HOME[role] || '/login';
}

/**
 * Comprueba si un rol tiene permiso para acceder a una ruta determinada
 * @param {string} role - Rol del usuario
 * @param {string} path - Ruta que intenta visitar
 * @returns {boolean} true si tiene permiso
 */
export function isRouteAllowed(role, path) {
  const rules = {
    admin: ['/admin', '/puntos-admin'],
    cobrador: ['/cobros', '/jornales', '/gastos', '/comisiones', '/reporte', '/foro', '/chat', '/mapa'],
    minsa: ['/reporte'],
    cliente: ['/historial', '/foro', '/chat'],
    dev: ['/admin'], // Solo auditoría y monitoreo
  };

  const allowed = rules[role] || [];
  return allowed.some(r => path.startsWith(r));
}

/**
 * Registra un nuevo usuario vecino (Queda pendiente de aprobación del administrador)
 * @param {object} userData - Datos del usuario (user, pass, nombre, casa, sector)
 */
export async function registerUser({ user, pass, nombre, casa, sector }) {
  const existing = await db.registeredUsers.get(user.toLowerCase());
  if (existing) {
    return { success: false, error: 'Este nombre de usuario ya existe.' };
  }

  // Check system users
  if (SYSTEM_USERS.some(s => s.user === user.toLowerCase())) {
    return { success: false, error: 'Este nombre de usuario está reservado.' };
  }

  await db.registeredUsers.add({
    user: user.toLowerCase(),
    pass,
    nombre,
    casa: casa || '',
    sector: sector || '',
    rol: 'cliente',
    estado: 'pendiente',
    fechaRegistro: new Date().toISOString(),
  });

  return { success: true };
}

/**
 * Recupera el usuario asociado a un número de casa
 * @param {string} casa - Identificador de la casa
 */
export async function recoverByHouse(casa) {
  const allRegistered = await db.registeredUsers.toArray();
  const user = allRegistered.find(u => u.casa && u.casa.toLowerCase() === casa.toLowerCase());
  if (!user) return null;
  return { user: user.user, nombre: user.nombre };
}

/**
 * Registrar nueva Junta Comunal (B2B)
 */
export async function registerJunta({ nombre_junta, ruc, admin_user, pass, email }) {
  const existingUser = await db.registeredUsers.get(admin_user.toLowerCase());
  if (existingUser) return { success: false, error: 'Usuario administrador ya existe' };
  
  await db.juntas.add({
    nombre: nombre_junta,
    ruc,
    email,
    estado: 'pendiente_global',
    fechaRegistro: new Date().toISOString()
  });

  await db.registeredUsers.add({
    user: admin_user.toLowerCase(),
    pass,
    nombre: nombre_junta,
    rol: 'admin',
    estado: 'pendiente',
    fechaRegistro: new Date().toISOString()
  });

  return { success: true };
}

