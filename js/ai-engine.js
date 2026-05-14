/**
 * js/ai-engine.js — Motor de Analisis Inteligente para JAAR Digital
 * Sistema basado en reglas que analiza datos de localStorage para generar
 * insights y recomendaciones de cobranza. NO ajusta tarifas ni montos
 * automaticamente — el cobrador toma todas las decisiones.
 */

const AIEngine = {

    CONFIG: {
        RISK_WEIGHTS: {
            mesesSinPagar: 0.35,
            paymentRegularity: 0.25,
            jornalParticipation: 0.20,
            sectorRisk: 0.10,
            trend: 0.10
        },
        MONTHS_LOOKBACK: 12,
        ANOMALY_THRESHOLD: 2.0,
        CACHE_KEY: 'jaar_ai_cache',
        CACHE_TTL_MS: 3600000
    },

    // ──────────────────────────────────────
    // Punto de entrada principal
    // ──────────────────────────────────────

    /**
     * Ejecuta el analisis completo. Devuelve resultados cacheados si
     * el cache tiene menos de 1 hora de antiguedad.
     */
    analyze() {
        var cached = this._getCache();
        if (cached) return cached;

        var usuarios = JSON.parse(localStorage.getItem('jaar_users') || '[]');
        if (usuarios.length === 0) {
            usuarios = JSON.parse(localStorage.getItem('jaar_miembros') || '[]');
        }

        var riesgos = [];
        for (var i = 0; i < usuarios.length; i++) {
            riesgos.push(this.calcularRiesgo(usuarios[i].id));
        }

        var resultado = {
            timestamp: this._now(),
            totalUsuarios: usuarios.length,
            riesgos: riesgos,
            predicciones: this._generarPredicciones(usuarios),
            colaCobranza: this.generarColaCobranza(),
            metricas: this.calcularMetricas(),
            anomalias: this.detectarAnomalias()
        };

        this._setCache(resultado);
        return resultado;
    },

    /**
     * Invalida el cache forzando un nuevo analisis en la proxima llamada.
     */
    invalidateCache() {
        localStorage.removeItem(this.CONFIG.CACHE_KEY);
    },

    // ──────────────────────────────────────
    // Puntuacion de Riesgo (0-100)
    // ──────────────────────────────────────

    /**
     * Calcula el puntaje de riesgo compuesto para un usuario.
     * @param {number|string} userId
     * @returns {{ score: number, nivel: string, factors: Object }}
     */
    calcularRiesgo(userId) {
        var usuarios = JSON.parse(localStorage.getItem('jaar_users') || '[]');
        if (usuarios.length === 0) {
            usuarios = JSON.parse(localStorage.getItem('jaar_miembros') || '[]');
        }
        var user = null;
        for (var i = 0; i < usuarios.length; i++) {
            if (String(usuarios[i].id) === String(userId)) {
                user = usuarios[i];
                break;
            }
        }
        if (!user) {
            return { score: 0, nivel: 'bajo', factors: {}, userId: userId };
        }

        var weights = this.CONFIG.RISK_WEIGHTS;
        var factors = {
            mesesSinPagar: this._scoreByMesesSinPagar(user),
            paymentRegularity: this._scoreByPaymentRegularity(userId),
            jornalParticipation: this._scoreByJornalParticipation(userId),
            sectorRisk: this._scoreBySectorRisk(user.sector),
            trend: this._scoreByTrend(userId)
        };

        var score = Math.round(
            factors.mesesSinPagar * weights.mesesSinPagar +
            factors.paymentRegularity * weights.paymentRegularity +
            factors.jornalParticipation * weights.jornalParticipation +
            factors.sectorRisk * weights.sectorRisk +
            factors.trend * weights.trend
        );

        score = Math.max(0, Math.min(100, score));

        var nivel;
        if (score <= 25) nivel = 'bajo';
        else if (score <= 50) nivel = 'medio';
        else if (score <= 75) nivel = 'alto';
        else nivel = 'critico';

        return {
            userId: userId,
            nombre: user.nombre || '',
            sector: user.sector || '',
            score: score,
            nivel: nivel,
            factors: factors
        };
    },

    /**
     * Riesgo por meses sin pagar: min(100, mesesSinPagar * 25)
     */
    _scoreByMesesSinPagar(user) {
        var meses = user.mesesSinPagar || 0;
        return Math.min(100, meses * 25);
    },

    /**
     * Regularidad de pago en los ultimos 12 meses.
     * 100 = nunca pago, 0 = siempre al dia.
     */
    _scoreByPaymentRegularity(userId) {
        var historial = this._getUserPaymentHistory(userId, this.CONFIG.MONTHS_LOOKBACK);
        if (historial.length === 0) return 50;

        var mesesPagados = 0;
        for (var i = 0; i < historial.length; i++) {
            if (historial[i].estado === 'pagado') mesesPagados++;
        }

        var tasaPago = mesesPagados / historial.length;
        return Math.round((1 - tasaPago) * 100);
    },

    /**
     * Participacion en jornales comunitarios.
     * 100 = nunca participa, 0 = siempre asiste.
     */
    _scoreByJornalParticipation(userId) {
        var jornales = JSON.parse(localStorage.getItem('jaar_jornales') || '[]');
        var registros = [];
        for (var i = 0; i < jornales.length; i++) {
            if (String(jornales[i].miembroId) === String(userId)) {
                registros.push(jornales[i]);
            }
        }

        if (registros.length === 0) return 50;

        var asistencias = 0;
        for (var j = 0; j < registros.length; j++) {
            if (registros[j].asiste === 'si') asistencias++;
        }

        var tasaAsistencia = asistencias / registros.length;
        return Math.round((1 - tasaAsistencia) * 100);
    },

    /**
     * Riesgo promedio del sector basado en la tasa de morosidad.
     */
    _scoreBySectorRisk(sector) {
        if (!sector) return 50;

        var usuarios = JSON.parse(localStorage.getItem('jaar_users') || '[]');
        if (usuarios.length === 0) {
            usuarios = JSON.parse(localStorage.getItem('jaar_miembros') || '[]');
        }

        var enSector = [];
        for (var i = 0; i < usuarios.length; i++) {
            if (usuarios[i].sector === sector) {
                enSector.push(usuarios[i]);
            }
        }

        if (enSector.length === 0) return 50;

        var morosos = 0;
        for (var j = 0; j < enSector.length; j++) {
            var meses = enSector[j].mesesSinPagar || 0;
            if (!enSector[j].pagadoEsteMes || meses > 0) morosos++;
        }

        return Math.round((morosos / enSector.length) * 100);
    },

    /**
     * Tendencia de pago: mejorando=20, estable=50, empeorando=80.
     * Compara la primera mitad vs la segunda mitad del historial.
     */
    _scoreByTrend(userId) {
        var historial = this._getUserPaymentHistory(userId, this.CONFIG.MONTHS_LOOKBACK);
        if (historial.length < 4) return 50;

        var mitad = Math.floor(historial.length / 2);

        var pagadosPrimera = 0;
        for (var i = 0; i < mitad; i++) {
            if (historial[i].estado === 'pagado') pagadosPrimera++;
        }

        var pagadosSegunda = 0;
        for (var j = mitad; j < historial.length; j++) {
            if (historial[j].estado === 'pagado') pagadosSegunda++;
        }

        var tasaPrimera = pagadosPrimera / mitad;
        var tasaSegunda = pagadosSegunda / (historial.length - mitad);

        var diff = tasaSegunda - tasaPrimera;

        if (diff > 0.15) return 20;   // Mejorando
        if (diff < -0.15) return 80;  // Empeorando
        return 50;                     // Estable
    },

    // ──────────────────────────────────────
    // Prediccion de Morosidad
    // ──────────────────────────────────────

    /**
     * Predice la probabilidad de que un usuario caiga en morosidad.
     * @param {number|string} userId
     * @returns {{ probabilidad: number, factores: string[] }}
     */
    predecirMorosidad(userId) {
        var riesgo = this.calcularRiesgo(userId);
        var historial = this._getUserPaymentHistory(userId, 12);

        // Tasa base: proporcion de meses no pagados en el ultimo año (0–1)
        var mesesNoPagados = historial.filter(function(h) { return h.estado !== 'pagado'; }).length;
        var tasaBase = mesesNoPagados / 12;

        // Factor estacional: mayo-julio son meses de mayor morosidad en comunidades rurales de Panama
        var mesActual = new Date().getMonth() + 1; // 1–12
        var factorEstacional = [5, 6, 7].includes(mesActual) ? 1.20 : [1, 2].includes(mesActual) ? 1.10 : 0.90;

        // Factor tendencia: basado en el score de tendencia calculado por calcularRiesgo()
        var factorTendencia = riesgo.factors.trend >= 70 ? 1.30 : riesgo.factors.trend >= 40 ? 1.00 : 0.70;

        // Factor sector: mayor riesgo del sector → mayor probabilidad de morosidad (rango 1.0–1.5)
        var factorSector = 1.0 + (riesgo.factors.sectorRisk / 200);

        // Factor jornales: menor participacion → mayor riesgo de morosidad (rango 1.0–1.33)
        var factorJornales = 1.0 + (riesgo.factors.jornalParticipation / 300);

        // Probabilidad compuesta: tasa_base × factor_estacional × factor_tendencia × factor_sector × factor_jornales
        var probabilidad = tasaBase * factorEstacional * factorTendencia * factorSector * factorJornales;
        probabilidad = Math.min(1, Math.max(0, Math.round(probabilidad * 100) / 100));

        var factores = [];
        if (mesesNoPagados >= 4) factores.push('Acumula ' + mesesNoPagados + ' meses sin pagar en el año');
        if (factorEstacional > 1) factores.push('Período estacional de mayor morosidad');
        if (riesgo.factors.trend >= 70) factores.push('Tendencia de pago en deterioro');
        if (riesgo.factors.sectorRisk >= 60) factores.push('Sector con alta morosidad histórica');
        if (riesgo.factors.jornalParticipation >= 60) factores.push('Baja participación en jornales comunitarios');
        if (factores.length === 0) factores.push('Perfil de riesgo bajo — sin alertas activas');

        return {
            userId: userId,
            probabilidad: probabilidad,
            factores: factores,
            nivel: riesgo.nivel,
            recomendacion: this._getRecomendacion(riesgo.nivel),
            detalleFactores: {
                tasaBase: Math.round(tasaBase * 100) / 100,
                estacional: factorEstacional,
                tendencia: factorTendencia,
                sector: Math.round(factorSector * 100) / 100,
                jornales: Math.round(factorJornales * 100) / 100
            }
        };
    },

    /**
     * Genera predicciones para todos los usuarios.
     */
    _generarPredicciones(usuarios) {
        var predicciones = [];
        for (var i = 0; i < usuarios.length; i++) {
            predicciones.push(this.predecirMorosidad(usuarios[i].id));
        }
        return predicciones;
    },

    /**
     * Devuelve una recomendacion en espanol segun el nivel de riesgo.
     */
    _getRecomendacion(nivel) {
        switch (nivel) {
            case 'bajo':
                return 'Usuario al dia. Mantener seguimiento regular.';
            case 'medio':
                return 'Considerar recordatorio amigable de pago.';
            case 'alto':
                return 'Priorizar visita de cobranza. Ofrecer plan de pago.';
            case 'critico':
                return 'Atencion urgente. Evaluar acuerdo de puesta al dia o posible corte.';
            default:
                return 'Sin recomendacion disponible.';
        }
    },

    // ──────────────────────────────────────
    // Cola de Cobranza Priorizada
    // ──────────────────────────────────────

    /**
     * Genera una lista priorizada de cobranza agrupada por sector.
     * @returns {Array} Lista ordenada por prioridad (riesgo desc), agrupada por sector.
     */
    generarColaCobranza() {
        var usuarios = JSON.parse(localStorage.getItem('jaar_users') || '[]');
        if (usuarios.length === 0) {
            usuarios = JSON.parse(localStorage.getItem('jaar_miembros') || '[]');
        }

        var cola = [];
        for (var i = 0; i < usuarios.length; i++) {
            var user = usuarios[i];
            var riesgo = this.calcularRiesgo(user.id);

            // Solo incluir usuarios que no estan al dia
            if (riesgo.score > 25 || !user.pagadoEsteMes || (user.mesesSinPagar && user.mesesSinPagar > 0)) {
                var deudaTotal = 0;
                if (typeof PagosEngine !== 'undefined' && PagosEngine.getDeudaTotal) {
                    deudaTotal = PagosEngine.getDeudaTotal(user.id);
                } else {
                    var cfg = JSON.parse(localStorage.getItem('jaar_config') || '{}');
                    var cuota = cfg.cuotaMensual || 3.00;
                    deudaTotal = (user.mesesSinPagar || 0) * cuota;
                }

                cola.push({
                    userId: user.id,
                    nombre: user.nombre || '',
                    sector: user.sector || 'Sin sector',
                    riesgoScore: riesgo.score,
                    riesgoNivel: riesgo.nivel,
                    mesesSinPagar: user.mesesSinPagar || 0,
                    deudaEstimada: Math.round(deudaTotal * 100) / 100,
                    recomendacion: this._getRecomendacion(riesgo.nivel)
                });
            }
        }

        // Ordenar por riesgo descendente
        cola.sort(function (a, b) { return b.riesgoScore - a.riesgoScore; });

        // Agrupar por sector
        var sectores = {};
        for (var j = 0; j < cola.length; j++) {
            var sector = cola[j].sector;
            if (!sectores[sector]) sectores[sector] = [];
            sectores[sector].push(cola[j]);
        }

        return {
            total: cola.length,
            lista: cola,
            porSector: sectores
        };
    },

    // ──────────────────────────────────────
    // Metricas del Dashboard
    // ──────────────────────────────────────

    /**
     * Calcula metricas clave para el dashboard.
     * @returns {{ tasaRecaudoMes: number, velocidadPromedio: number, tendencia: string, porSector: Object }}
     */
    calcularMetricas() {
        var usuarios = JSON.parse(localStorage.getItem('jaar_users') || '[]');
        if (usuarios.length === 0) {
            usuarios = JSON.parse(localStorage.getItem('jaar_miembros') || '[]');
        }
        var pagos = JSON.parse(localStorage.getItem('jaar_pagos') || '[]');
        var mesActual = this._formatMes(new Date());

        // -- Tasa de recaudo del mes actual --
        var pagadosEsteMes = 0;
        for (var i = 0; i < usuarios.length; i++) {
            if (usuarios[i].pagadoEsteMes) pagadosEsteMes++;
        }
        var tasaRecaudoMes = usuarios.length > 0
            ? Math.round((pagadosEsteMes / usuarios.length) * 100)
            : 0;

        // -- Velocidad promedio de pago (dias desde inicio de mes hasta pago) --
        var pagosMes = [];
        for (var j = 0; j < pagos.length; j++) {
            if (pagos[j].mesTarget === mesActual && pagos[j].fecha) {
                pagosMes.push(pagos[j]);
            }
        }

        var velocidadPromedio = 0;
        if (pagosMes.length > 0) {
            var sumaDias = 0;
            for (var k = 0; k < pagosMes.length; k++) {
                var fechaPago = new Date(pagosMes[k].fecha);
                if (!isNaN(fechaPago.getTime())) {
                    sumaDias += fechaPago.getDate();
                }
            }
            velocidadPromedio = Math.round(sumaDias / pagosMes.length);
        }

        // -- Tendencia: comparar recaudo mes actual vs mes anterior --
        var ahora = new Date();
        var mesAnteriorDate = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
        var mesAnterior = this._formatMes(mesAnteriorDate);

        var pagadosMesAnterior = 0;
        var saldos = JSON.parse(localStorage.getItem('jaar_saldos') || '{}');
        for (var m = 0; m < usuarios.length; m++) {
            var key = usuarios[m].id + '_' + mesAnterior;
            if (saldos[key] && saldos[key].estado === 'pagado') {
                pagadosMesAnterior++;
            }
        }

        var tasaAnterior = usuarios.length > 0 ? pagadosMesAnterior / usuarios.length : 0;
        var tasaActual = usuarios.length > 0 ? pagadosEsteMes / usuarios.length : 0;
        var tendencia;
        if (tasaActual - tasaAnterior > 0.05) tendencia = 'mejorando';
        else if (tasaAnterior - tasaActual > 0.05) tendencia = 'empeorando';
        else tendencia = 'estable';

        // -- Metricas por sector --
        var porSector = {};
        for (var n = 0; n < usuarios.length; n++) {
            var sec = usuarios[n].sector || 'Sin sector';
            if (!porSector[sec]) {
                porSector[sec] = { total: 0, pagados: 0, morosos: 0, tasa: 0 };
            }
            porSector[sec].total++;
            if (usuarios[n].pagadoEsteMes) {
                porSector[sec].pagados++;
            } else {
                porSector[sec].morosos++;
            }
        }
        var sectoresKeys = Object.keys(porSector);
        for (var p = 0; p < sectoresKeys.length; p++) {
            var s = porSector[sectoresKeys[p]];
            s.tasa = s.total > 0 ? Math.round((s.pagados / s.total) * 100) : 0;
        }

        return {
            tasaRecaudoMes: tasaRecaudoMes,
            velocidadPromedio: velocidadPromedio,
            tendencia: tendencia,
            totalUsuarios: usuarios.length,
            pagadosEsteMes: pagadosEsteMes,
            morososEsteMes: usuarios.length - pagadosEsteMes,
            porSector: porSector,
            mesActual: mesActual
        };
    },

    // ──────────────────────────────────────
    // Deteccion de Anomalias (z-score)
    // ──────────────────────────────────────

    /**
     * Detecta anomalias en los datos financieros y de comportamiento.
     * @returns {Array<{ tipo: string, descripcion: string, severidad: string, datos: Object }>}
     */
    detectarAnomalias() {
        var anomalias = [];
        var umbral = this.CONFIG.ANOMALY_THRESHOLD;

        // -- 1. Recaudo bajo mensual --
        anomalias = anomalias.concat(this._detectarRecaudoBajo(umbral));

        // -- 2. Gasto alto --
        anomalias = anomalias.concat(this._detectarGastoAlto(umbral));

        // -- 3. Pago atipico (pago repentino tras larga morosidad) --
        anomalias = anomalias.concat(this._detectarPagoAtipico());

        // -- 4. Caida de sector --
        anomalias = anomalias.concat(this._detectarSectorCaida());

        return anomalias;
    },

    /**
     * Detecta meses con recaudo total significativamente bajo.
     */
    _detectarRecaudoBajo(umbral) {
        var anomalias = [];
        var pagos = JSON.parse(localStorage.getItem('jaar_pagos') || '[]');
        var recaudoPorMes = {};

        for (var i = 0; i < pagos.length; i++) {
            var mes = pagos[i].mesTarget;
            if (!mes) continue;
            if (!recaudoPorMes[mes]) recaudoPorMes[mes] = 0;
            recaudoPorMes[mes] += parseFloat(pagos[i].monto) || 0;
        }

        var meses = Object.keys(recaudoPorMes);
        if (meses.length < 3) return anomalias;

        var valores = [];
        for (var j = 0; j < meses.length; j++) {
            valores.push(recaudoPorMes[meses[j]]);
        }

        var mean = this._calcMean(valores);
        var stdDev = this._calcStdDev(valores);

        if (stdDev > 0) {
            for (var k = 0; k < meses.length; k++) {
                var z = this._zScore(recaudoPorMes[meses[k]], mean, stdDev);
                if (z < -umbral) {
                    anomalias.push({
                        tipo: 'recaudo_bajo',
                        descripcion: 'Recaudo del mes ' + meses[k] + ' significativamente bajo ($' +
                            recaudoPorMes[meses[k]].toFixed(2) + ' vs promedio $' + mean.toFixed(2) + ')',
                        severidad: z < -3 ? 'alta' : 'media',
                        datos: {
                            mes: meses[k],
                            recaudo: recaudoPorMes[meses[k]],
                            promedio: Math.round(mean * 100) / 100,
                            zScore: Math.round(z * 100) / 100
                        }
                    });
                }
            }
        }

        return anomalias;
    },

    /**
     * Detecta meses con gastos significativamente altos.
     */
    _detectarGastoAlto(umbral) {
        var anomalias = [];
        var gastos = JSON.parse(localStorage.getItem('jaar_gastos') || '[]');
        if (gastos.length < 3) return anomalias;

        var valores = [];
        for (var i = 0; i < gastos.length; i++) {
            valores.push(parseFloat(gastos[i].monto) || 0);
        }

        var mean = this._calcMean(valores);
        var stdDev = this._calcStdDev(valores);

        if (stdDev > 0) {
            for (var j = 0; j < gastos.length; j++) {
                var monto = parseFloat(gastos[j].monto) || 0;
                var z = this._zScore(monto, mean, stdDev);
                if (z > umbral) {
                    anomalias.push({
                        tipo: 'gasto_alto',
                        descripcion: 'Gasto atipicamente alto: "' + (gastos[j].desc || '').substring(0, 40) +
                            '" ($' + monto.toFixed(2) + ' vs promedio $' + mean.toFixed(2) + ')',
                        severidad: z > 3 ? 'alta' : 'media',
                        datos: {
                            gastoId: gastos[j].id,
                            descripcion: gastos[j].desc || '',
                            monto: monto,
                            promedio: Math.round(mean * 100) / 100,
                            zScore: Math.round(z * 100) / 100
                        }
                    });
                }
            }
        }

        return anomalias;
    },

    /**
     * Detecta pagos repentinos de usuarios con larga morosidad.
     */
    _detectarPagoAtipico() {
        var anomalias = [];
        var pagos = JSON.parse(localStorage.getItem('jaar_pagos') || '[]');
        var usuarios = JSON.parse(localStorage.getItem('jaar_users') || '[]');
        if (usuarios.length === 0) {
            usuarios = JSON.parse(localStorage.getItem('jaar_miembros') || '[]');
        }

        // Buscar pagos recientes de usuarios que tenian 3+ meses sin pagar
        var mesActual = this._formatMes(new Date());
        for (var i = 0; i < pagos.length; i++) {
            var pago = pagos[i];
            if (pago.mesTarget !== mesActual) continue;

            var user = null;
            for (var j = 0; j < usuarios.length; j++) {
                if (String(usuarios[j].id) === String(pago.usuarioId)) {
                    user = usuarios[j];
                    break;
                }
            }

            if (user) {
                // Verificar historial previo: si tenia muchos meses sin pagar
                var historial = this._getUserPaymentHistory(pago.usuarioId, 6);
                var mesesImpagos = 0;
                for (var k = 0; k < historial.length - 1; k++) {
                    if (historial[k].estado !== 'pagado') mesesImpagos++;
                }

                if (mesesImpagos >= 3) {
                    anomalias.push({
                        tipo: 'pago_atipico',
                        descripcion: (user.nombre || 'Usuario ' + pago.usuarioId) +
                            ' realizo un pago tras ' + mesesImpagos + ' meses de morosidad',
                        severidad: 'baja',
                        datos: {
                            usuarioId: pago.usuarioId,
                            nombre: user.nombre || '',
                            mesesPreviosSinPago: mesesImpagos,
                            montoPago: parseFloat(pago.monto) || 0
                        }
                    });
                }
            }
        }

        return anomalias;
    },

    /**
     * Detecta sectores con caida de pagos mayor al 30%.
     */
    _detectarSectorCaida() {
        var anomalias = [];
        var usuarios = JSON.parse(localStorage.getItem('jaar_users') || '[]');
        if (usuarios.length === 0) {
            usuarios = JSON.parse(localStorage.getItem('jaar_miembros') || '[]');
        }
        var saldos = JSON.parse(localStorage.getItem('jaar_saldos') || '{}');
        var ahora = new Date();
        var mesActual = this._formatMes(ahora);
        var mesAnteriorDate = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
        var mesAnterior = this._formatMes(mesAnteriorDate);

        // Agrupar por sector
        var sectores = {};
        for (var i = 0; i < usuarios.length; i++) {
            var sec = usuarios[i].sector || 'Sin sector';
            if (!sectores[sec]) {
                sectores[sec] = { anterior: { total: 0, pagados: 0 }, actual: { total: 0, pagados: 0 } };
            }

            // Mes anterior
            sectores[sec].anterior.total++;
            var keyAnt = usuarios[i].id + '_' + mesAnterior;
            if (saldos[keyAnt] && saldos[keyAnt].estado === 'pagado') {
                sectores[sec].anterior.pagados++;
            }

            // Mes actual
            sectores[sec].actual.total++;
            if (usuarios[i].pagadoEsteMes) {
                sectores[sec].actual.pagados++;
            }
        }

        var sectorKeys = Object.keys(sectores);
        for (var j = 0; j < sectorKeys.length; j++) {
            var nombre = sectorKeys[j];
            var data = sectores[nombre];

            if (data.anterior.total === 0 || data.anterior.pagados === 0) continue;

            var tasaAnterior = data.anterior.pagados / data.anterior.total;
            var tasaActual = data.actual.total > 0 ? data.actual.pagados / data.actual.total : 0;
            var caida = tasaAnterior - tasaActual;

            if (caida > 0.30) {
                anomalias.push({
                    tipo: 'sector_caida',
                    descripcion: 'El sector "' + nombre + '" presenta caida de pagos del ' +
                        Math.round(caida * 100) + '% respecto al mes anterior',
                    severidad: caida > 0.50 ? 'alta' : 'media',
                    datos: {
                        sector: nombre,
                        tasaAnterior: Math.round(tasaAnterior * 100),
                        tasaActual: Math.round(tasaActual * 100),
                        caidaPorcentaje: Math.round(caida * 100)
                    }
                });
            }
        }

        return anomalias;
    },

    // ──────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────

    /**
     * Obtiene el historial de pago de un usuario para los ultimos N meses.
     * @param {number|string} userId
     * @param {number} months
     * @returns {Array<{ mes: string, estado: string }>}
     */
    _getUserPaymentHistory(userId, months) {
        var saldos = JSON.parse(localStorage.getItem('jaar_saldos') || '{}');
        var historial = [];
        var cursor = new Date();

        for (var i = 0; i < months; i++) {
            var mes = this._formatMes(cursor);
            var key = userId + '_' + mes;
            var saldo = saldos[key];

            historial.push({
                mes: mes,
                estado: saldo ? saldo.estado : 'pendiente',
                pagado: saldo ? (saldo.pagado || 0) : 0,
                saldo: saldo ? (saldo.saldo || 0) : 0
            });

            cursor.setMonth(cursor.getMonth() - 1);
        }

        return historial;
    },

    /**
     * Calcula el z-score de un valor dado la media y desviacion estandar.
     */
    _zScore(value, mean, stdDev) {
        if (stdDev === 0) return 0;
        return (value - mean) / stdDev;
    },

    /**
     * Calcula la media de un arreglo de valores numericos.
     */
    _calcMean(values) {
        if (values.length === 0) return 0;
        var sum = 0;
        for (var i = 0; i < values.length; i++) {
            sum += values[i];
        }
        return sum / values.length;
    },

    /**
     * Calcula la desviacion estandar de un arreglo de valores numericos.
     */
    _calcStdDev(values) {
        if (values.length < 2) return 0;
        var mean = this._calcMean(values);
        var sumSq = 0;
        for (var i = 0; i < values.length; i++) {
            var diff = values[i] - mean;
            sumSq += diff * diff;
        }
        return Math.sqrt(sumSq / values.length);
    },

    /**
     * Formatea una fecha como "YYYY-MM".
     */
    _formatMes(date) {
        return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
    },

    /**
     * Devuelve el timestamp actual en milisegundos.
     */
    _now() {
        return Date.now();
    },

    // ──────────────────────────────────────
    // Cache
    // ──────────────────────────────────────

    _getCache() {
        var raw = localStorage.getItem(this.CONFIG.CACHE_KEY);
        if (!raw) return null;

        try {
            var cached = JSON.parse(raw);
            if (cached && cached.timestamp && (this._now() - cached.timestamp < this.CONFIG.CACHE_TTL_MS)) {
                return cached;
            }
        } catch (e) {
            // Cache corrupto, ignorar
        }

        return null;
    },

    _setCache(data) {
        try {
            localStorage.setItem(this.CONFIG.CACHE_KEY, JSON.stringify(data));
        } catch (e) {
            // localStorage lleno o no disponible, ignorar silenciosamente
        }
    }
};

// Autoarranque: ejecutar analisis al cargar la pagina
document.addEventListener('DOMContentLoaded', function () {
    AIEngine.analyze();
});
