/**
 * Formatting utilities for SIMAP Digital
 */

import { MESES_CORTOS } from './constants';

/**
 * Format currency in Panamanian Balboas
 */
export function formatMonto(amount) {
  return `B/.${parseFloat(amount || 0).toFixed(2)}`;
}

/**
 * Format a month string (e.g. "2024-03") to human-readable
 */
export function formatMes(mesStr) {
  if (!mesStr) return '-';
  const [y, m] = mesStr.split('-').map(Number);
  return `${MESES_CORTOS[m - 1]} ${y}`;
}

/**
 * Get current month as YYYY-MM string
 */
export function getMesActual() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Format a month from a Date object to YYYY-MM
 */
export function formatMesFromDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Parse a YYYY-MM string to a Date
 */
export function parseMes(mesStr) {
  const [y, m] = mesStr.split('-').map(Number);
  return new Date(y, m - 1, 1);
}

/**
 * Format an ISO date string to a localized short date
 */
export function formatFecha(isoString) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  if (isNaN(d)) return isoString;
  return d.toLocaleDateString('es-PA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a relative time (e.g. "hace 2 horas")
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d)) return '';

  const now = new Date();
  const diff = now - d;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${hours}h`;
  if (days < 7) return `hace ${days}d`;
  return formatFecha(isoString);
}

/**
 * Round to 2 decimal places (currency-safe)
 */
export function redondear(val) {
  return Math.round(val * 100) / 100;
}

/**
 * Generate an array of YYYY-MM strings starting from a date
 */
export function generarMeses(desde, cantidad) {
  const meses = [];
  const cursor = new Date(desde);
  for (let i = 0; i < cantidad; i++) {
    meses.push(formatMesFromDate(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return meses;
}

/**
 * Generate future months (starting from next month)
 */
export function generarMesesFuturos(desde, cantidad) {
  const cursor = new Date(desde);
  cursor.setMonth(cursor.getMonth() + 1);
  return generarMeses(cursor, cantidad);
}

/**
 * Get initials from a name (max 2 chars)
 */
export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generate a deterministic color from a string (for avatars)
 */
export function stringToColor(str) {
  if (!str) return '#0d9488';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#0d9488', '#0891b2', '#7c3aed', '#db2777',
    '#ea580c', '#ca8a04', '#059669', '#4f46e5',
    '#be185d', '#9333ea', '#0284c7', '#65a30d',
  ];
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Generate a unique ID
 */
export function generateId(prefix = 'id') {
  return `__`;
}

