/**
 * js/auth.js - Controlador de Sesión, Seguridad (RBAC) y Usuarios Dinámicos
 */

const Auth = {

    // Usuarios del sistema (mock inicial + usuarios dinámicos de localStorage)
    _getUsuarios() {
        const almacenados = JSON.parse(localStorage.getItem('jaar_usuarios') || '[]');
        // Cuentas de sistema (siempre activas — el admin maestro no puede borrarse)
        const sistema = [
            { user:'admin',    pass:'admin123', rol:'admin',    nombre:'Administrador',  estado:'activo' },
            { user:'cobrador', pass:'1234',     rol:'cobrador', nombre:'Cobrador Demo',  estado:'activo' },
            { user:'minsa',    pass:'1234',     rol:'minsa',    nombre:'Inspector MINSA',estado:'activo' },
            { user:'cliente',  pass:'1234',     rol:'cliente',  nombre:'Cliente Demo',   estado:'activo' },
        ];
        return [...sistema, ...almacenados];
    },

    login() {
        const u = document.getElementById('loginUser').value.trim().toLowerCase();
        const p = document.getElementById('loginPass').value;

        const todos = Auth._getUsuarios();
        const user = todos.find(x => x.user === u && x.pass === p);

        if(!user) { Auth._shake(); alert('Usuario o contraseña incorrectos.'); return; }
        if(user.estado === 'pendiente') { alert('⏳ Tu cuenta aún no ha sido aprobada por el administrador. Por favor espera.'); return; }
        if(user.estado === 'rechazado') { alert('❌ Tu solicitud fue rechazada. Contacta al administrador.'); return; }
        if(user.estado === 'suspendido') { alert('⚠️ Tu cuenta ha sido suspendida. Contacta al administrador.'); return; }

        localStorage.setItem('jaar_role', user.rol);
        localStorage.setItem('jaar_username', user.user);
        localStorage.setItem('jaar_nombre', user.nombre || user.user);

        const redirects = { admin:'admin.html', cobrador:'index.html', minsa:'reporte.html', cliente:'historial.html' };
        window.location.href = redirects[user.rol] || 'login.html';
    },

    logout() {
        localStorage.removeItem('jaar_role');
        localStorage.removeItem('jaar_username');
        localStorage.removeItem('jaar_nombre');
        window.location.href = 'login.html';
    },

    // Recuperar contraseña: busca al usuario x nombre de casa
    recover() {
        const casa = document.getElementById('recoverCasa').value.trim();
        if(!casa) { alert('Ingresa tu número de casa.'); return; }
        const todos = Auth._getUsuarios();
        const user = todos.find(u => u.casa && u.casa.toLowerCase() === casa.toLowerCase());
        if(!user) {
            document.getElementById('recoverResult').innerHTML = `<span style="color:var(--danger);">❌ No se encontró ninguna cuenta con ese número de casa.</span>`;
            return;
        }
        // En producción real esto sería un email. Aquí mostramos para el piloto.
        document.getElementById('recoverResult').innerHTML = `
            <div style="background:#f0fdf4; padding:1rem; border-radius:8px; border:1px solid #86efac; margin-top:1rem;">
                ✅ Cuenta encontrada.<br>
                <strong>Usuario:</strong> ${user.user}<br>
                <small>Contacta al administrador con tu número de casa para que te reestablezcan la contraseña.</small>
            </div>`;
    },

    guard() {
        const role = localStorage.getItem('jaar_role');
        if(!role) { window.location.href = 'login.html'; return null; }

        const path = window.location.pathname;
        if(role === 'minsa' && !path.includes('reporte.html')) { window.location.href = 'reporte.html'; return null; }
        if(role === 'cliente' && (path.includes('index.html') || path.includes('gastos.html') || path.includes('jornales.html') || path.includes('reporte.html') || path.includes('admin.html'))) {
            window.location.href = 'historial.html'; return null;
        }
        if(role !== 'admin' && path.includes('admin.html')) { window.location.href = 'login.html'; return null; }
        if(role === 'admin' && !path.includes('admin.html')) { window.location.href = 'admin.html'; return null; }

        return role;
    },

    renderNav(role) {
        const nav = document.querySelector('.bottom-nav');
        if(!nav) return;
        const path = window.location.pathname;
        const a = (p) => path.includes(p) ? 'active' : '';
        let html = '';

        if(role === 'cobrador') {
            html = `
            <a href="index.html"    class="nav-item ${a('index.html')}"><span class="icon">💧</span><span>Cobros</span></a>
            <a href="jornales.html" class="nav-item ${a('jornales.html')}"><span class="icon">⛏️</span><span>Jornales</span></a>
            <a href="gastos.html"   class="nav-item ${a('gastos.html')}"><span class="icon">🧾</span><span>Gastos</span></a>
            <a href="foro.html"     class="nav-item ${a('foro.html')}"><span class="icon">💬</span><span>Foro</span></a>
            <a href="reporte.html"  class="nav-item ${a('reporte.html')}"><span class="icon">📊</span><span>MINSA</span></a>`;
        } else if(role === 'cliente') {
            html = `
            <a href="historial.html" class="nav-item ${a('historial.html')}"><span class="icon">👤</span><span>Mi Cuenta</span></a>
            <a href="foro.html"      class="nav-item ${a('foro.html')}"><span class="icon">💬</span><span>Avisos</span></a>`;
        } else if(role === 'minsa') {
            html = `<a href="reporte.html" class="nav-item active"><span class="icon">📊</span><span>Reportes</span></a>`;
        } else if(role === 'admin') {
            html = `<a href="admin.html" class="nav-item active"><span class="icon">🛡️</span><span>Usuarios</span></a>`;
        }

        html += `<a href="#" onclick="Auth.logout()" class="nav-item"><span class="icon">🚪</span><span>Salir</span></a>`;
        nav.innerHTML = html;
    },

    _shake() {
        const btn = document.getElementById('btnLogin');
        if(!btn) return;
        btn.style.animation = 'shake 0.3s ease';
        setTimeout(() => btn.style.animation = '', 300);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btnLogin');
    const btnRecover = document.getElementById('btnRecover');

    if(btn) {
        btn.addEventListener('click', Auth.login);
        document.addEventListener('keydown', (e) => { if(e.key === 'Enter') Auth.login(); });
    }

    if(btnRecover) btnRecover.addEventListener('click', Auth.recover);

    if(!btn) {
        const role = Auth.guard();
        if(role) Auth.renderNav(role);
    }
});
