/**
 * js/admin.js - Panel de Administración de Usuarios
 */
document.addEventListener('DOMContentLoaded', () => {

    const getUsuarios = () => JSON.parse(localStorage.getItem('jaar_usuarios') || '[]');
    const saveUsuarios = (u) => localStorage.setItem('jaar_usuarios', JSON.stringify(u));

    const aprobar = (user) => {
        const us = getUsuarios().map(u => u.user === user ? {...u, estado:'activo'} : u);
        saveUsuarios(us);
        renderAll();
    };

    const rechazar = (user) => {
        if(!confirm(`¿Seguro que deseas rechazar la cuenta de "${user}"?`)) return;
        const us = getUsuarios().map(u => u.user === user ? {...u, estado:'rechazado'} : u);
        saveUsuarios(us);
        renderAll();
    };

    const suspender = (user) => {
        const us = getUsuarios().map(u => u.user === user ? {...u, estado:'suspendido'} : u);
        saveUsuarios(us);
        renderAll();
    };

    const resetPass = (user) => {
        const nueva = prompt(`Nueva contraseña para "${user}":`);
        if(!nueva || nueva.length < 4) { alert('Contraseña muy corta (mínimo 4 caracteres)'); return; }
        const us = getUsuarios().map(u => u.user === user ? {...u, pass: nueva} : u);
        saveUsuarios(us);
        alert(`✅ Contraseña de "${user}" actualizada correctamente.`);
    };

    const renderUserRow = (u, actions) => {
        const estadoBadge = `<span class="badge ${u.estado}">${u.estado.toUpperCase()}</span>`;
        const rolBadge = `<span class="rol-badge">${u.rol}</span>`;
        return `
        <div class="user-row">
            <div style="font-size:1.5rem;">${u.rol === 'cobrador' ? '🔑' : u.rol === 'admin' ? '🛡️' : '👤'}</div>
            <div class="info">
                <strong>${u.nombre || u.user} ${rolBadge}</strong>
                <small>@${u.user} · Casa: ${u.casa || '-'} · ${u.creado || ''}</small>
            </div>
            ${estadoBadge}
            <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
                ${actions.includes('aprobar') ? `<button class="btn-sm btn-approve" onclick="Admin.aprobar('${u.user}')">✅ Aprobar</button>` : ''}
                ${actions.includes('rechazar') ? `<button class="btn-sm btn-reject" onclick="Admin.rechazar('${u.user}')">❌ Rechazar</button>` : ''}
                ${actions.includes('suspender') ? `<button class="btn-sm btn-suspend" onclick="Admin.suspender('${u.user}')">⏸ Suspender</button>` : ''}
                ${actions.includes('reset') ? `<button class="btn-sm btn-reset" onclick="Admin.resetPass('${u.user}')">🔑 Reset Clave</button>` : ''}
            </div>
        </div>`;
    };

    const renderAll = () => {
        const todos = getUsuarios();
        const pendientes = todos.filter(u => u.estado === 'pendiente');
        const activos    = todos.filter(u => u.estado === 'activo');
        const inactivos  = todos.filter(u => u.estado === 'rechazado' || u.estado === 'suspendido');

        // Estadísticas
        document.getElementById('estadisticas').innerHTML = `
            <div style="background:white; padding:0.75rem; border-radius:8px; text-align:center; box-shadow:var(--shadow-sm);">
                <div style="font-size:1.5rem; font-weight:700; color:var(--primary);">${activos.length}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">Activos</div>
            </div>
            <div style="background:white; padding:0.75rem; border-radius:8px; text-align:center; box-shadow:var(--shadow-sm);">
                <div style="font-size:1.5rem; font-weight:700; color:#d97706;">${pendientes.length}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">Pendientes</div>
            </div>
            <div style="background:white; padding:0.75rem; border-radius:8px; text-align:center; box-shadow:var(--shadow-sm);">
                <div style="font-size:1.5rem; font-weight:700; color:var(--danger);">${inactivos.length}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">Inactivos</div>
            </div>
        `;

        // Pendientes
        const elP = document.getElementById('listaPendientes');
        elP.innerHTML = pendientes.length === 0
            ? `<div class="empty-state">No hay solicitudes pendientes 🎉</div>`
            : pendientes.map(u => renderUserRow(u, ['aprobar','rechazar'])).join('');

        // Activos
        const elA = document.getElementById('listaActivos');
        elA.innerHTML = activos.length === 0
            ? `<div class="empty-state">No hay usuarios activos aún</div>`
            : activos.map(u => renderUserRow(u, ['suspender','reset'])).join('');

        // Inactivos
        const elI = document.getElementById('listaInactivos');
        elI.innerHTML = inactivos.length === 0
            ? `<div class="empty-state">Sin registros</div>`
            : inactivos.map(u => renderUserRow(u, ['aprobar'])).join('');
    };

    // Exponer métodos
    window.Admin = { aprobar, rechazar, suspender, resetPass };

    renderAll();
});
