/**
 * js/puntos.js — Motor de Puntos y Recompensas para JAAR Digital
 * Soporta: otorgamiento por pagos/jornales, canje por descuento,
 *          bonificaciones trimestrales/anuales, leaderboard
 */

const Puntos = {

    // ── Descripciones de tipos de puntos ──

    DESCRIPCIONES: {
        pago_basico:         'Pago registrado',
        pago_puntual:        'Pago puntual (antes del dia 15)',
        pago_consolidado:    'Pago consolidado de X meses',
        jornal_personal:     'Asistencia personal a jornal',
        jornal_sustituto:    'Asistencia via sustituto a jornal',
        jornal_confirmacion: 'Confirmacion anticipada de jornal',
        trimestre_limpio:    'Trimestre sin multas',
        anio_completo:       'Anio completo pagado a tiempo'
    },

    // ── Inicialización ──

    init() {
        if (!localStorage.getItem('jaar_config_puntos')) {
            localStorage.setItem('jaar_config_puntos', JSON.stringify({
                reglas: {
                    pago_basico:         { puntos: 2,  activo: true },
                    pago_puntual:        { puntos: 5,  activo: true, diaLimite: 15 },
                    pago_consolidado:    { puntos: 10, activo: true },
                    jornal_personal:     { puntos: 8,  activo: true },
                    jornal_sustituto:    { puntos: 3,  activo: true },
                    jornal_confirmacion: { puntos: 2,  activo: true },
                    trimestre_limpio:    { puntos: 15, activo: true },
                    anio_completo:       { puntos: 30, activo: true }
                },
                tasaCanje: 0.10,
                minimoCanjeablePuntos: 10,
                maximoDescuentoPorMes: 1.50
            }));
        }
        if (!localStorage.getItem('jaar_puntos')) {
            localStorage.setItem('jaar_puntos', JSON.stringify([]));
        }
        if (!localStorage.getItem('jaar_canjes')) {
            localStorage.setItem('jaar_canjes', JSON.stringify([]));
        }
        if (!localStorage.getItem('jaar_saldos_puntos')) {
            localStorage.setItem('jaar_saldos_puntos', JSON.stringify({}));
        }
    },

    // ── Configuración ──

    getConfigReglas() {
        return JSON.parse(localStorage.getItem('jaar_config_puntos') || '{}');
    },

    saveConfigReglas(cfg) {
        localStorage.setItem('jaar_config_puntos', JSON.stringify(cfg));
    },

    // ── Datos ──

    _getPuntos() {
        return JSON.parse(localStorage.getItem('jaar_puntos') || '[]');
    },

    _savePuntos(data) {
        localStorage.setItem('jaar_puntos', JSON.stringify(data));
    },

    _getCanjes() {
        return JSON.parse(localStorage.getItem('jaar_canjes') || '[]');
    },

    _saveCanjes(data) {
        localStorage.setItem('jaar_canjes', JSON.stringify(data));
    },

    _getSaldos() {
        return JSON.parse(localStorage.getItem('jaar_saldos_puntos') || '{}');
    },

    _saveSaldos(data) {
        localStorage.setItem('jaar_saldos_puntos', JSON.stringify(data));
    },

    // ── Otorgar Puntos ──

    otorgarPuntos(miembroId, tipo, refId) {
        const cfg = this.getConfigReglas();
        const regla = cfg.reglas ? cfg.reglas[tipo] : null;

        if (!regla || !regla.activo) {
            return { ok: false, error: 'Regla no encontrada o inactiva: ' + tipo };
        }

        // Prevenir duplicados: misma combinación tipo + refId
        const registros = this._getPuntos();
        const duplicado = registros.find(
            r => r.tipo === tipo && r.refId === refId
        );
        if (duplicado) {
            return { ok: false, error: 'Puntos ya otorgados para este tipo y referencia', existente: duplicado };
        }

        // Construir descripción
        let descripcion = this.DESCRIPCIONES[tipo] || tipo;
        if (tipo === 'pago_consolidado' && refId) {
            // Intentar obtener cantidad de meses del pago referenciado
            const pagos = JSON.parse(localStorage.getItem('jaar_pagos') || '[]');
            const pagoRef = pagos.find(p => p.idPago === refId || p.idPago === String(refId));
            if (pagoRef && pagoRef.mesesCubiertos) {
                descripcion = descripcion.replace('X', pagoRef.mesesCubiertos.length);
            }
        }

        // Crear registro
        const registro = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            miembroId: String(miembroId),
            tipo: tipo,
            puntos: regla.puntos,
            descripcion: descripcion,
            fecha: new Date().toISOString(),
            refId: refId || null
        };

        // Asignar campo semántico según tipo
        if (tipo.startsWith('pago_') || tipo === 'trimestre_limpio' || tipo === 'anio_completo') {
            registro.pagoId = refId || null;
        }
        if (tipo.startsWith('jornal_')) {
            registro.jornalId = refId || null;
        }

        registros.push(registro);
        this._savePuntos(registros);

        // Actualizar saldo
        this._actualizarSaldo(String(miembroId), regla.puntos);

        return { ok: true, registro: registro };
    },

    // ── Saldos ──

    _actualizarSaldo(miembroId, puntosGanados) {
        const saldos = this._getSaldos();
        if (!saldos[miembroId]) {
            saldos[miembroId] = { saldo: 0, totalGanados: 0, totalCanjeados: 0 };
        }
        saldos[miembroId].saldo += puntosGanados;
        saldos[miembroId].totalGanados += puntosGanados;
        this._saveSaldos(saldos);
    },

    getSaldo(miembroId) {
        const saldos = this._getSaldos();
        const id = String(miembroId);
        if (!saldos[id]) {
            return { saldo: 0, totalGanados: 0, totalCanjeados: 0 };
        }
        return saldos[id];
    },

    // ── Historial ──

    getHistorial(miembroId) {
        const id = String(miembroId);
        const puntos = this._getPuntos().filter(r => r.miembroId === id);
        const canjes = this._getCanjes().filter(c => c.miembroId === id);

        // Combinar ambos en un historial unificado, ordenado por fecha
        const historial = [];

        puntos.forEach(p => {
            historial.push({
                tipo: 'ganancia',
                puntos: p.puntos,
                descripcion: p.descripcion,
                fecha: p.fecha,
                id: p.id
            });
        });

        canjes.forEach(c => {
            historial.push({
                tipo: 'canje',
                puntos: -c.puntosUsados,
                descripcion: 'Canje por descuento de B/. ' + this._redondear(c.descuentoAplicado).toFixed(2),
                fecha: c.fecha,
                id: c.id
            });
        });

        historial.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        return historial;
    },

    // ── Canje de Puntos ──

    canjear(miembroId, puntos, pagoId) {
        const id = String(miembroId);
        const cfg = this.getConfigReglas();
        const saldoActual = this.getSaldo(id);

        // Validar saldo suficiente
        if (saldoActual.saldo < puntos) {
            return { ok: false, error: 'Saldo insuficiente. Disponible: ' + saldoActual.saldo + ', solicitado: ' + puntos };
        }

        // Validar mínimo canjeable
        if (puntos < cfg.minimoCanjeablePuntos) {
            return { ok: false, error: 'Minimo canjeable: ' + cfg.minimoCanjeablePuntos + ' puntos' };
        }

        // Calcular descuento
        let descuento = this._redondear(puntos * cfg.tasaCanje);

        // Aplicar tope mensual
        const descuentoUsadoMes = this._descuentoUsadoEsteMes(id);
        const disponibleMes = this._redondear(cfg.maximoDescuentoPorMes - descuentoUsadoMes);

        if (disponibleMes <= 0) {
            return { ok: false, error: 'Limite de descuento mensual alcanzado (B/. ' + cfg.maximoDescuentoPorMes.toFixed(2) + ')' };
        }

        if (descuento > disponibleMes) {
            descuento = disponibleMes;
            // Ajustar puntos usados al descuento real
            puntos = Math.ceil(descuento / cfg.tasaCanje);
        }

        const aprobadoPor = localStorage.getItem('jaar_username') || 'sistema';

        // Crear registro de canje
        const canje = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            miembroId: id,
            puntosUsados: puntos,
            descuentoAplicado: descuento,
            pagoId: pagoId || null,
            fecha: new Date().toISOString(),
            aprobadoPor: aprobadoPor
        };

        const canjes = this._getCanjes();
        canjes.push(canje);
        this._saveCanjes(canjes);

        // Actualizar saldo
        const saldos = this._getSaldos();
        if (!saldos[id]) {
            saldos[id] = { saldo: 0, totalGanados: 0, totalCanjeados: 0 };
        }
        saldos[id].saldo -= puntos;
        saldos[id].totalCanjeados += puntos;
        this._saveSaldos(saldos);

        return { ok: true, descuento: descuento, canje: canje };
    },

    // ── Descuento Disponible ──

    getDescuentoDisponible(miembroId) {
        const id = String(miembroId);
        const cfg = this.getConfigReglas();
        const saldoActual = this.getSaldo(id);

        // Descuento máximo según puntos
        const descuentoPorPuntos = this._redondear(saldoActual.saldo * cfg.tasaCanje);

        // Descuento restante en el mes
        const descuentoUsadoMes = this._descuentoUsadoEsteMes(id);
        const disponibleMes = this._redondear(cfg.maximoDescuentoPorMes - descuentoUsadoMes);

        // El menor entre lo que tiene y lo que le queda en el mes
        const disponible = Math.min(descuentoPorPuntos, disponibleMes);

        return this._redondear(Math.max(0, disponible));
    },

    _descuentoUsadoEsteMes(miembroId) {
        const ahora = new Date();
        const mesActual = ahora.getFullYear() + '-' + String(ahora.getMonth() + 1).padStart(2, '0');
        const canjes = this._getCanjes().filter(c => {
            if (c.miembroId !== miembroId) return false;
            const fechaCanje = c.fecha.substring(0, 7); // YYYY-MM
            return fechaCanje === mesActual;
        });
        let total = 0;
        canjes.forEach(c => { total += c.descuentoAplicado; });
        return this._redondear(total);
    },

    // ── Recalcular Saldo ──

    recalcularSaldo(miembroId) {
        const id = String(miembroId);
        const registros = this._getPuntos().filter(r => r.miembroId === id);
        const canjes = this._getCanjes().filter(c => c.miembroId === id);

        let totalGanados = 0;
        registros.forEach(r => { totalGanados += r.puntos; });

        let totalCanjeados = 0;
        canjes.forEach(c => { totalCanjeados += c.puntosUsados; });

        const saldos = this._getSaldos();
        saldos[id] = {
            saldo: totalGanados - totalCanjeados,
            totalGanados: totalGanados,
            totalCanjeados: totalCanjeados
        };
        this._saveSaldos(saldos);

        return saldos[id];
    },

    // ── Verificar Bonos Trimestrales y Anuales ──

    verificarBonos() {
        const miembros = JSON.parse(localStorage.getItem('jaar_miembros') || '[]');
        const pagos = JSON.parse(localStorage.getItem('jaar_pagos') || '[]');
        const jornales = JSON.parse(localStorage.getItem('jaar_jornales') || '[]');
        const cfg = this.getConfigReglas();
        const resultados = [];

        const ahora = new Date();
        const mesActual = ahora.getMonth();   // 0-11
        const anioActual = ahora.getFullYear();

        miembros.forEach(m => {
            const mid = String(m.id);

            // ── Trimestre Limpio ──
            if (cfg.reglas && cfg.reglas.trimestre_limpio && cfg.reglas.trimestre_limpio.activo) {
                // Determinar trimestre actual (Q1: ene-mar, Q2: abr-jun, Q3: jul-sep, Q4: oct-dic)
                const trimestre = Math.floor(mesActual / 3);
                const mesInicio = trimestre * 3;  // 0, 3, 6, 9
                const refTrimestre = anioActual + '-T' + (trimestre + 1);

                // Verificar si ya fue otorgado
                const yaOtorgado = this._getPuntos().find(
                    r => r.miembroId === mid && r.tipo === 'trimestre_limpio' && r.refId === refTrimestre
                );

                if (!yaOtorgado) {
                    // Verificar que los 3 meses del trimestre estan pagados y sin multas
                    let trimestreLimpio = true;
                    for (let i = 0; i < 3; i++) {
                        const mesNum = mesInicio + i;
                        // Solo verificar meses ya transcurridos
                        if (mesNum > mesActual) {
                            trimestreLimpio = false;
                            break;
                        }
                        const mesKey = anioActual + '-' + String(mesNum + 1).padStart(2, '0');

                        // Verificar pago del mes
                        const pagosMes = pagos.filter(
                            p => (p.usuarioId === mid || p.usuarioId === m.id) && p.mesTarget === mesKey
                        );
                        if (pagosMes.length === 0) {
                            trimestreLimpio = false;
                            break;
                        }

                        // Verificar sin multas en jornales del mes
                        const jornalesMes = jornales.filter(j => {
                            if (String(j.miembroId) !== mid) return false;
                            // Parsear fecha del jornal
                            const fechaJ = j.fecha || '';
                            if (fechaJ.includes('/')) {
                                // formato dd/mm/yyyy
                                const parts = fechaJ.split('/');
                                if (parts.length === 3) {
                                    const mJ = parseInt(parts[1], 10);
                                    const yJ = parseInt(parts[2], 10);
                                    return mJ === (mesNum + 1) && yJ === anioActual;
                                }
                            } else if (fechaJ.includes('-')) {
                                // formato ISO
                                const d = new Date(fechaJ);
                                return d.getMonth() === mesNum && d.getFullYear() === anioActual;
                            }
                            return false;
                        });

                        const tieneMulta = jornalesMes.some(j => j.asiste === 'no' && parseFloat(j.multa) > 0);
                        if (tieneMulta) {
                            trimestreLimpio = false;
                            break;
                        }
                    }

                    if (trimestreLimpio) {
                        const res = this.otorgarPuntos(mid, 'trimestre_limpio', refTrimestre);
                        if (res.ok) resultados.push(res.registro);
                    }
                }
            }

            // ── Anio Completo ──
            if (cfg.reglas && cfg.reglas.anio_completo && cfg.reglas.anio_completo.activo) {
                // Verificar el anio anterior completo (los 12 meses pagados a tiempo)
                const anioVerificar = anioActual - 1;
                const refAnio = String(anioVerificar) + '-COMPLETO';

                const yaOtorgadoAnio = this._getPuntos().find(
                    r => r.miembroId === mid && r.tipo === 'anio_completo' && r.refId === refAnio
                );

                if (!yaOtorgadoAnio) {
                    let anioLimpio = true;
                    for (let mes = 1; mes <= 12; mes++) {
                        const mesKey = anioVerificar + '-' + String(mes).padStart(2, '0');
                        const pagosMes = pagos.filter(
                            p => (p.usuarioId === mid || p.usuarioId === m.id) && p.mesTarget === mesKey
                        );
                        if (pagosMes.length === 0) {
                            anioLimpio = false;
                            break;
                        }
                    }

                    if (anioLimpio) {
                        const res = this.otorgarPuntos(mid, 'anio_completo', refAnio);
                        if (res.ok) resultados.push(res.registro);
                    }
                }
            }
        });

        return resultados;
    },

    // ── Leaderboard ──

    getLeaderboard() {
        const saldos = this._getSaldos();
        const miembros = JSON.parse(localStorage.getItem('jaar_miembros') || '[]');

        const lista = [];
        miembros.forEach(m => {
            const id = String(m.id);
            const info = saldos[id] || { saldo: 0, totalGanados: 0, totalCanjeados: 0 };
            lista.push({
                miembroId: id,
                nombre: m.nombre || 'Miembro ' + id,
                saldo: info.saldo,
                totalGanados: info.totalGanados,
                totalCanjeados: info.totalCanjeados
            });
        });

        // Ordenar por saldo descendente
        lista.sort((a, b) => b.saldo - a.saldo);
        return lista;
    },

    // ── Helpers ──

    _redondear(val) {
        return Math.round(val * 100) / 100;
    },

    _formatMes(date) {
        return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
    }
};

document.addEventListener('DOMContentLoaded', () => Puntos.init());
