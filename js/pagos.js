/**
 * js/pagos.js — Motor de Pagos Flexibles para JAAR Digital
 * Soporta: mensual, diario, multi-mes, parcial, adelanto, puesta al día
 */

const PagosEngine = {

    MIGRATION_KEY: 'jaar_migration_v2',

    init() {
        if (!localStorage.getItem('jaar_config')) {
            localStorage.setItem('jaar_config', JSON.stringify({
                cuotaMensual: 3.00,
                permitirParciales: true,
                mesesGraciaCorte: 3
            }));
        }
        if (!localStorage.getItem('jaar_saldos')) {
            localStorage.setItem('jaar_saldos', JSON.stringify({}));
        }
        if (!localStorage.getItem(this.MIGRATION_KEY)) {
            this.migrarDatosAntiguos();
        }
        this._verificarMesActual();
    },

    // ── Configuración ──

    getConfig() {
        return JSON.parse(localStorage.getItem('jaar_config') || '{}');
    },

    saveConfig(cfg) {
        localStorage.setItem('jaar_config', JSON.stringify(cfg));
    },

    getCuotaDiaria() {
        return this._redondear(this.getConfig().cuotaMensual / 30);
    },

    // ── Libro Mayor de Saldos ──

    getSaldos() {
        return JSON.parse(localStorage.getItem('jaar_saldos') || '{}');
    },

    saveSaldos(saldos) {
        localStorage.setItem('jaar_saldos', JSON.stringify(saldos));
    },

    getSaldo(userId, mes) {
        const saldos = this.getSaldos();
        return saldos[userId + '_' + mes] || null;
    },

    _crearSaldo(userId, mes) {
        const saldos = this.getSaldos();
        const key = userId + '_' + mes;
        if (!saldos[key]) {
            const cfg = this.getConfig();
            saldos[key] = {
                usuarioId: userId,
                mes: mes,
                cuotaTotal: cfg.cuotaMensual,
                pagado: 0,
                saldo: cfg.cuotaMensual,
                estado: 'pendiente',
                pagosIds: []
            };
            this.saveSaldos(saldos);
        }
        return saldos[key];
    },

    _actualizarSaldo(userId, mes, montoPagado, pagoId) {
        const saldos = this.getSaldos();
        const key = userId + '_' + mes;
        if (!saldos[key]) this._crearSaldo(userId, mes);

        const s = this.getSaldos()[key];
        s.pagado = this._redondear(s.pagado + montoPagado);
        s.saldo = this._redondear(s.cuotaTotal - s.pagado);
        if (s.saldo <= 0) {
            s.saldo = 0;
            s.estado = 'pagado';
        } else {
            s.estado = 'parcial';
        }
        s.pagosIds.push(pagoId);

        const all = this.getSaldos();
        all[key] = s;
        this.saveSaldos(all);
        return s;
    },

    // ── Operaciones de Pago ──

    registrarPago(userId, opciones) {
        const { tipo, monto, mesesTarget, nota } = opciones;
        const cfg = this.getConfig();
        const cobradorId = localStorage.getItem('jaar_username') || 'cobrador';
        const ahora = new Date();
        const resultados = [];

        if (tipo === 'mensual') {
            const mes = mesesTarget || this._formatMes(ahora);
            const recibo = this._crearRecibo(userId, cfg.cuotaMensual, tipo, mes, [mes], nota, cobradorId);
            this._actualizarSaldo(userId, mes, cfg.cuotaMensual, recibo.idPago);
            resultados.push(recibo);

        } else if (tipo === 'diario') {
            const dias = monto / this.getCuotaDiaria();
            const mes = mesesTarget || this._formatMes(ahora);
            const montoReal = this._redondear(monto);
            const recibo = this._crearRecibo(userId, montoReal, tipo, mes, [mes], nota || (Math.round(dias) + ' días'), cobradorId);
            this._actualizarSaldo(userId, mes, montoReal, recibo.idPago);
            resultados.push(recibo);

        } else if (tipo === 'parcial') {
            const mes = mesesTarget || this._formatMes(ahora);
            const montoReal = this._redondear(monto);
            const recibo = this._crearRecibo(userId, montoReal, tipo, mes, [mes], nota, cobradorId);
            this._actualizarSaldo(userId, mes, montoReal, recibo.idPago);
            resultados.push(recibo);

        } else if (tipo === 'multi_mes') {
            const meses = Array.isArray(mesesTarget) ? mesesTarget : this._generarMeses(ahora, Math.round(monto / cfg.cuotaMensual));
            meses.forEach(mes => {
                const recibo = this._crearRecibo(userId, cfg.cuotaMensual, tipo, mes, meses, nota, cobradorId);
                this._actualizarSaldo(userId, mes, cfg.cuotaMensual, recibo.idPago);
                resultados.push(recibo);
            });

        } else if (tipo === 'adelanto') {
            const meses = Array.isArray(mesesTarget) ? mesesTarget : this._generarMesesFuturos(ahora, Math.round(monto / cfg.cuotaMensual));
            meses.forEach(mes => {
                const recibo = this._crearRecibo(userId, cfg.cuotaMensual, tipo, mes, meses, nota, cobradorId);
                this._actualizarSaldo(userId, mes, cfg.cuotaMensual, recibo.idPago);
                resultados.push(recibo);
            });

        } else if (tipo === 'puesta_al_dia') {
            const mesesPendientes = this._getMesesPendientes(userId);
            mesesPendientes.forEach(mes => {
                const saldo = this.getSaldo(userId, mes);
                const montoPagar = saldo ? saldo.saldo : cfg.cuotaMensual;
                if (montoPagar > 0) {
                    const recibo = this._crearRecibo(userId, montoPagar, tipo, mes, mesesPendientes, nota, cobradorId);
                    this._actualizarSaldo(userId, mes, montoPagar, recibo.idPago);
                    resultados.push(recibo);
                }
            });
        }

        this._sincronizarUsuario(userId);
        return resultados;
    },

    _crearRecibo(userId, monto, tipo, mesTarget, mesesCubiertos, nota, cobradorId) {
        const recibo = {
            idPago: Date.now() + Math.floor(Math.random() * 1000),
            usuarioId: userId,
            monto: this._redondear(monto),
            fecha: new Date().toISOString(),
            tipo: tipo,
            mesTarget: mesTarget,
            mesesCubiertos: mesesCubiertos,
            nota: nota || '',
            cobradorId: cobradorId
        };

        const pagos = JSON.parse(localStorage.getItem('jaar_pagos') || '[]');
        pagos.push(recibo);
        localStorage.setItem('jaar_pagos', JSON.stringify(pagos));

        const pending = JSON.parse(localStorage.getItem('jaar_pending_payments') || '[]');
        pending.push(recibo);
        localStorage.setItem('jaar_pending_payments', JSON.stringify(pending));

        return recibo;
    },

    // ── Cálculo de Estado ──

    calcularEstado(userId) {
        const mesActual = this._formatMes(new Date());
        const saldoActual = this.getSaldo(userId, mesActual);

        if (saldoActual && saldoActual.estado === 'pagado') {
            const deudaAnterior = this._contarMesesSinPagar(userId);
            return deudaAnterior > 0 ? 'moroso' : 'activo';
        }
        if (saldoActual && saldoActual.estado === 'parcial') return 'parcial';

        const mesesDeuda = this._contarMesesSinPagar(userId);
        const cfg = this.getConfig();
        if (mesesDeuda >= cfg.mesesGraciaCorte) return 'corte';
        if (mesesDeuda >= 1) return 'moroso';
        return 'activo';
    },

    _contarMesesSinPagar(userId) {
        let count = 0;
        const cursor = new Date();
        for (let i = 0; i < 36; i++) {
            const mes = this._formatMes(cursor);
            const saldo = this.getSaldo(userId, mes);
            if (saldo && saldo.estado === 'pagado') break;
            if (!saldo || saldo.estado === 'pendiente' || saldo.estado === 'parcial') {
                count++;
            }
            cursor.setMonth(cursor.getMonth() - 1);
        }
        return count;
    },

    getMesesDeuda(userId) {
        return this._contarMesesSinPagar(userId);
    },

    getDeudaTotal(userId) {
        const cfg = this.getConfig();
        let total = 0;
        const cursor = new Date();
        for (let i = 0; i < 36; i++) {
            const mes = this._formatMes(cursor);
            const saldo = this.getSaldo(userId, mes);
            if (saldo && saldo.estado === 'pagado') break;
            if (saldo && saldo.estado === 'parcial') {
                total += saldo.saldo;
            } else {
                total += cfg.cuotaMensual;
            }
            cursor.setMonth(cursor.getMonth() - 1);
        }
        return this._redondear(total);
    },

    getMesesAdelantados(userId) {
        let count = 0;
        const cursor = new Date();
        cursor.setMonth(cursor.getMonth() + 1);
        for (let i = 0; i < 24; i++) {
            const mes = this._formatMes(cursor);
            const saldo = this.getSaldo(userId, mes);
            if (saldo && saldo.estado === 'pagado') {
                count++;
            } else {
                break;
            }
            cursor.setMonth(cursor.getMonth() + 1);
        }
        return count;
    },

    getResumenUsuario(userId) {
        const estado = this.calcularEstado(userId);
        const deuda = this.getDeudaTotal(userId);
        const mesesDeuda = this.getMesesDeuda(userId);
        const adelantados = this.getMesesAdelantados(userId);
        const pagos = JSON.parse(localStorage.getItem('jaar_pagos') || '[]')
            .filter(p => p.usuarioId === userId || p.usuarioId === String(userId));
        const ultimoPago = pagos.length > 0 ? pagos[pagos.length - 1].fecha : null;

        return { estado, deuda, mesesDeuda, adelantados, ultimoPago, totalPagos: pagos.length };
    },

    // ── Meses Pendientes ──

    _getMesesPendientes(userId) {
        const pendientes = [];
        const cursor = new Date();
        for (let i = 0; i < 36; i++) {
            const mes = this._formatMes(cursor);
            const saldo = this.getSaldo(userId, mes);
            if (saldo && saldo.estado === 'pagado') break;
            pendientes.unshift(mes);
            cursor.setMonth(cursor.getMonth() - 1);
        }
        return pendientes;
    },

    // ── Sincronización con jaar_users ──

    _sincronizarUsuario(userId) {
        const users = JSON.parse(localStorage.getItem('jaar_users') || '[]');
        const idx = users.findIndex(u => u.id === userId || u.id === String(userId));
        if (idx > -1) {
            const estado = this.calcularEstado(userId);
            users[idx].pagadoEsteMes = (estado === 'activo');
            users[idx].mesesSinPagar = this.getMesesDeuda(userId);
            localStorage.setItem('jaar_users', JSON.stringify(users));
        }

        const miembros = JSON.parse(localStorage.getItem('jaar_miembros') || '[]');
        const mIdx = miembros.findIndex(m => m.id === userId || m.id === String(userId));
        if (mIdx > -1) {
            const estado = this.calcularEstado(userId);
            miembros[mIdx].pagadoEsteMes = (estado === 'activo');
            localStorage.setItem('jaar_miembros', JSON.stringify(miembros));
        }
    },

    // ── Verificación de mes actual ──

    _verificarMesActual() {
        const mesActual = this._formatMes(new Date());
        const users = JSON.parse(localStorage.getItem('jaar_users') || '[]');
        users.forEach(u => {
            this._crearSaldo(u.id, mesActual);
        });
    },

    // ── Migración ──

    migrarDatosAntiguos() {
        const pagos = JSON.parse(localStorage.getItem('jaar_pagos') || '[]');
        const saldos = this.getSaldos();
        const cfg = this.getConfig();

        pagos.forEach(p => {
            if (!p.tipo) p.tipo = 'mensual';
            if (!p.mesTarget) {
                const fecha = new Date(p.fecha);
                if (!isNaN(fecha)) {
                    p.mesTarget = this._formatMes(fecha);
                } else {
                    const parts = (p.fecha || '').split('/');
                    if (parts.length === 3) {
                        p.mesTarget = parts[2] + '-' + parts[1].padStart(2, '0');
                    }
                }
            }
            if (!p.mesesCubiertos && p.mesTarget) p.mesesCubiertos = [p.mesTarget];
            if (!p.cobradorId) p.cobradorId = 'cobrador';
            if (!p.nota) p.nota = '';

            if (p.mesTarget && p.usuarioId) {
                const key = p.usuarioId + '_' + p.mesTarget;
                if (!saldos[key]) {
                    saldos[key] = {
                        usuarioId: p.usuarioId,
                        mes: p.mesTarget,
                        cuotaTotal: cfg.cuotaMensual,
                        pagado: 0,
                        saldo: cfg.cuotaMensual,
                        estado: 'pendiente',
                        pagosIds: []
                    };
                }
                saldos[key].pagado = this._redondear(saldos[key].pagado + (p.monto || cfg.cuotaMensual));
                saldos[key].saldo = this._redondear(saldos[key].cuotaTotal - saldos[key].pagado);
                if (saldos[key].saldo <= 0) {
                    saldos[key].saldo = 0;
                    saldos[key].estado = 'pagado';
                } else {
                    saldos[key].estado = 'parcial';
                }
                saldos[key].pagosIds.push(p.idPago);
            }
        });

        localStorage.setItem('jaar_pagos', JSON.stringify(pagos));
        this.saveSaldos(saldos);
        localStorage.setItem(this.MIGRATION_KEY, 'true');
    },

    recalcularSaldos() {
        localStorage.removeItem('jaar_saldos');
        localStorage.setItem('jaar_saldos', JSON.stringify({}));
        localStorage.removeItem(this.MIGRATION_KEY);
        this.migrarDatosAntiguos();
    },

    // ── Helpers ──

    _formatMes(date) {
        return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
    },

    _parseMes(mesStr) {
        const [y, m] = mesStr.split('-').map(Number);
        return new Date(y, m - 1, 1);
    },

    _generarMeses(desde, cantidad) {
        const meses = [];
        const cursor = new Date(desde);
        for (let i = 0; i < cantidad; i++) {
            meses.push(this._formatMes(cursor));
            cursor.setMonth(cursor.getMonth() + 1);
        }
        return meses;
    },

    _generarMesesFuturos(desde, cantidad) {
        const cursor = new Date(desde);
        cursor.setMonth(cursor.getMonth() + 1);
        return this._generarMeses(cursor, cantidad);
    },

    _redondear(val) {
        return Math.round(val * 100) / 100;
    },

    mesLabel(mesStr) {
        const nombres = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
        const [y, m] = mesStr.split('-').map(Number);
        return nombres[m - 1] + ' ' + y;
    }
};

document.addEventListener('DOMContentLoaded', () => PagosEngine.init());
