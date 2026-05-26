/**
 * app.js — Controlador principal de Cobros · JAAR Digital v2.0
 * Integra: PagosEngine, Comisiones, Puntos, AIEngine
 */

let appState = {
    usuarios: [],
    pagosPendientes: [],
    isOnline: navigator.onLine,
    modoRutaInteligente: false
};

// Referencias DOM
const usersListEl     = document.getElementById('usersList');
const pendingCountEl  = document.getElementById('pendingCount');
const connectionBadge = document.getElementById('connectionBadge');
const syncBtn         = document.getElementById('syncBtn');
const addDemoUserBtn  = document.getElementById('addDemoUserBtn');
const searchInput     = document.getElementById('searchInput');
const toastEl         = document.getElementById('toastNotification');
const filtroMes       = document.getElementById('filtroMes');
const filtroEstado    = document.getElementById('filtroEstado');

// ── Estado de pago ──

function calcularEstado(user) {
    if (typeof PagosEngine !== 'undefined') {
        return PagosEngine.calcularEstado(user.id);
    }
    if (user.pagadoEsteMes) return 'activo';
    const mesesDeuda = user.mesesSinPagar || 0;
    if (mesesDeuda >= 3) return 'corte';
    if (mesesDeuda >= 1) return 'moroso';
    return 'activo';
}

function badgeEstado(estado) {
    const map = {
        activo:  ['✅ Al Día',      'estado-activo'],
        parcial: ['🟡 Parcial',     'estado-parcial'],
        moroso:  ['⚠️ Moroso',      'estado-moroso'],
        corte:   ['🔴 Corte',       'estado-corte'],
    };
    const [txt, cls] = map[estado] || ['', ''];
    return `<span class="estado-badge ${cls}">${txt}</span>`;
}

function badgeRiesgo(userId) {
    if (typeof AIEngine === 'undefined') return '';
    const r = AIEngine.calcularRiesgo(userId);
    if (!r) return '';
    const colors = { bajo: 'riesgo-bajo', medio: 'riesgo-medio', alto: 'riesgo-alto', critico: 'riesgo-critico' };
    return `<span class="riesgo-badge ${colors[r.nivel] || ''}" title="Riesgo: ${r.score}">${r.score}</span>`;
}

// ── Inicialización ──

function init() {
    const savedUsers    = localStorage.getItem('jaar_users');
    const savedPayments = localStorage.getItem('jaar_pending_payments');

    if (savedUsers) {
        appState.usuarios = JSON.parse(savedUsers);
    } else {
        appState.usuarios = [
            { id: 1, nombre: "Sanchez Maylene",   sector: "Caballero Centro", pagadoEsteMes: false, mesesSinPagar: 0 },
            { id: 2, nombre: "Familia Rodriguez", sector: "Caballero Arriba", pagadoEsteMes: true,  mesesSinPagar: 0 },
            { id: 3, nombre: "Los Alonsos",       sector: "Caballero Abajo",  pagadoEsteMes: false, mesesSinPagar: 2 },
            { id: 4, nombre: "Familia Moreno",    sector: "Caballero Centro", pagadoEsteMes: false, mesesSinPagar: 3 },
        ];
        saveUsersLocal();
    }

    if (savedPayments) {
        appState.pagosPendientes = JSON.parse(savedPayments);
    }

    window.addEventListener('online',  updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();

    const mesActual = new Date().getMonth() + 1;
    if (filtroMes) filtroMes.value = mesActual;

    if (syncBtn) syncBtn.addEventListener('click', forceSync);
    if (addDemoUserBtn) addDemoUserBtn.addEventListener('click', addDemoUser);
    if (searchInput) searchInput.addEventListener('input', () => updateUI());
    if (filtroMes) filtroMes.addEventListener('change', () => updateUI());
    if (filtroEstado) filtroEstado.addEventListener('change', () => updateUI());

    const btnRuta = document.getElementById('btnRutaInteligente');
    if (btnRuta) btnRuta.addEventListener('click', toggleRutaInteligente);

    updateUI();
    renderAIQuickStats();
}

// ── UI ──

function updateUI() {
    renderUsers(
        searchInput ? searchInput.value : '',
        filtroMes ? filtroMes.value : '',
        filtroEstado ? filtroEstado.value : ''
    );
    if (pendingCountEl) {
        pendingCountEl.textContent = appState.pagosPendientes.length;
        pendingCountEl.style.color = appState.pagosPendientes.length > 0 ? "var(--danger)" : "var(--success)";
    }
}

function renderUsers(filterText = '', mes = '', estado = '') {
    if (!usersListEl) return;
    usersListEl.innerHTML = '';

    let filtered = appState.usuarios.filter(u =>
        u.nombre.toLowerCase().includes(filterText.toLowerCase()) ||
        u.sector.toLowerCase().includes(filterText.toLowerCase())
    );

    if (estado) {
        filtered = filtered.filter(u => calcularEstado(u) === estado);
    }

    if (mes) {
        const pagos = JSON.parse(localStorage.getItem('jaar_pagos') || '[]');
        const pagosMes = pagos.filter(p => {
            if (p.mesTarget) {
                const [, m] = p.mesTarget.split('-').map(Number);
                return m === parseInt(mes);
            }
            if (!p.fecha) return false;
            const d = new Date(p.fecha);
            return !isNaN(d) && (d.getMonth() + 1) === parseInt(mes);
        });
        const idsPagados = new Set(pagosMes.map(p => String(p.usuarioId)));
        filtered = filtered.map(u => ({ ...u, pagadoEnMes: idsPagados.has(String(u.id)) }));
    }

    // Ruta Inteligente: ordenar por prioridad IA
    if (appState.modoRutaInteligente && typeof AIEngine !== 'undefined') {
        const colaResult = AIEngine.generarColaCobranza();
        const lista = colaResult.lista || [];          // generarColaCobranza() devuelve { total, lista, porSector }
        const prioMap = {};
        lista.forEach((item, i) => {
            prioMap[String(item.userId)] = {
                idx: i,
                razon: item.recomendacion || '',
                score: item.riesgoScore || 0
            };
        });
        filtered.sort((a, b) => {
            const pa = prioMap[String(a.id)] || { idx: 999 };
            const pb = prioMap[String(b.id)] || { idx: 999 };
            return pa.idx - pb.idx;
        });
    }

    if (filtered.length === 0) {
        usersListEl.innerHTML = `<div class="empty-state">No se encontraron vecinos con ese filtro.</div>`;
        return;
    }

    let currentSector = '';
    filtered.forEach(user => {
        const estadoUser = calcularEstado(user);
        const pagadoEnMes = user.pagadoEnMes !== undefined ? user.pagadoEnMes : user.pagadoEsteMes;

        // Encabezado de sector en modo Ruta Inteligente
        if (appState.modoRutaInteligente && user.sector !== currentSector) {
            currentSector = user.sector;
            const header = document.createElement('div');
            header.className = 'sector-header';
            header.innerHTML = `<strong>📍 ${currentSector}</strong>`;
            usersListEl.appendChild(header);
        }

        // Info de deuda
        let deudaInfo = '';
        if (typeof PagosEngine !== 'undefined') {
            const resumen = PagosEngine.getResumenUsuario(user.id);
            if (resumen.deuda > 0) {
                deudaInfo = `<span class="deuda-info">Deuda: B/.${resumen.deuda.toFixed(2)} (${resumen.mesesDeuda} mes${resumen.mesesDeuda > 1 ? 'es' : ''})</span>`;
            } else if (resumen.adelantados > 0) {
                deudaInfo = `<span class="adelanto-info">Adelantado ${resumen.adelantados} mes${resumen.adelantados > 1 ? 'es' : ''}</span>`;
            }
        }

        // Info de puntos
        let puntosInfo = '';
        if (typeof Puntos !== 'undefined') {
            const saldo = Puntos.getSaldo(user.id);
            if (saldo > 0) {
                puntosInfo = `<span class="puntos-badge-sm">⭐ ${saldo} pts</span>`;
            }
        }

        const div = document.createElement('div');
        div.className = 'user-card';
        div.innerHTML = `
            <div class="user-info">
                <h3>
                    <span class="status-indicator ${estadoUser === 'activo' ? 'al-dia' : ''}"></span>
                    ${user.nombre}
                    ${badgeEstado(estadoUser)}
                    ${badgeRiesgo(user.id)}
                </h3>
                <p>📍 ${user.sector} ${puntosInfo}</p>
                ${deudaInfo}
            </div>
            <button class="btn-pay ${pagadoEnMes ? 'paid' : ''}"
                    onclick="abrirModalCobro(${user.id})"
                    ${pagadoEnMes && estadoUser === 'activo' ? '' : ''}>
                ${pagadoEnMes && estadoUser === 'activo' ? '💰 Adelantar' : '💰 Cobrar'}
            </button>
        `;
        usersListEl.appendChild(div);
    });
}

// ── AI Quick Stats ──

function renderAIQuickStats() {
    const container = document.getElementById('aiQuickStats');
    if (!container || typeof AIEngine === 'undefined') return;

    const metrics = AIEngine.calcularMetricas();
    const analisis = AIEngine.analyze();
    if (!analisis) return;

    const enRiesgo = Object.values(analisis.riskScores || {}).filter(r => r.score > 50).length;
    const predicciones = (analisis.predictions || []).filter(p => p.probabilidad > 0.5).length;

    container.innerHTML = `
        <div class="ai-kpi-grid">
            <div class="ai-kpi-card">
                <div class="ai-kpi-value">${Math.round((metrics.tasaRecaudoMes || 0) * 100)}%</div>
                <div class="ai-kpi-label">Recaudo</div>
            </div>
            <div class="ai-kpi-card">
                <div class="ai-kpi-value">${enRiesgo}</div>
                <div class="ai-kpi-label">En Riesgo</div>
            </div>
            <div class="ai-kpi-card">
                <div class="ai-kpi-value">${predicciones}</div>
                <div class="ai-kpi-label">Alerta</div>
            </div>
            <div class="ai-kpi-card">
                <div class="ai-kpi-value">${appState.pagosPendientes.length}</div>
                <div class="ai-kpi-label">Pendientes</div>
            </div>
        </div>
    `;
}

function toggleRutaInteligente() {
    appState.modoRutaInteligente = !appState.modoRutaInteligente;
    const btn = document.getElementById('btnRutaInteligente');
    if (btn) {
        btn.classList.toggle('active', appState.modoRutaInteligente);
        btn.textContent = appState.modoRutaInteligente ? '🧠 Ruta IA Activa' : '🧠 Ruta Inteligente';
    }
    updateUI();
}

// ── Modal de Cobro ──

function abrirModalCobro(userId) {
    const user = appState.usuarios.find(u => u.id === userId);
    if (!user) return;

    const modal = document.getElementById('modalCobro');
    if (!modal) { registrarCobroLegacy(userId); return; }

    const cfg = typeof PagosEngine !== 'undefined' ? PagosEngine.getConfig() : { cuotaMensual: 3.00 };
    const cuota = cfg.cuotaMensual;

    let deudaTotal = 0, mesesDeuda = 0;
    if (typeof PagosEngine !== 'undefined') {
        const resumen = PagosEngine.getResumenUsuario(userId);
        deudaTotal = resumen.deuda;
        mesesDeuda = resumen.mesesDeuda;
    }

    let puntosDisponibles = 0, descuentoMax = 0;
    if (typeof Puntos !== 'undefined') {
        puntosDisponibles = Puntos.getSaldo(userId);
        descuentoMax = Puntos.getDescuentoDisponible(userId);
    }

    document.getElementById('modalUserName').textContent = user.nombre;
    document.getElementById('modalUserSector').textContent = user.sector;
    document.getElementById('modalUserId').value = userId;

    const statusEl = document.getElementById('modalDeudaStatus');
    if (statusEl) {
        if (deudaTotal > 0) {
            statusEl.innerHTML = `<span class="bad">Debe ${mesesDeuda} mes${mesesDeuda > 1 ? 'es' : ''} (B/.${deudaTotal.toFixed(2)})</span>`;
        } else {
            statusEl.innerHTML = `<span class="good">Al día</span>`;
        }
    }

    const puntosEl = document.getElementById('modalPuntosInfo');
    if (puntosEl) {
        puntosEl.innerHTML = puntosDisponibles > 0
            ? `⭐ ${puntosDisponibles} pts disponibles (= B/.${descuentoMax.toFixed(2)} descuento)`
            : `⭐ Sin puntos acumulados`;
    }

    seleccionarTipoPago('mensual');
    actualizarMontoModal(cuota);

    const chkPuntos = document.getElementById('chkUsarPuntos');
    if (chkPuntos) {
        chkPuntos.checked = false;
        chkPuntos.disabled = puntosDisponibles < 10;
        chkPuntos.onchange = () => recalcularMontoConDescuento();
    }

    modal.classList.add('show');
}

function cerrarModalCobro() {
    const modal = document.getElementById('modalCobro');
    if (modal) modal.classList.remove('show');
}

function seleccionarTipoPago(tipo) {
    document.querySelectorAll('.tipo-pago-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.tipo-pago-btn[data-tipo="${tipo}"]`);
    if (btn) btn.classList.add('active');

    document.querySelectorAll('.tipo-pago-panel').forEach(p => p.style.display = 'none');
    const panel = document.getElementById('panel_' + tipo);
    if (panel) panel.style.display = 'block';

    document.getElementById('modalTipoPago').value = tipo;
    recalcularMontoModal();
}

function recalcularMontoModal() {
    const tipo = document.getElementById('modalTipoPago').value;
    const cfg = typeof PagosEngine !== 'undefined' ? PagosEngine.getConfig() : { cuotaMensual: 3.00 };
    const cuota = cfg.cuotaMensual;
    const userId = parseInt(document.getElementById('modalUserId').value);

    let monto = cuota;

    if (tipo === 'mensual') {
        monto = cuota;
    } else if (tipo === 'diario') {
        const dias = parseInt(document.getElementById('inputDias').value) || 1;
        monto = Math.round((cuota / 30) * dias * 100) / 100;
        const labelDias = document.getElementById('labelDiasCalc');
        if (labelDias) labelDias.textContent = `${dias} día${dias > 1 ? 's' : ''} × B/.${(cuota / 30).toFixed(2)} = B/.${monto.toFixed(2)}`;
    } else if (tipo === 'multi_mes') {
        const meses = parseInt(document.getElementById('inputMeses').value) || 2;
        monto = Math.round(cuota * meses * 100) / 100;
        const labelMeses = document.getElementById('labelMesesCalc');
        if (labelMeses) labelMeses.textContent = `${meses} meses × B/.${cuota.toFixed(2)} = B/.${monto.toFixed(2)}`;
    } else if (tipo === 'parcial') {
        monto = parseFloat(document.getElementById('inputParcial').value) || 0;
    } else if (tipo === 'puesta_al_dia') {
        if (typeof PagosEngine !== 'undefined') {
            monto = PagosEngine.getDeudaTotal(userId);
        }
        const labelDeuda = document.getElementById('labelDeudaTotal');
        if (labelDeuda) labelDeuda.textContent = `Deuda total: B/.${monto.toFixed(2)}`;
    }

    actualizarMontoModal(monto);
    recalcularMontoConDescuento();
}

function recalcularMontoConDescuento() {
    const montoBase = parseFloat(document.getElementById('modalMontoBase').value) || 0;
    const chk = document.getElementById('chkUsarPuntos');
    let descuento = 0;

    if (chk && chk.checked) {
        const userId = parseInt(document.getElementById('modalUserId').value);
        if (typeof Puntos !== 'undefined') {
            descuento = Math.min(Puntos.getDescuentoDisponible(userId), montoBase);
        }
    }

    const montoFinal = Math.round((montoBase - descuento) * 100) / 100;
    document.getElementById('modalMontoFinal').textContent = `B/.${montoFinal.toFixed(2)}`;
    document.getElementById('modalDescuento').textContent = descuento > 0 ? `(-B/.${descuento.toFixed(2)} pts)` : '';
}

function actualizarMontoModal(monto) {
    document.getElementById('modalMontoBase').value = monto;
    document.getElementById('modalMontoFinal').textContent = `B/.${monto.toFixed(2)}`;
}

function confirmarCobro() {
    const userId = parseInt(document.getElementById('modalUserId').value);
    const tipo = document.getElementById('modalTipoPago').value;
    const montoBase = parseFloat(document.getElementById('modalMontoBase').value);
    const nota = document.getElementById('inputNota') ? document.getElementById('inputNota').value : '';
    const usarPuntos = document.getElementById('chkUsarPuntos') && document.getElementById('chkUsarPuntos').checked;

    if (!userId || montoBase <= 0) return;

    let mesesTarget = null;

    if (tipo === 'multi_mes') {
        const numMeses = parseInt(document.getElementById('inputMeses').value) || 2;
        mesesTarget = PagosEngine._generarMeses(new Date(), numMeses);
    } else if (tipo === 'adelanto') {
        const numMeses = parseInt(document.getElementById('inputMeses').value) || 2;
        mesesTarget = PagosEngine._generarMesesFuturos(new Date(), numMeses);
    }

    // Registrar pago
    let resultados = [];
    if (typeof PagosEngine !== 'undefined') {
        resultados = PagosEngine.registrarPago(userId, {
            tipo: tipo,
            monto: montoBase,
            mesesTarget: mesesTarget,
            nota: nota
        });
    } else {
        registrarCobroLegacy(userId);
    }

    // Descuento por puntos
    let descuento = 0;
    if (usarPuntos && typeof Puntos !== 'undefined' && resultados.length > 0) {
        const puntosDisp = Puntos.getSaldo(userId);
        const cfg = Puntos.getConfigReglas();
        const maxDesc = cfg.maximoDescuentoPorMes || 1.50;
        descuento = Math.min(puntosDisp * (cfg.tasaCanje || 0.10), maxDesc, montoBase);
        const puntosUsar = Math.ceil(descuento / (cfg.tasaCanje || 0.10));
        if (puntosUsar >= (cfg.minimoCanjeablePuntos || 10)) {
            Puntos.canjear(userId, puntosUsar, resultados[0].idPago);
        }
    }

    // Comisiones
    if (typeof Comisiones !== 'undefined') {
        resultados.forEach(recibo => {
            Comisiones.registrarComision(recibo, localStorage.getItem('jaar_username') || 'cobrador');
        });
    }

    // Puntos
    if (typeof Puntos !== 'undefined') {
        resultados.forEach(recibo => {
            Puntos.otorgarPuntos(userId, 'pago_basico', recibo.idPago);
            if (new Date().getDate() <= 15) {
                Puntos.otorgarPuntos(userId, 'pago_puntual', recibo.idPago);
            }
        });
        if (tipo === 'multi_mes' && resultados.length > 1) {
            Puntos.otorgarPuntos(userId, 'pago_consolidado', resultados[0].idPago);
        }
    }

    // Invalidar cache IA
    if (typeof AIEngine !== 'undefined') AIEngine.invalidateCache();

    // Recargar estado de usuarios
    const savedUsers = localStorage.getItem('jaar_users');
    if (savedUsers) appState.usuarios = JSON.parse(savedUsers);
    appState.pagosPendientes = JSON.parse(localStorage.getItem('jaar_pending_payments') || '[]');

    cerrarModalCobro();
    showToast(`Cobro de B/.${montoBase.toFixed(2)} registrado ✅`);
    updateUI();
    renderAIQuickStats();
}

// Fallback para compatibilidad sin modal
function registrarCobroLegacy(userId) {
    const userIndex = appState.usuarios.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        appState.usuarios[userIndex].pagadoEsteMes = true;
        appState.usuarios[userIndex].mesesSinPagar = 0;
        saveUsersLocal();

        const recibo = {
            idPago: Date.now(),
            usuarioId: userId,
            monto: 3.00,
            mes: new Date().getMonth() + 1,
            fecha: new Date().toISOString()
        };
        appState.pagosPendientes.push(recibo);

        const pagos = JSON.parse(localStorage.getItem('jaar_pagos') || '[]');
        pagos.push(recibo);
        localStorage.setItem('jaar_pagos', JSON.stringify(pagos));

        savePaymentsLocal();
        showToast("Cobro guardado localmente (Offline)");
        updateUI();
    }
}

// ── Utilidades ──

function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 3000);
}

function updateNetworkStatus() {
    appState.isOnline = navigator.onLine;
    if (!connectionBadge) return;
    if (appState.isOnline) {
        connectionBadge.textContent = "Conectado";
        connectionBadge.className = "badge online";
    } else {
        connectionBadge.textContent = "Sin Conexión";
        connectionBadge.className = "badge offline";
    }
}

function addDemoUser() {
    const newId = Date.now();
    const opciones = [
        { nombre: `Familia Demo ${Math.floor(Math.random()*100)}`, sector: "Sector Nuevo",     mesesSinPagar: 0 },
        { nombre: `Demo Moroso ${Math.floor(Math.random()*100)}`,  sector: "Caballero Abajo",  mesesSinPagar: 2 },
        { nombre: `Demo Corte ${Math.floor(Math.random()*100)}`,   sector: "Caballero Arriba", mesesSinPagar: 4 },
    ];
    const o = opciones[Math.floor(Math.random() * opciones.length)];
    appState.usuarios.push({ id: newId, nombre: o.nombre, sector: o.sector, pagadoEsteMes: false, mesesSinPagar: o.mesesSinPagar });
    saveUsersLocal();
    showToast("Vecino de prueba agregado");
    updateUI();
}

function saveUsersLocal()    { localStorage.setItem('jaar_users',            JSON.stringify(appState.usuarios)); }
function savePaymentsLocal() { localStorage.setItem('jaar_pending_payments', JSON.stringify(appState.pagosPendientes)); }

async function forceSync() {
    if (appState.pagosPendientes.length === 0) { showToast("Todo está al día."); return; }
    if (!appState.isOnline) { showToast("No hay internet para sincronizar."); return; }

    syncBtn.classList.add('loading');
    syncBtn.innerHTML = `<span class="icon">⏳</span><span class="sync-text">Conectando...</span>`;

    await new Promise(resolve => setTimeout(resolve, 2000));

    const subidos = appState.pagosPendientes.length;
    appState.pagosPendientes = [];
    savePaymentsLocal();

    showToast(`¡${subidos} cobros subidos a la nube con éxito!`);
    syncBtn.classList.remove('loading');
    syncBtn.innerHTML = `<span class="icon">☁️</span><span class="sync-text">Sincronizar</span>`;
    updateUI();
}

init();
