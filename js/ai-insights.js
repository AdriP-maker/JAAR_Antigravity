/**
 * js/ai-insights.js — Modulo de Renderizado de Insights IA para JAAR Digital
 * Renderiza componentes HTML para visualizar los resultados del AIEngine
 * en las distintas vistas: cobrador (index.html), admin (admin.html),
 * y cliente (historial.html).
 *
 * Depende de: AIEngine (js/ai-engine.js)
 */

const AIInsights = {

    // ──────────────────────────────────────
    // Vista del Cobrador (index.html)
    // ──────────────────────────────────────

    /**
     * Retorna un badge HTML con el nivel de riesgo y puntaje.
     * @param {{ score: number, nivel: string }} riesgo — resultado de AIEngine.calcularRiesgo()
     * @returns {string} HTML string
     */
    renderRiskBadge: function (riesgo) {
        if (!riesgo || typeof riesgo.score === 'undefined') {
            return '<span class="riesgo-badge riesgo-bajo">0</span>';
        }
        return '<span class="riesgo-badge riesgo-' + riesgo.nivel + '">' +
            riesgo.score + '</span>';
    },

    /**
     * Renderiza tarjetas de alerta de prediccion dentro del contenedor.
     * Muestra solo usuarios con probabilidad >= 0.4 (riesgo medio+).
     * @param {HTMLElement} container
     */
    renderPredictionAlerts: function (container) {
        if (!container) return;

        var data = AIEngine.analyze();
        var predicciones = data.predicciones || [];

        // Filtrar solo riesgo medio o superior
        var alertas = [];
        for (var i = 0; i < predicciones.length; i++) {
            if (predicciones[i].probabilidad >= 0.4) {
                alertas.push(predicciones[i]);
            }
        }

        // Ordenar por probabilidad descendente
        alertas.sort(function (a, b) { return b.probabilidad - a.probabilidad; });

        if (alertas.length === 0) {
            container.innerHTML = this._createCard(
                'Predicciones de Morosidad',
                '<p style="color:#94a3b8;text-align:center;padding:0.5rem 0;">Sin alertas activas</p>',
                'info'
            );
            return;
        }

        var html = '<div class="ai-dashboard-section">';
        html += '<div class="ai-dashboard-title">Alertas de Prediccion</div>';

        var limite = Math.min(alertas.length, 10);
        for (var j = 0; j < limite; j++) {
            var pred = alertas[j];
            var severidadClass = 'ai-alert-';
            if (pred.nivel === 'critico' || pred.nivel === 'alto') {
                severidadClass += 'alta';
            } else if (pred.nivel === 'medio') {
                severidadClass += 'media';
            } else {
                severidadClass += 'baja';
            }

            html += '<div class="ai-alert ' + severidadClass + '">';
            html += '<strong>' + (pred.userId || '') + '</strong> ';
            html += '— Prob. morosidad: ' + Math.round(pred.probabilidad * 100) + '%';
            if (pred.factores && pred.factores.length > 0) {
                html += '<br><small>' + pred.factores.join(', ') + '</small>';
            }
            if (pred.recomendacion) {
                html += '<br><em style="font-size:0.8rem;color:#64748b;">' + pred.recomendacion + '</em>';
            }
            html += '</div>';
        }

        html += '</div>';
        container.innerHTML = html;
    },

    // ──────────────────────────────────────
    // Vista del Admin (admin.html)
    // ──────────────────────────────────────

    /**
     * Renderiza el dashboard completo de IA: KPIs, heatmap de sectores,
     * tendencia de 6 meses, y anomalias.
     * @param {HTMLElement} container
     */
    renderDashboard: function (container) {
        if (!container) return;

        var data = AIEngine.analyze();
        var metricas = data.metricas || AIEngine.calcularMetricas();
        var anomalias = data.anomalias || AIEngine.detectarAnomalias();
        var riesgos = data.riesgos || [];

        var html = '';

        // --- KPI Cards ---
        var hogaresEnRiesgo = 0;
        var prediccionesMorosidad = 0;
        for (var i = 0; i < riesgos.length; i++) {
            if (riesgos[i].nivel === 'alto' || riesgos[i].nivel === 'critico') {
                hogaresEnRiesgo++;
            }
            if (riesgos[i].score >= 40) {
                prediccionesMorosidad++;
            }
        }

        html += '<div class="ai-dashboard-section">';
        html += '<div class="ai-dashboard-title">Indicadores Clave (IA)</div>';
        html += '<div class="ai-kpi-grid">';
        html += this._renderKPI(metricas.tasaRecaudoMes + '%', 'Tasa de Recaudo');
        html += this._renderKPI(hogaresEnRiesgo, 'Hogares en Riesgo');
        html += this._renderKPI(prediccionesMorosidad, 'Predicciones Morosidad');
        html += this._renderKPI(anomalias.length, 'Anomalias Detectadas');
        html += '</div>';
        html += '</div>';

        // --- Sector Heatmap ---
        html += this._renderSectorHeatmapHTML(metricas);

        // --- 6-month Trend ---
        html += this._renderTrendChartHTML();

        // --- Anomaly Alerts ---
        html += this._renderAnomalyAlertsHTML(anomalias);

        container.innerHTML = html;
    },

    /**
     * Renderiza solo las alertas de anomalias en el contenedor.
     * @param {HTMLElement} container
     */
    renderAnomalyAlerts: function (container) {
        if (!container) return;

        var anomalias = AIEngine.detectarAnomalias();
        container.innerHTML = this._renderAnomalyAlertsHTML(anomalias);
    },

    /**
     * Renderiza el heatmap de sectores (cajas coloreadas segun riesgo).
     * @param {HTMLElement} container
     */
    renderSectorHeatmap: function (container) {
        if (!container) return;

        var metricas = AIEngine.calcularMetricas();
        container.innerHTML = this._renderSectorHeatmapHTML(metricas);
    },

    /**
     * Renderiza la grafica de tendencia de recaudo de 6 meses.
     * @param {HTMLElement} container
     */
    renderTrendChart: function (container) {
        if (!container) return;

        container.innerHTML = this._renderTrendChartHTML();
    },

    // ──────────────────────────────────────
    // Vista del Cliente (historial.html)
    // ──────────────────────────────────────

    /**
     * Renderiza un mensaje amigable sobre el estado de riesgo del cliente.
     * No muestra puntaje numerico, solo texto descriptivo.
     * @param {HTMLElement} container
     * @param {number|string} userId
     */
    renderClientRiskMessage: function (container, userId) {
        if (!container) return;

        var riesgo = AIEngine.calcularRiesgo(userId);
        var mensajes = {
            bajo: '✅ Tu cuenta esta en buen estado. ¡Sigue asi!',
            medio: 'ℹ️ Tu cuenta esta al corriente, pero manten tus pagos al dia.',
            alto: '⚠️ Atencion: tu cuenta podria entrar en riesgo si no se regulariza pronto.',
            critico: '🔴 Tu cuenta requiere atencion urgente. Acercate a la directiva.'
        };

        var mensaje = mensajes[riesgo.nivel] || mensajes.bajo;

        var html = '<div class="risk-message risk-message-' + riesgo.nivel + '">';
        html += '<p style="margin:0;">' + mensaje + '</p>';
        html += '</div>';

        container.innerHTML = html;
    },

    // ──────────────────────────────────────
    // Utilidades Compartidas
    // ──────────────────────────────────────

    /**
     * Crea una tarjeta consistente con titulo, contenido y tipo.
     * @param {string} title — titulo de la tarjeta
     * @param {string} content — HTML interno
     * @param {string} type — 'info' | 'warning' | 'danger' | 'success'
     * @returns {string} HTML string
     */
    _createCard: function (title, content, type) {
        var borderColor = '';
        switch (type) {
            case 'warning': borderColor = 'border-left:3px solid #f59e0b;'; break;
            case 'danger': borderColor = 'border-left:3px solid #ef4444;'; break;
            case 'success': borderColor = 'border-left:3px solid #10b981;'; break;
            default: borderColor = 'border-left:3px solid #0d9488;'; break;
        }

        var html = '<div class="ai-card" style="' + borderColor + '">';
        html += '<div class="ai-card-title">' + title + '</div>';
        html += '<div class="ai-card-body">' + content + '</div>';
        html += '</div>';

        return html;
    },

    /**
     * Genera una grafica de barras CSS-only usando divs con alturas variables.
     * @param {Array<number>} values — valores a graficar
     * @param {number} maxHeight — altura maxima en px (default 50)
     * @returns {string} HTML string
     */
    _miniBarChart: function (values, maxHeight) {
        maxHeight = maxHeight || 50;

        if (!values || values.length === 0) {
            return '<div class="mini-chart"><span style="color:#94a3b8;font-size:0.75rem;">Sin datos</span></div>';
        }

        var max = 0;
        for (var i = 0; i < values.length; i++) {
            if (values[i] > max) max = values[i];
        }
        if (max === 0) max = 1;

        var html = '<div class="mini-chart">';
        for (var j = 0; j < values.length; j++) {
            var height = Math.round((values[j] / max) * maxHeight);
            height = Math.max(height, 2); // minimo 2px de altura
            var color = this._colorForRisk(Math.round((1 - values[j] / max) * 100));
            html += '<div class="mini-bar" style="height:' + height + 'px;background:' + color + ';" title="' + values[j] + '"></div>';
        }
        html += '</div>';

        return html;
    },

    /**
     * Retorna un color CSS segun el puntaje de riesgo (0-100).
     * @param {number} score
     * @returns {string} color CSS
     */
    _colorForRisk: function (score) {
        if (score <= 25) return '#10b981';   // verde — bajo
        if (score <= 50) return '#3b82f6';   // azul — medio
        if (score <= 75) return '#f59e0b';   // naranja — alto
        return '#ef4444';                     // rojo — critico
    },

    /**
     * Retorna la etiqueta en espanol para un nivel de riesgo.
     * @param {string} nivel
     * @returns {string}
     */
    _nivelLabel: function (nivel) {
        switch (nivel) {
            case 'bajo': return 'Bajo';
            case 'medio': return 'Medio';
            case 'alto': return 'Alto';
            case 'critico': return 'Critico';
            default: return 'Desconocido';
        }
    },

    // ──────────────────────────────────────
    // Helpers internos de renderizado
    // ──────────────────────────────────────

    /**
     * Renderiza una tarjeta KPI individual.
     * @param {number|string} value
     * @param {string} label
     * @returns {string} HTML string
     */
    _renderKPI: function (value, label) {
        var html = '<div class="ai-kpi-card">';
        html += '<div class="ai-kpi-value">' + value + '</div>';
        html += '<div class="ai-kpi-label">' + label + '</div>';
        html += '</div>';
        return html;
    },

    /**
     * Genera el HTML del heatmap de sectores.
     * @param {Object} metricas — resultado de AIEngine.calcularMetricas()
     * @returns {string} HTML string
     */
    _renderSectorHeatmapHTML: function (metricas) {
        var porSector = metricas.porSector || {};
        var sectores = Object.keys(porSector);

        if (sectores.length === 0) {
            return this._createCard('Mapa de Sectores', '<p style="color:#94a3b8;text-align:center;">Sin datos de sectores</p>', 'info');
        }

        var html = '<div class="ai-dashboard-section">';
        html += '<div class="ai-dashboard-title">Mapa de Riesgo por Sector</div>';
        html += '<div class="sector-heatmap">';

        for (var i = 0; i < sectores.length; i++) {
            var nombre = sectores[i];
            var data = porSector[nombre];
            var tasaMorosidad = data.total > 0 ? Math.round((data.morosos / data.total) * 100) : 0;

            // Determinar nivel de riesgo del sector
            var nivel;
            if (tasaMorosidad <= 25) nivel = 'bajo';
            else if (tasaMorosidad <= 50) nivel = 'medio';
            else if (tasaMorosidad <= 75) nivel = 'alto';
            else nivel = 'critico';

            var bgColor = this._colorForRisk(tasaMorosidad);

            html += '<div class="sector-box" style="background:' + bgColor + '20;color:' + bgColor + ';border:1px solid ' + bgColor + '40;">';
            html += '<div style="font-size:0.9rem;">' + nombre + '</div>';
            html += '<div style="font-size:0.7rem;margin-top:2px;">' + this._nivelLabel(nivel) + ' (' + tasaMorosidad + '% morosidad)</div>';
            html += '<div style="font-size:0.65rem;margin-top:2px;">' + data.total + ' hogares | ' + data.pagados + ' pagados</div>';
            html += '</div>';
        }

        html += '</div>';
        html += '</div>';

        return html;
    },

    /**
     * Genera el HTML de la grafica de tendencia de 6 meses.
     * Usa datos de recaudo historico de localStorage.
     * @returns {string} HTML string
     */
    _renderTrendChartHTML: function () {
        var pagos = JSON.parse(localStorage.getItem('jaar_pagos') || '[]');
        var recaudoPorMes = {};

        for (var i = 0; i < pagos.length; i++) {
            var mes = pagos[i].mesTarget;
            if (!mes) continue;
            if (!recaudoPorMes[mes]) recaudoPorMes[mes] = 0;
            recaudoPorMes[mes] += parseFloat(pagos[i].monto) || 0;
        }

        // Obtener ultimos 6 meses
        var meses = [];
        var valores = [];
        var cursor = new Date();
        for (var j = 0; j < 6; j++) {
            var mesKey = cursor.getFullYear() + '-' + String(cursor.getMonth() + 1).padStart(2, '0');
            meses.unshift(mesKey);
            valores.unshift(recaudoPorMes[mesKey] || 0);
            cursor.setMonth(cursor.getMonth() - 1);
        }

        var html = '<div class="ai-dashboard-section">';
        html += '<div class="ai-dashboard-title">Tendencia de Recaudo (6 meses)</div>';
        html += '<div class="ai-card">';

        // Barras
        var max = 0;
        for (var k = 0; k < valores.length; k++) {
            if (valores[k] > max) max = valores[k];
        }
        if (max === 0) max = 1;

        html += '<div class="mini-chart" style="height:60px;align-items:flex-end;">';
        for (var m = 0; m < valores.length; m++) {
            var height = Math.round((valores[m] / max) * 55);
            height = Math.max(height, 2);
            html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">';
            html += '<div class="mini-bar" style="height:' + height + 'px;width:100%;"></div>';
            html += '</div>';
        }
        html += '</div>';

        // Etiquetas de meses
        html += '<div style="display:flex;gap:3px;margin-top:4px;">';
        for (var n = 0; n < meses.length; n++) {
            var partes = meses[n].split('-');
            var etiqueta = partes[1] + '/' + partes[0].substring(2);
            html += '<div class="mini-bar-label" style="flex:1;">' + etiqueta + '</div>';
        }
        html += '</div>';

        // Valores
        html += '<div style="display:flex;gap:3px;margin-top:2px;">';
        for (var p = 0; p < valores.length; p++) {
            html += '<div class="mini-bar-label" style="flex:1;">$' + valores[p].toFixed(0) + '</div>';
        }
        html += '</div>';

        html += '</div>';
        html += '</div>';

        return html;
    },

    /**
     * Genera el HTML de las alertas de anomalias.
     * @param {Array} anomalias — resultado de AIEngine.detectarAnomalias()
     * @returns {string} HTML string
     */
    _renderAnomalyAlertsHTML: function (anomalias) {
        if (!anomalias || anomalias.length === 0) {
            return '<div class="ai-dashboard-section">' +
                '<div class="ai-dashboard-title">Anomalias</div>' +
                '<p style="color:#94a3b8;text-align:center;padding:0.5rem 0;font-size:0.85rem;">No se detectaron anomalias</p>' +
                '</div>';
        }

        // Ordenar por severidad
        var orden = { alta: 0, media: 1, baja: 2 };
        anomalias.sort(function (a, b) {
            return (orden[a.severidad] || 2) - (orden[b.severidad] || 2);
        });

        var html = '<div class="ai-dashboard-section">';
        html += '<div class="ai-dashboard-title">Anomalias Detectadas (' + anomalias.length + ')</div>';

        for (var i = 0; i < anomalias.length; i++) {
            var anom = anomalias[i];
            var severidadClass = 'ai-alert-' + (anom.severidad || 'baja');

            html += '<div class="ai-alert ' + severidadClass + '">';
            html += '<strong style="text-transform:capitalize;">' + (anom.tipo || '').replace(/_/g, ' ') + '</strong>';
            html += '<br>' + (anom.descripcion || '');
            html += '</div>';
        }

        html += '</div>';

        return html;
    }
};
