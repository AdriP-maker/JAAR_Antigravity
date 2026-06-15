/**
 * foroService.js — SIMAP Digital
 * Service layer for the community announcements wall
 */

import db from './db';
import { generateId } from '../utils/formatters';

/**
 * Get all forum posts, ordered by date descending
 */
export async function getAllPosts() {
  const posts = await db.foro.toArray();
  return posts.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

/**
 * Create a new announcement
 */
export async function createPost({ autor, titulo, contenido }) {
  if (!titulo || !contenido) {
    return { success: false, error: 'Faltan datos obligatorios' };
  }

  const record = {
    id: generateId('post'),
    autor: autor || 'Directiva',
    titulo,
    contenido,
    fecha: new Date().toISOString()
  };

  await db.foro.add(record);

  await db.pendingSync.add({
    type: 'ADD_POST',
    payload: record,
    timestamp: new Date().getTime(),
  });

  return { success: true, record };
}

/**
 * Delete a post
 */
export async function deletePost(id) {
  await db.foro.delete(id);
  return { success: true };
}
