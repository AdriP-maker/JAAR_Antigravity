/**
 * js/comisiones.js — Motor de Comisiones para JAAR Digital
 * Reparto de ingresos: cobrador (40%) y desarrolladores (60%).
 * Persistencia: localStorage (jaar_config_comisiones, jaar_comisiones, jaar_cobrador_balance)
 */

const Comisiones = {

    // ── Inicializar configuracion ──

    init() {
        if (!localStorage.getItem('jaar_config_comisiones')) {
            localStorage.setItem('jaar_config_comisiones', JSON.stringify({
                comisionPorPago: 1.00,
                splitDevs: 0.60,
                splitCobrador: 0.40,
                apartados: [
                    { nombre: "Cuota de Agua", monto: 1.00 },
                    { nombre: "Tanque Septico", monto: 1.00 },
                    { nombre: "Porqueriza / Anadidos", monto: 1.00 }
                ]
            }));
        }
        if (!localStorage.getItem('jaar_comisiones')) {
            localStorage.setItem('jaar_comisiones', JSON.stringify([]));
        }
        if (!localStorage.getItem('jaar_cobrador_balance')) {
            localStorage.setItem('jaar_cobrador_balance', JSON.stringify({}));
        }
    },

    // ── Configuracion ──

    getConfig() {
        return JSON.parse(localStorage.getItem('jaar_config_comisiones') || '{}');
    },

    saveConfig(cfg) {
        localStorage.setItem('jaar_config_comisiones', JSON.stringify(cfg));
    },

    // ── Registros de comisiones ──

    _getComisiones() {
        return JSON.parse(localStorage.getItem('jaar_comisiones') || '[]');
    },

    _saveComisiones(arr) {
        localStorage.setItem('jaar_comisiones', JSON.stringify(arr));
    },

    // ── Balance del cobrador ──

    _getBalance() {
        return JSON.parse(localStorage.getItem('jaar_cobrador_balance') || '{}');
    },

    _saveBalance(bal) {
        localStorage.setItem('jaar_cobrador_balance', JSON.stringify(bal));
    },

    // ── Helpers monetarios ──

    _redondear(val) {
        return Math.round(val * 100) / 100;
    },

    _formatMes(date) {
        return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
    },

    // ── Registro de comision por pago ──

    /**
     * Registra una comision a partir de un pago realizado.
     * @param {Object} pagoData  - { idPago, usuarioId, monto, fecha, mesTarget, ... }
     * @param {string} cobradorUser - nombre de usuario del cobrador que realizo el cobro
     * @returns {Object} registro de comision creado
     */
    registrarComision(pagoData, cobradorUser) {
        const cfg = this.getConfig();
        const cuotaMensual = this._getCuotaMensual();

        // Comision proporcional al monto pagado vs cuota mensual
        var comisionTotal = this._redondear((pagoData.monto / cuotaMensual) * cfg.comisionPorPago);

        var parteDevs = this._redondear(comisionTotal * cfg.splitDevs);
        var parteCobrador = this._redondear(comisionTotal * cfg.splitCobrador);

        // Ajustar redondeo: asegurar que partes sumen exactamente la comision total
        var diffRedondeo = this._redondear(comisionTotal - parteDevs - parteCobrador);
        if (diffRedondeo !== 0) {
            parteCobrador = this._redondear(parteCobrador + diffRedondeo);
        }

        var fechaPago = pagoData.fecha ? new Date(pagoData.fecha) : new Date();
        var mesPago = pagoData.mesTarget || this._formatMes(fechaPago);
        var partesMes = mesPago.split('-');
        var anioPago = partesMes[0] || String(fechaPago.getFullYear());

        var registro = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            pagoId: pagoData.idPago,
            usuarioId: pagoData.usuarioId,
            cobradorUser: cobradorUser,
            fecha: new Date().toISOString(),
            montoTotal: pagoData.monto,
            comisionTotal: comisionTotal,
            parteDevs: parteDevs,
            parteCobrador: parteCobrador,
            splitConfig: {
                splitDevs: cfg.splitDevs,
                splitCobrador: cfg.splitCobrador,
                comisionPorPago: cfg.comisionPorPago
            },
            liquidado: false,
            mesPago: mesPago,
            anioPago: anioPago
        };

        // Guardar registro de comision
        var comisiones = this._getComisiones();
        comisiones.push(registro);
        this._saveComisiones(comisiones);

        // Actualizar balance del cobrador
        this._actualizarBalance(cobradorUser, parteCobrador, mesPago);

        return registro;
    },

    /**
     * Obtiene la cuota mensual desde la config general de pagos.
     */
    _getCuotaMensual() {
        var configPagos = JSON.parse(localStorage.getItem('jaar_config') || '{}');
        return configPagos.cuotaMensual || 3.00;
    },

    /**
     * Actualiza el balance acumulado del cobrador.
     */
    _actualizarBalance(cobradorUser, montoCobrador, mesPago) {
        var balance = this._getBalance();

        if (!balance[cobradorUser]) {
            balance[cobradorUser] = {
                totalAcumulado: 0,
                desglosePorMes: {}
            };
        }

        var entry = balance[cobradorUser];
        entry.totalAcumulado = this._redondear(entry.totalAcumulado + montoCobrador);

        if (!entry.desglosePorMes[mesPago]) {
            entry.desglosePorMes[mesPago] = {
                cobros: 0,
                comision: 0
            };
        }

        entry.desglosePorMes[mesPago].cobros += 1;
        entry.desglosePorMes[mesPago].comision = this._redondear(
            entry.desglosePorMes[mesPago].comision + montoCobrador
        );

        this._saveBalance(balance);
    },

    // ── Resumen del cobrador ──

    /**
     * Retorna resumen de comisiones para un cobrador especifico.
     * @param {string} username - nombre de usuario del cobrador
     * @returns {Object} { totalAcumulado, totalLiquidado, pendiente, cobrosEsteMes, comisionEsteMes, desglosePorMes }
     */
    getResumenCobrador(username) {
        var comisiones = this._getComisiones().filter(function(c) {
            return c.cobradorUser === username;
        });

        var totalAcumulado = 0;
        var totalLiquidado = 0;
        var desglosePorMes = {};
        var mesActual = this._formatMes(new Date());

        for (var i = 0; i < comisiones.length; i++) {
            var c = comisiones[i];
            totalAcumulado = this._redondear(totalAcumulado + c.parteCobrador);

            if (c.liquidado) {
                totalLiquidado = this._redondear(totalLiquidado + c.parteCobrador);
            }

            var mes = c.mesPago || 'sin-mes';
            if (!desglosePorMes[mes]) {
                desglosePorMes[mes] = { cobros: 0, comision: 0 };
            }
            desglosePorMes[mes].cobros += 1;
            desglosePorMes[mes].comision = this._redondear(
                desglosePorMes[mes].comision + c.parteCobrador
            );
        }

        var cobrosEsteMes = desglosePorMes[mesActual] ? desglosePorMes[mesActual].cobros : 0;
        var comisionEsteMes = desglosePorMes[mesActual] ? desglosePorMes[mesActual].comision : 0;

        return {
            totalAcumulado: totalAcumulado,
            totalLiquidado: totalLiquidado,
            pendiente: this._redondear(totalAcumulado - totalLiquidado),
            cobrosEsteMes: cobrosEsteMes,
            comisionEsteMes: comisionEsteMes,
            desglosePorMes: desglosePorMes
        };
    },

    // ── Resumen de desarrolladores ──

    /**
     * Retorna resumen de la parte de los desarrolladores.
     * @returns {Object} { totalAcumulado, totalLiquidado, pendiente, desglosePorMes }
     */
    getResumenDevs() {
        var comisiones = this._getComisiones();
        var totalAcumulado = 0;
        var totalLiquidado = 0;
        var desglosePorMes = {};

        for (var i = 0; i < comisiones.length; i++) {
            var c = comisiones[i];
            totalAcumulado = this._redondear(totalAcumulado + c.parteDevs);

            if (c.liquidado) {
                totalLiquidado = this._redondear(totalLiquidado + c.parteDevs);
            }

            var mes = c.mesPago || 'sin-mes';
            if (!desglosePorMes[mes]) {
                desglosePorMes[mes] = { cobros: 0, comision: 0 };
            }
            desglosePorMes[mes].cobros += 1;
            desglosePorMes[mes].comision = this._redondear(
                desglosePorMes[mes].comision + c.parteDevs
            );
        }

        return {
            totalAcumulado: totalAcumulado,
            totalLiquidado: totalLiquidado,
            pendiente: this._redondear(totalAcumulado - totalLiquidado),
            desglosePorMes: desglosePorMes
        };
    },

    // ── Historial filtrado ──

    /**
     * Obtiene el historial de comisiones con filtros opcionales.
     * @param {Object} filtros - { cobradorUser, mesPago, anioPago, liquidado, usuarioId, desde, hasta }
     * @returns {Array} registros de comision filtrados
     */
    getHistorial(filtros) {
        filtros = filtros || {};
        var comisiones = this._getComisiones();

        if (filtros.cobradorUser) {
            comisiones = comisiones.filter(function(c) {
                return c.cobradorUser === filtros.cobradorUser;
            });
        }

        if (filtros.mesPago) {
            comisiones = comisiones.filter(function(c) {
                return c.mesPago === filtros.mesPago;
            });
        }

        if (filtros.anioPago) {
            comisiones = comisiones.filter(function(c) {
                return c.anioPago === filtros.anioPago;
            });
        }

        if (typeof filtros.liquidado === 'boolean') {
            comisiones = comisiones.filter(function(c) {
                return c.liquidado === filtros.liquidado;
            });
        }

        if (filtros.usuarioId) {
            comisiones = comisiones.filter(function(c) {
                return c.usuarioId === filtros.usuarioId || String(c.usuarioId) === String(filtros.usuarioId);
            });
        }

        if (filtros.desde) {
            var desde = new Date(filtros.desde).getTime();
            comisiones = comisiones.filter(function(c) {
                return new Date(c.fecha).getTime() >= desde;
            });
        }

        if (filtros.hasta) {
            var hasta = new Date(filtros.hasta).getTime();
            comisiones = comisiones.filter(function(c) {
                return new Date(c.fecha).getTime() <= hasta;
            });
        }

        return comisiones;
    },

    // ── Liquidacion ──

    /**
     * Marca comisiones como liquidadas por sus IDs.
     * @param {Array} ids - arreglo de IDs de comision a marcar como liquidados
     * @returns {number} cantidad de registros actualizados
     */
    marcarLiquidado(ids) {
        if (!Array.isArray(ids)) ids = [ids];

        var comisiones = this._getComisiones();
        var actualizados = 0;

        for (var i = 0; i < comisiones.length; i++) {
            if (ids.indexOf(comisiones[i].id) !== -1 && !comisiones[i].liquidado) {
                comisiones[i].liquidado = true;
                comisiones[i].fechaLiquidacion = new Date().toISOString();
                actualizados++;
            }
        }

        this._saveComisiones(comisiones);
        return actualizados;
    },

    // ── Resumen global para admin ──

    /**
     * Retorna totales globales para el panel de administracion.
     * @returns {Object} {
     *   totalComisiones, totalLiquidado, pendienteGlobal,
     *   totalParteDevs, totalParteCobrador,
     *   cantidadCobros, cobradores,
     *   desglosePorMes
     * }
     */
    getResumenGlobal() {
        var comisiones = this._getComisiones();
        var totalComisiones = 0;
        var totalLiquidado = 0;
        var totalParteDevs = 0;
        var totalParteCobrador = 0;
        var cobradoresSet = {};
        var desglosePorMes = {};

        for (var i = 0; i < comisiones.length; i++) {
            var c = comisiones[i];
            totalComisiones = this._redondear(totalComisiones + c.comisionTotal);
            totalParteDevs = this._redondear(totalParteDevs + c.parteDevs);
            totalParteCobrador = this._redondear(totalParteCobrador + c.parteCobrador);

            if (c.liquidado) {
                totalLiquidado = this._redondear(totalLiquidado + c.comisionTotal);
            }

            cobradoresSet[c.cobradorUser] = true;

            var mes = c.mesPago || 'sin-mes';
            if (!desglosePorMes[mes]) {
                desglosePorMes[mes] = {
                    cobros: 0,
                    comisionTotal: 0,
                    parteDevs: 0,
                    parteCobrador: 0
                };
            }
            desglosePorMes[mes].cobros += 1;
            desglosePorMes[mes].comisionTotal = this._redondear(
                desglosePorMes[mes].comisionTotal + c.comisionTotal
            );
            desglosePorMes[mes].parteDevs = this._redondear(
                desglosePorMes[mes].parteDevs + c.parteDevs
            );
            desglosePorMes[mes].parteCobrador = this._redondear(
                desglosePorMes[mes].parteCobrador + c.parteCobrador
            );
        }

        return {
            totalComisiones: totalComisiones,
            totalLiquidado: totalLiquidado,
            pendienteGlobal: this._redondear(totalComisiones - totalLiquidado),
            totalParteDevs: totalParteDevs,
            totalParteCobrador: totalParteCobrador,
            cantidadCobros: comisiones.length,
            cobradores: Object.keys(cobradoresSet),
            desglosePorMes: desglosePorMes
        };
    }
};

// Autoarranque
document.addEventListener('DOMContentLoaded', function() {
    Comisiones.init();
});
