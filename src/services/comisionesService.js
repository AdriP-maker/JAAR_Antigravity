/**
 * comisionesService.js — JAAR Digital
 * Calculate earnings distributions based on settings and payments
 */

import db, { getConfig } from './db';

/**
 * Get the global earnings distribution setup
 */
export async function getComisionesConfig() {
  const cfg = await getConfig();
  return {
    splitDevs: cfg.splitDevs || 0.60,
    splitCobrador: cfg.splitCobrador || 0.40,
    comisionPorPago: cfg.comisionPorPago || 1.00
  };
}

/**
 * Calculate the comisiones from all payments
 */
export async function calculateComisiones() {
  const pagos = await db.pagos.toArray();
  const config = await getComisionesConfig();

  let totalRecaudado = 0;
  let totalComisionFija = 0;

  // We assume here that standard pagocuotadiaria or pagocuota standard 
  // includes the fixed commission if we apply it per transaction.
  // For simplicity, we just calculate the splits from total.
  pagos.forEach(p => {
    totalRecaudado += parseFloat(p.monto || 0); // Assuming monto is stored in future versions or derived
    // If 'monto' isn't explicitly on the 'pagos' row, we approximate for the demo:
    // If it's a 'pago' row, it might just be the base cuota.
  });

  // Let's actually pull the config for base quota to compute the amount 
  const generalCfg = await getConfig();
  const cuota = generalCfg.cuotaDiaria || 3.00; // Base if not found

  // Recalculate accurately if monto is missing by just assigning cuota
  let montoReal = 0;
  pagos.forEach(p => {
    const val = p.monto ? parseFloat(p.monto) : cuota;
    montoReal += val;
  });

  const devShare = montoReal * config.splitDevs;
  const cobradorShare = montoReal * config.splitCobrador;

  return {
    totalRecaudado: montoReal,
    devShare,
    cobradorShare,
    pagosCount: pagos.length,
    config
  };
}

/**
 * Update the split percentages
 */
export async function updateComisionesConfig(splitDevs, splitCobrador) {
  if (splitDevs + splitCobrador !== 1.0) {
    return { success: false, error: 'Los porcentajes deben sumar 100% (1.0)' };
  }
  
  const cfg = await getConfig();
  cfg.splitDevs = splitDevs;
  cfg.splitCobrador = splitCobrador;
  
  await db.config.put({ key: 'general', ...cfg });
  return { success: true };
}
