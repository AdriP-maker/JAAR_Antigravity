document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnRegistrar').addEventListener('click', () => {
        const nombre = document.getElementById('regNombre').value.trim();
        const casa   = document.getElementById('regCasa').value.trim();
        const user   = document.getElementById('regUser').value.trim().toLowerCase();
        const pass   = document.getElementById('regPass').value;
        const rol    = document.getElementById('regRol').value;

        if(!nombre || !casa || !user || !pass) {
            alert('Por favor completa todos los campos.');
            return;
        }
        if(pass.length < 4) {
            alert('La contraseña debe tener al menos 4 caracteres.');
            return;
        }

        // Cargar usuarios existentes
        const usuarios = JSON.parse(localStorage.getItem('jaar_usuarios') || '[]');

        // Verificar duplicados
        if(usuarios.find(u => u.user === user)) {
            alert('Ese nombre de usuario ya existe. Elige otro.');
            return;
        }

        // Agregar nuevo usuario como pendiente
        usuarios.push({ nombre, casa, user, pass, rol, estado: 'pendiente', creado: new Date().toLocaleDateString() });
        localStorage.setItem('jaar_usuarios', JSON.stringify(usuarios));

        alert(`✅ Solicitud enviada exitosamente.\n\nUn administrador verá tu solicitud y aprobará tu cuenta pronto.\n\nTu usuario: ${user}`);
        window.location.href = 'login.html';
    });
});
