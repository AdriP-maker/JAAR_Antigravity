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
const usersListEl = document.getElementById('usersList');
const pendingCountEl = document.getElementById('pendingCount');
const connectionBadge = document.getElementById('connectionBadge');
const syncBtn = document.getElementById('syncBtn');
const addDemoUserBtn = document.getElementById('addDemoUserBtn');
const searchInput = document.getElementById('searchInput');
const toastEl = document.getElementById('toastNotification');

// Inicialización
function init() {
    console.log("Iniciando App PWA offline-first...");
    
    // Cargar datos de localStorage
    const savedUsers = localStorage.getItem('jaar_users');
    const savedPayments = localStorage.getItem('jaar_pending_payments');
    
    if (savedUsers) {
        appState.usuarios = JSON.parse(savedUsers);
    } else {
        // Datos mock iniciales si es la primera vez
        appState.usuarios = [
            { id: 1, nombre: "Juan Pérez", sector: "Sector Arriba", pagadoEsteMes: false },
            { id: 2, nombre: "María Gómez", sector: "Sector Centro", pagadoEsteMes: true }
        ];
        saveUsersLocal();
    }

    if (savedPayments) {
        appState.pagosPendientes = JSON.parse(savedPayments);
    }

    // Configurar listeners de red
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();

    // Eventos UI
    syncBtn.addEventListener('click', forceSync);
    addDemoUserBtn.addEventListener('click', addDemoUser);
    searchInput.addEventListener('input', (e) => renderUsers(e.target.value));

    // Render inicial
    updateUI();
}

// ---------------------- LOGICA UI ----------------------

function updateUI() {
    renderUsers(searchInput.value);
    pendingCountEl.textContent = appState.pagosPendientes.length;
    
    if(appState.pagosPendientes.length > 0) {
        pendingCountEl.style.color = "var(--danger)";
    } else {
        pendingCountEl.style.color = "var(--success)";
    }
}

function renderUsers(filterText = '') {
    usersListEl.innerHTML = '';
    
    const filtered = appState.usuarios.filter(u => 
        u.nombre.toLowerCase().includes(filterText.toLowerCase()) || 
        u.sector.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filtered.length === 0) {
        usersListEl.innerHTML = `<div class="empty-state">No se encontraron vecinos.</div>`;
        return;
    }

    filtered.forEach(user => {
        const div = document.createElement('div');
        div.className = 'user-card';
        div.innerHTML = `
            <div class="user-info">
                <h3><span class="status-indicator ${user.pagadoEsteMes ? 'al-dia' : ''}"></span>${user.nombre}</h3>
                <p>📍 ${user.sector}</p>
            </div>
            <button class="btn-pay ${user.pagadoEsteMes ? 'paid' : ''}" 
                    onclick="registrarCobro(${user.id})" 
                    ${user.pagadoEsteMes ? 'disabled' : ''}>
                ${user.pagadoEsteMes ? 'Pagado' : 'Cobrar $5.00'}
            </button>
        `;
        usersListEl.appendChild(div);
    });
}

function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3000);
}

function updateNetworkStatus() {
    appState.isOnline = navigator.onLine;
    if (appState.isOnline) {
        connectionBadge.textContent = "Conectado";
        connectionBadge.className = "badge online";
        // Auto-sync opcional cuando vuelve la red:
        // if(appState.pagosPendientes.length > 0) forceSync(); 
    } else {
        connectionBadge.textContent = "Sin Conexión";
        connectionBadge.className = "badge offline";
    }
}

// ---------------------- CORE (OFFLINE-FIRST) ----------------------

function registrarCobro(userId) {
    const userIndex = appState.usuarios.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        // 1. Marcar como pagado localmente
        appState.usuarios[userIndex].pagadoEsteMes = true;
        saveUsersLocal();

        // 2. Crear registro de pago offline-first
        const recibo = {
            idPago: Date.now(),
            usuarioId: userId,
            monto: 5.00,
            fecha: new Date().toISOString()
        };
        appState.pagosPendientes.push(recibo);
        savePaymentsLocal();

        showToast("Cobro guardado localmente (Offline)");
        updateUI();
    }
}

function addDemoUser() {
    const newId = Date.now();
    appState.usuarios.push({
        id: newId,
        nombre: `Familia Demo ${Math.floor(Math.random()*100)}`,
        sector: "Sector Nuevo",
        pagadoEsteMes: false
    });
    saveUsersLocal();
    showToast("Vecino de prueba agregado");
    updateUI();
}

// Persistencia en LocalStorage (Mock de IndexedDB/SQLite)
function saveUsersLocal() { localStorage.setItem('jaar_users', JSON.stringify(appState.usuarios)); }
function savePaymentsLocal() { localStorage.setItem('jaar_pending_payments', JSON.stringify(appState.pagosPendientes)); }

// Simulación de interacción con Supabase
async function forceSync() {
    if (appState.pagosPendientes.length === 0) {
        showToast("Todo está al día.");
        return;
    }
    
    if (!appState.isOnline) {
        showToast("No hay internet para sincronizar.");
        return;
    }

    syncBtn.classList.add('loading');
    syncBtn.innerHTML = `<span class="icon">⏳</span><span class="sync-text">Conectando...</span>`;

    // Simulamos latencia de red hacia Supabase
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Vaciamos cola (simulando exito 200 OK del backend)
    const subidos = appState.pagosPendientes.length;
    appState.pagosPendientes = [];
    savePaymentsLocal();

    showToast(`¡${subidos} cobros subidos a la nube con éxito!`);
    
    syncBtn.classList.remove('loading');
    syncBtn.innerHTML = `<span class="icon">☁️</span><span class="sync-text">Sincronizar</span>`;
    updateUI();
}

// Arrancar motor
init();
