/**
 * app.js - Lógica Vanilla JS Offline-First
 * Maneja el DOM, localStorage (como mock de IndexedDB/SQLite), y simula la red.
 */

// Estado global
let appState = {
    usuarios: [],
    pagosPendientes: [],
    isOnline: navigator.onLine
};

// Referencias DOM
const usersListEl    = document.getElementById('usersList');
const pendingCountEl = document.getElementById('pendingCount');
const connectionBadge= document.getElementById('connectionBadge');
const syncBtn        = document.getElementById('syncBtn');
const addDemoUserBtn = document.getElementById('addDemoUserBtn');
const searchInput    = document.getElementById('searchInput');
const toastEl        = document.getElementById('toastNotification');
const filtroMes      = document.getElementById('filtroMes');
const filtroEstado   = document.getElementById('filtroEstado');

// ——————————————————————————————————————
// Lógica de estado de usuario
// ——————————————————————————————————————

/**
 * Calcula el estado de un vecino basado en su historial de pagos.
 * - activo: pagó este mes
 * - moroso: 1–2 meses sin pagar
 * - corte:  3 o más meses sin pagar
 */
function calcularEstado(user) {
    if (user.pagadoEsteMes) return 'activo';
    const mesesDeuda = user.mesesSinPagar || 0;
    if (mesesDeuda >= 3) return 'corte';
    if (mesesDeuda >= 1) return 'moroso';
    return 'activo';
}

function badgeEstado(estado) {
    const map = {
        activo: ['✅ Al Día',   'estado-activo'],
        moroso: ['⚠️ Moroso',   'estado-moroso'],
        corte:  ['🔴 Corte',    'estado-corte'],
    };
    const [txt, cls] = map[estado] || ['', ''];
    return `<span class="estado-badge ${cls}">${txt}</span>`;
}

// ——————————————————————————————————————
// Inicialización
// ——————————————————————————————————————
function init() {
    const savedUsers    = localStorage.getItem('jaar_users');
    const savedPayments = localStorage.getItem('jaar_pending_payments');

    if (savedUsers) {
        appState.usuarios = JSON.parse(savedUsers);
    } else {
        appState.usuarios = [
            { id: 1, nombre: "Sanchez Maylene",    sector: "Caballero Centro", pagadoEsteMes: false, mesesSinPagar: 0 },
            { id: 2, nombre: "Familia Rodriguez",  sector: "Caballero Arriba", pagadoEsteMes: true,  mesesSinPagar: 0 },
            { id: 3, nombre: "Los Alonsos",        sector: "Caballero Abajo",  pagadoEsteMes: false, mesesSinPagar: 2 },
            { id: 4, nombre: "Familia Moreno",     sector: "Caballero Centro", pagadoEsteMes: false, mesesSinPagar: 3 },
        ];
        saveUsersLocal();
    }

    if (savedPayments) {
        appState.pagosPendientes = JSON.parse(savedPayments);
    }

    window.addEventListener('online',  updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();

    // Preseleccionar el mes actual
    const mesActual = new Date().getMonth() + 1;
    filtroMes.value = mesActual;

    syncBtn.addEventListener('click', forceSync);
    addDemoUserBtn.addEventListener('click', addDemoUser);
    searchInput.addEventListener('input',  () => updateUI());
    filtroMes.addEventListener('change',   () => updateUI());
    filtroEstado.addEventListener('change',() => updateUI());

    updateUI();
}

// ——————————————————————————————————————
// Lógica UI
// ——————————————————————————————————————
function updateUI() {
    renderUsers(searchInput.value, filtroMes.value, filtroEstado.value);
    pendingCountEl.textContent = appState.pagosPendientes.length;
    pendingCountEl.style.color = appState.pagosPendientes.length > 0
        ? "var(--danger)" : "var(--success)";
}

function renderUsers(filterText = '', mes = '', estado = '') {
    usersListEl.innerHTML = '';

    let filtered = appState.usuarios.filter(u =>
        u.nombre.toLowerCase().includes(filterText.toLowerCase()) ||
        u.sector.toLowerCase().includes(filterText.toLowerCase())
    );

    // Filtro por estado
    if (estado) {
        filtered = filtered.filter(u => calcularEstado(u) === estado);
    }

    // Filtro por mes (compara vs pagos guardados ese mes)
    if (mes) {
        const pagos = JSON.parse(localStorage.getItem('jaar_pagos') || '[]');
        const pagosMes = pagos.filter(p => {
            if (!p.fecha) return false;
            const d = new Date(p.fecha);
            return !isNaN(d) && (d.getMonth() + 1) === parseInt(mes);
        });
        const idsPagadosMes = new Set(pagosMes.map(p => p.usuarioId?.toString() || p.miembroId?.toString()));

        // Marcar temporalmente si pagaron en ese mes
        filtered = filtered.map(u => ({
            ...u,
            pagadoEnMes: idsPagadosMes.has(u.id.toString())
        }));
    }

    if (filtered.length === 0) {
        usersListEl.innerHTML = `<div class="empty-state">No se encontraron vecinos con ese filtro.</div>`;
        return;
    }

    filtered.forEach(user => {
        const estadoUser = calcularEstado(user);
        const pagadoEnMes = user.pagadoEnMes !== undefined ? user.pagadoEnMes : user.pagadoEsteMes;

        const div = document.createElement('div');
        div.className = 'user-card';
        div.innerHTML = `
            <div class="user-info">
                <h3>
                    <span class="status-indicator ${estadoUser === 'activo' ? 'al-dia' : ''}"></span>
                    ${user.nombre}
                    ${badgeEstado(estadoUser)}
                </h3>
                <p>📍 ${user.sector}</p>
            </div>
            <button class="btn-pay ${pagadoEnMes ? 'paid' : ''}"
                    onclick="registrarCobro(${user.id})"
                    ${pagadoEnMes ? 'disabled' : ''}>
                ${pagadoEnMes ? 'Pagado' : 'Cobrar $3.00'}
            </button>
        `;
        usersListEl.appendChild(div);
    });
}

function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 3000);
}

function updateNetworkStatus() {
    appState.isOnline = navigator.onLine;
    if (appState.isOnline) {
        connectionBadge.textContent = "Conectado";
        connectionBadge.className   = "badge online";
    } else {
        connectionBadge.textContent = "Sin Conexión";
        connectionBadge.className   = "badge offline";
    }
}

// ——————————————————————————————————————
// Core Offline-First
// ——————————————————————————————————————
function registrarCobro(userId) {
    const userIndex = appState.usuarios.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        appState.usuarios[userIndex].pagadoEsteMes  = true;
        appState.usuarios[userIndex].mesesSinPagar  = 0;
        saveUsersLocal();

        const recibo = {
            idPago:    Date.now(),
            usuarioId: userId,
            monto:     3.00,
            mes:       new Date().getMonth() + 1,
            fecha:     new Date().toISOString()
        };
        appState.pagosPendientes.push(recibo);

        // Guardar también en jaar_pagos (para que el reporte lo vea)
        const pagos = JSON.parse(localStorage.getItem('jaar_pagos') || '[]');
        pagos.push(recibo);
        localStorage.setItem('jaar_pagos', JSON.stringify(pagos));

        savePaymentsLocal();
        showToast("Cobro guardado localmente (Offline)");
        updateUI();
    }
}

function addDemoUser() {
    const newId = Date.now();
    const opciones = [
        { nombre: `Familia Demo ${Math.floor(Math.random()*100)}`, sector: "Sector Nuevo",    mesesSinPagar: 0 },
        { nombre: `Demo Moroso ${Math.floor(Math.random()*100)}`,  sector: "Caballero Abajo", mesesSinPagar: 2 },
        { nombre: `Demo Corte ${Math.floor(Math.random()*100)}`,   sector: "Caballero Arriba",mesesSinPagar: 4 },
    ];
    const o = opciones[Math.floor(Math.random() * opciones.length)];
    appState.usuarios.push({ id: newId, nombre: o.nombre, sector: o.sector, pagadoEsteMes: false, mesesSinPagar: o.mesesSinPagar });
    saveUsersLocal();
    showToast("Vecino de prueba agregado");
    updateUI();
}

function saveUsersLocal()    { localStorage.setItem('jaar_users',             JSON.stringify(appState.usuarios)); }
function savePaymentsLocal() { localStorage.setItem('jaar_pending_payments',  JSON.stringify(appState.pagosPendientes)); }

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
