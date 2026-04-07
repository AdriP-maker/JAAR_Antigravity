/**
 * js/store.js
 * Controlador global de persistencia de datos y sincronización red
 */

const Store = {
    // Inicializar data semilla
    init() {
        if (!localStorage.getItem('jaar_miembros')) {
            localStorage.setItem('jaar_miembros', JSON.stringify([
                { id: 1, nombre: "Juan Pérez", sector: "Sector Arriba", pagadoEsteMes: false },
                { id: 2, nombre: "María Gómez", sector: "Sector Centro", pagadoEsteMes: true }
            ]));
        }
        if (!localStorage.getItem('jaar_pagos')) localStorage.setItem('jaar_pagos', JSON.stringify([]));
        if (!localStorage.getItem('jaar_jornales')) localStorage.setItem('jaar_jornales', JSON.stringify([]));
        if (!localStorage.getItem('jaar_gastos')) localStorage.setItem('jaar_gastos', JSON.stringify([]));
        
        window.addEventListener('online', this.updateNetwork);
        window.addEventListener('offline', this.updateNetwork);
        setTimeout(this.updateNetwork, 100);
    },

    // Getters
    getMiembros: () => JSON.parse(localStorage.getItem('jaar_miembros') || '[]'),
    getPagos: () => JSON.parse(localStorage.getItem('jaar_pagos') || '[]'),
    getJornales: () => JSON.parse(localStorage.getItem('jaar_jornales') || '[]'),
    getGastos: () => JSON.parse(localStorage.getItem('jaar_gastos') || '[]'),

    // Setters
    saveMiembros: (data) => localStorage.setItem('jaar_miembros', JSON.stringify(data)),
    savePagos: (data) => localStorage.setItem('jaar_pagos', JSON.stringify(data)),
    saveJornales: (data) => localStorage.setItem('jaar_jornales', JSON.stringify(data)),
    saveGastos: (data) => localStorage.setItem('jaar_gastos', JSON.stringify(data)),

    updateNetwork() {
        const badge = document.getElementById('connectionBadge');
        if(!badge) return;
        if (navigator.onLine) {
            badge.textContent = "Conectado";
            badge.className = "badge online";
        } else {
            badge.textContent = "Sin Red";
            badge.className = "badge offline";
        }
    },

    showToast(msg) {
        const toastEl = document.getElementById('toastNotification');
        if(!toastEl) return;
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        setTimeout(() => toastEl.classList.remove('show'), 3000);
    }
};

// Autoarranque
document.addEventListener('DOMContentLoaded', () => Store.init());
