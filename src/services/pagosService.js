/**
 * Servicio de Pagos y Cobros — SIMAP Digital
 * Motor completo de pagos que maneja cálculos de cuotas, saldos, morosidades.
 * Soporta cobros: mensual, diario, multi_mes, parcial, adelanto, puesta_al_dia
 */

import db, { getConfig } from './db';
import { redondear, formatMesFromDate, getMesActual } from '../utils/formatters';
import { otorgarPuntos } from './puntosService';

/**
 * Obtiene la configuración actual de tarifas (cuota mensual, etc.)
 */
export async function getPaymentConfig() {
  return await getConfig();
}

/**
 * Calcula la tarifa diaria basada en la cuota mensual configurada (dividido en 30 días)
 */
export async function getCuotaDiaria() {
  const cfg = await getConfig();
  return redondear(cfg.cuotaMensual / 30);
}

/**
 * Obtiene o crea un registro de saldo para un usuario en un mes específico
 */
async function getOrCreateSaldo(userId, mes) {
  let saldo = await db.saldos.get([userId, mes]);
  if (!saldo) {
    const cfg = await getConfig();
    saldo = {
      usuarioId: userId,
      mes,
      cuotaTotal: cfg.cuotaMensual,
      pagado: 0,
      saldo: cfg.cuotaMensual,
      estado: 'pendiente',
      pagosIds: [],
    };
    await db.saldos.put(saldo);
  }
  return saldo;
}

/**
 * Actualiza el registro de saldo después de procesar un pago (resta el monto y cambia el estado)
 */
async function actualizarSaldo(userId, mes, montoPagado, pagoId) {
  const s = await getOrCreateSaldo(userId, mes);
  s.pagado = redondear(s.pagado + montoPagado);
  s.saldo = redondear(s.cuotaTotal - s.pagado);
  if (s.saldo <= 0) {
    s.saldo = 0;
    s.estado = 'pagado';
  } else {
    s.estado = 'parcial';
  }
  s.pagosIds.push(pagoId);
  await db.saldos.put(s);
  return s;
}

/**
 * Registra un nuevo pago en el sistema (Punto de entrada principal para CobrosPage)
 * Maneja todos los tipos de pago y calcula los meses cubiertos y saldos resultantes.
 */
export async function registrarPago(userId, opciones) {
  const { tipo, monto, mesesTarget, nota } = opciones;
  const cfg = await getConfig();
  const cobradorId = sessionStorage.getItem('simap_session')
    ? JSON.parse(sessionStorage.getItem('simap_session')).user
    : 'cobrador';
  const ahora = new Date();
  const resultados = [];

  const crearRecibo = async (uId, amount, payType, mesTarget, mesesCubiertos, note) => {
    const recibo = {
      idPago: Date.now() + Math.floor(Math.random() * 1000),
      usuarioId: uId,
      monto: redondear(amount),
      fecha: new Date().toISOString(),
      tipo: payType,
      mesTarget,
      mesesCubiertos,
      nota: note || '',
      cobradorId,
    };
    await db.pagos.add(recibo);
    await db.pendingSync.add({
      type: 'pago',
      data: recibo,
      timestamp: new Date().toISOString(),
    });
    return recibo;
  };

  if (tipo === 'mensual') {
    const mes = mesesTarget || getMesActual();
    const recibo = await crearRecibo(userId, cfg.cuotaMensual, tipo, mes, [mes], nota);
    await actualizarSaldo(userId, mes, cfg.cuotaMensual, recibo.idPago);
    await otorgarPuntos(userId, 5, 'Pago puntual (Mes al día)');
    resultados.push(recibo);

  } else if (tipo === 'diario') {
    const mes = mesesTarget || getMesActual();
    const montoReal = redondear(monto);
    const dias = Math.round(montoReal / redondear(cfg.cuotaMensual / 30));
    const recibo = await crearRecibo(userId, montoReal, tipo, mes, [mes], nota || `${dias} días`);
    await actualizarSaldo(userId, mes, montoReal, recibo.idPago);
    resultados.push(recibo);

  } else if (tipo === 'parcial') {
    const mes = mesesTarget || getMesActual();
    const montoReal = redondear(monto);
    const recibo = await crearRecibo(userId, montoReal, tipo, mes, [mes], nota);
    await actualizarSaldo(userId, mes, montoReal, recibo.idPago);
    resultados.push(recibo);

  } else if (tipo === 'multi_mes') {
    const numMeses = Math.round(monto / cfg.cuotaMensual);
    const meses = Array.isArray(mesesTarget)
      ? mesesTarget
      : generateMonths(ahora, numMeses);
    for (const mes of meses) {
      const recibo = await crearRecibo(userId, cfg.cuotaMensual, tipo, mes, meses, nota);
      await actualizarSaldo(userId, mes, cfg.cuotaMensual, recibo.idPago);
      resultados.push(recibo);
    }
    await otorgarPuntos(userId, numMeses * 10, `Pago de múltiples meses (${numMeses})`);

  } else if (tipo === 'adelanto') {
    const numMeses = Math.round(monto / cfg.cuotaMensual);
    const cursor = new Date(ahora);
    cursor.setMonth(cursor.getMonth() + 1);
    const meses = Array.isArray(mesesTarget)
      ? mesesTarget
      : generateMonths(cursor, numMeses);
    for (const mes of meses) {
      const recibo = await crearRecibo(userId, cfg.cuotaMensual, tipo, mes, meses, nota);
      await actualizarSaldo(userId, mes, cfg.cuotaMensual, recibo.idPago);
      resultados.push(recibo);
    }
    await otorgarPuntos(userId, numMeses * 10, `Pago adelantado (${numMeses} meses)`);

  } else if (tipo === 'puesta_al_dia') {
    const mesesPendientes = await getMesesPendientes(userId);
    for (const mes of mesesPendientes) {
      const saldo = await db.saldos.get([userId, mes]);
      const montoPagar = saldo ? saldo.saldo : cfg.cuotaMensual;
      if (montoPagar > 0) {
        const recibo = await crearRecibo(userId, montoPagar, tipo, mes, mesesPendientes, nota);
        await actualizarSaldo(userId, mes, montoPagar, recibo.idPago);
        resultados.push(recibo);
      }
    }
  }

  // Sync user status
  await syncUserStatus(userId);

  return resultados;
}

/**
 * Calcula el estado actual de pago de un usuario (activo, parcial, moroso, corte)
 */
export async function calcularEstado(userId) {
  const mesActual = getMesActual();
  const saldoActual = await db.saldos.get([userId, mesActual]);
  const cfg = await getConfig();

  if (saldoActual && saldoActual.estado === 'pagado') {
    const deudaAnterior = await contarMesesSinPagar(userId);
    return deudaAnterior > 0 ? 'moroso' : 'activo';
  }
  if (saldoActual && saldoActual.estado === 'parcial') return 'parcial';

  const mesesDeuda = await contarMesesSinPagar(userId);
  if (mesesDeuda >= cfg.mesesGraciaCorte) return 'corte';
  if (mesesDeuda >= 1) return 'moroso';
  return 'activo';
}

/**
 * Cuenta los meses consecutivos sin pagar retrocediendo desde el mes actual
 */
async function contarMesesSinPagar(userId) {
  let count = 0;
  const cursor = new Date();
  for (let i = 0; i < 36; i++) {
    const mes = formatMesFromDate(cursor);
    const saldo = await db.saldos.get([userId, mes]);
    if (saldo && saldo.estado === 'pagado') break;
    if (!saldo || saldo.estado === 'pendiente' || saldo.estado === 'parcial') {
      count++;
    }
    cursor.setMonth(cursor.getMonth() - 1);
  }
  return count;
}

/**
 * Obtiene el monto total de deuda acumulada del usuario
 */
export async function getDeudaTotal(userId) {
  const cfg = await getConfig();
  let total = 0;
  const cursor = new Date();
  for (let i = 0; i < 36; i++) {
    const mes = formatMesFromDate(cursor);
    const saldo = await db.saldos.get([userId, mes]);
    if (saldo && saldo.estado === 'pagado') break;
    if (saldo && saldo.estado === 'parcial') {
      total += saldo.saldo;
    } else {
      total += cfg.cuotaMensual;
    }
    cursor.setMonth(cursor.getMonth() - 1);
  }
  return redondear(total);
}

/**
 * Calcula cuántos meses hacia el futuro ha pagado el usuario por adelantado
 */
export async function getMesesAdelantados(userId) {
  let count = 0;
  const cursor = new Date();
  cursor.setMonth(cursor.getMonth() + 1);
  for (let i = 0; i < 24; i++) {
    const mes = formatMesFromDate(cursor);
    const saldo = await db.saldos.get([userId, mes]);
    if (saldo && saldo.estado === 'pagado') {
      count++;
    } else {
      break;
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return count;
}

/**
 * Obtiene un resumen completo del estado financiero del usuario
 */
export async function getResumenUsuario(userId) {
  const estado = await calcularEstado(userId);
  const deuda = await getDeudaTotal(userId);
  const mesesDeuda = await contarMesesSinPagar(userId);
  const adelantados = await getMesesAdelantados(userId);
  const pagos = await db.pagos
    .where('usuarioId').equals(userId)
    .toArray();
  const ultimoPago = pagos.length > 0 ? pagos[pagos.length - 1].fecha : null;

  return { estado, deuda, mesesDeuda, adelantados, ultimoPago, totalPagos: pagos.length };
}

/**
 * Obtiene la lista de meses que el usuario tiene pendientes por pagar
 */
async function getMesesPendientes(userId) {
  const pendientes = [];
  const cursor = new Date();
  for (let i = 0; i < 36; i++) {
    const mes = formatMesFromDate(cursor);
    const saldo = await db.saldos.get([userId, mes]);
    if (saldo && saldo.estado === 'pagado') break;
    pendientes.unshift(mes);
    cursor.setMonth(cursor.getMonth() - 1);
  }
  return pendientes;
}

/**
 * Genera un arreglo con cadenas de texto de los meses siguientes a partir de una fecha
 */
function generateMonths(desde, cantidad) {
  const meses = [];
  const cursor = new Date(desde);
  for (let i = 0; i < cantidad; i++) {
    meses.push(formatMesFromDate(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return meses;
}

/**
 * Sincroniza el estado calculado del usuario con la tabla principal de usuarios
 */
async function syncUserStatus(userId) {
  const user = await db.usuarios.get(userId);
  if (user) {
    const estado = await calcularEstado(userId);
    const mesesDeuda = await contarMesesSinPagar(userId);
    await db.usuarios.update(userId, {
      pagadoEsteMes: estado === 'activo',
      mesesSinPagar: mesesDeuda,
    });
  }
}

/**
 * Verifica si un usuario ya ha pagado completamente un mes específico
 */
export async function hasPaidMonth(userId, mes) {
  const saldo = await db.saldos.get([userId, mes]);
  return saldo && saldo.estado === 'pagado';
}

/**
 * Obtiene todo el historial de pagos de un usuario
 */
export async function getPagosUsuario(userId) {
  return await db.pagos
    .where('usuarioId').equals(userId)
    .toArray();
}

/**
 * Obtiene la cantidad de transacciones pendientes de sincronizar a la nube
 */
export async function getPendingSyncCount() {
  return await db.pendingSync.count();
}

/**
 * Limpia la cola de sincronización pendiente (después de una sincronización exitosa)
 */
export async function clearPendingSync() {
  await db.pendingSync.clear();
}
