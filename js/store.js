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
        
        // Carga semilla histórica (Libro Banco) adaptada para Piloto 2023-2024
        if (!localStorage.getItem('jaar_gastos')) {
            localStorage.setItem('jaar_gastos', JSON.stringify([
                { id: 101, monto: 126.93, desc: "Compra de materiales e insumos de aseo", fecha: "28/12/2023" },
                { id: 102, monto: 596.50, desc: "Pago anual electricidad sistema (bomba)", fecha: "06/01/2024" },
                { id: 103, monto: 80.84, desc: "Tubos PVC, llaves de paso y uniones", fecha: "30/01/2024" },
                { id: 104, monto: 25.90, desc: "Confección de boletos y papelería", fecha: "09/02/2024" },
                { id: 105, monto: 702.50, desc: "Materiales y combustible revisión tuberías", fecha: "25/03/2024" },
                { id: 106, monto: 545.50, desc: "Cemento, pago día de trabajo local", fecha: "22/04/2024" },
                { id: 107, monto: 65.09, desc: "Pegamento y gasolina (daño toma de agua)", fecha: "11/07/2024" },
                { id: 108, monto: 92.25, desc: "Alimentación jornada de limpieza en toma", fecha: "06/08/2024" },
                { id: 109, monto: 38.00, desc: "Tablón, tubos blancos PVC", fecha: "21/10/2024" },
                { id: 110, monto: 22.07, desc: "Jabón, cloro y meriendas", fecha: "26/11/2024" }
            ]));
        }        
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
