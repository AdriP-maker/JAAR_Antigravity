/**
 * Servicio de Sincronización — SIMAP Digital
 * Descarga datos de Supabase a la caché local (Dexie) para soporte Offline-First.
 */

import { supabase } from './supabase';
import db from './db';

export async function syncFromSupabase() {
  try {
    // 1. Descargar Usuarios
    const { data: usuarios } = await supabase.from('usuarios').select('*');
    if (usuarios && usuarios.length > 0) {
      await db.usuarios.clear();
      await db.usuarios.bulkAdd(usuarios);
    }

    // 2. Descargar Pagos
    const { data: pagos } = await supabase.from('pagos').select('*');
    if (pagos && pagos.length > 0) {
      // Map id_pago from Supabase to idPago for Dexie compatibility if needed
      const mappedPagos = pagos.map(p => ({
        ...p,
        idPago: p.id_pago,
        usuarioId: p.usuario_id,
        mesTarget: p.mes_target
      }));
      await db.pagos.clear();
      await db.pagos.bulkAdd(mappedPagos);
    }

    // 3. Descargar Saldos
    const { data: saldos } = await supabase.from('saldos').select('*');
    if (saldos && saldos.length > 0) {
      const mappedSaldos = saldos.map(s => ({
        ...s,
        usuarioId: s.usuario_id
      }));
      await db.saldos.clear();
      await db.saldos.bulkAdd(mappedSaldos);
    }

    // 4. Descargar Gastos
    const { data: gastos } = await supabase.from('gastos').select('*');
    if (gastos && gastos.length > 0) {
      await db.gastos.clear();
      await db.gastos.bulkAdd(gastos);
    }

    // (Add sync for other tables if necessary)

    console.log('[Sync] Descarga desde Supabase completada con éxito.');
  } catch (error) {
    console.error('[Sync] Error sincronizando con Supabase:', error);
  }
}

/**
 * Función para enviar pagos nuevos (offline) a Supabase.
 * Se debe llamar cuando haya conexión a internet.
 */
export async function pushToSupabase(pago) {
  try {
    const { data, error } = await supabase.from('pagos').insert({
      usuario_id: pago.usuarioId,
      tipo: pago.tipo,
      mes_target: pago.mesTarget,
      fecha: pago.fecha,
      estado: pago.estado || 'completado'
    });
    return { success: !error, error };
  } catch (err) {
    return { success: false, error: err };
  }
}
