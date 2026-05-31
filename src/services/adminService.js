/**
 * adminService.js — JAAR Digital
 * Service layer for managing application users (neighbors, collectors, admins)
 */

import db from './db';

/**
 * Get all registered users (for login access)
 * @returns {Promise<Array>} List of users
 */
export async function getRegisteredUsers() {
  return await db.registeredUsers.toArray();
}

/**
 * Approve a pending user and activate their account
 * @param {string} userUsername - The user ID/username to approve
 */
export async function approveUser(userUsername) {
  const user = await db.registeredUsers.get(userUsername);
  if (user) {
    user.estado = 'activo';
    await db.registeredUsers.put(user);
    return { success: true };
  }
  return { success: false, error: 'Usuario no encontrado' };
}

/**
 * Reject a pending user
 * @param {string} userUsername - The user ID/username to reject
 */
export async function rejectUser(userUsername) {
  const user = await db.registeredUsers.get(userUsername);
  if (user) {
    user.estado = 'rechazado';
    await db.registeredUsers.put(user);
    return { success: true };
  }
  return { success: false, error: 'Usuario no encontrado' };
}

/**
 * Suspend an active user
 * @param {string} userUsername - The user ID/username to suspend
 */
export async function suspendUser(userUsername) {
  const user = await db.registeredUsers.get(userUsername);
  if (user) {
    user.estado = 'suspendido';
    await db.registeredUsers.put(user);
    return { success: true };
  }
  return { success: false, error: 'Usuario no encontrado' };
}

/**
 * Reset a user's password
 * @param {string} userUsername - The user ID/username
 * @param {string} newPassword - The new password
 */
export async function resetUserPassword(userUsername, newPassword) {
  if (!newPassword || newPassword.length < 4) {
    return { success: false, error: 'La contraseña debe tener al menos 4 caracteres' };
  }
  
  const user = await db.registeredUsers.get(userUsername);
  if (user) {
    user.pass = newPassword;
    await db.registeredUsers.put(user);
    return { success: true };
  }
  return { success: false, error: 'Usuario no encontrado' };
}

/**
 * Update user role
 * @param {string} userUsername - The user ID/username
 * @param {string} newRole - The new role ('admin', 'cobrador', 'cliente')
 */
export async function updateUserRole(userUsername, newRole) {
  const validRoles = ['admin', 'cobrador', 'cliente'];
  if (!validRoles.includes(newRole)) {
    return { success: false, error: 'Rol inválido' };
  }

  const user = await db.registeredUsers.get(userUsername);
  if (user) {
    user.rol = newRole;
    await db.registeredUsers.put(user);
    return { success: true };
  }
  return { success: false, error: 'Usuario no encontrado' };
}
