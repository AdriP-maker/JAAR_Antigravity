document.addEventListener('DOMContentLoaded', () => {
    const listEl = document.getElementById('forosList');

    // Modificaremos dinamicamente Store para soportar 'foros' si no existe
    if (!localStorage.getItem('jaar_foros')) {
        localStorage.setItem('jaar_foros', JSON.stringify([]));
    }

    // Validar Rol
    const rol = localStorage.getItem('jaar_role');
    if(rol === 'cliente') {
        const adminSection = document.querySelector('.action-section');
        if(adminSection) adminSection.style.display = 'none';
    }

    const renderList = () => {
        const foros = JSON.parse(localStorage.getItem('jaar_foros') || '[]');
        listEl.innerHTML = '';
        if(foros.length === 0){
            listEl.innerHTML = `<div class="empty-state">No hay mensajes recientes en el foro</div>`;
            return;
        }
        
        foros.slice().reverse().forEach(f => {
            const card = document.createElement('div');
            card.className = `mensaje-card ${f.urgente ? 'urgente' : ''}`;
            card.innerHTML = `
                <div class="mensaje-autor">${f.autor} &bull; ${f.fecha}</div>
                <div class="mensaje-texto">${f.mensaje}</div>
            `;
            listEl.appendChild(card);
        });
    };

    document.getElementById('btnPublicarForo').addEventListener('click', () => {
        const autor = document.getElementById('foroAutor').value || 'Anónimo';
        const mensaje = document.getElementById('foroMensaje').value;
        const urgente = document.getElementById('foroUrgente').checked;
        
        if(!mensaje) return alert("El mensaje no puede estar vacío");

        const foros = JSON.parse(localStorage.getItem('jaar_foros') || '[]');
        foros.push({
            id: Date.now(),
            autor,
            mensaje,
            urgente,
            fecha: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        });
        
        localStorage.setItem('jaar_foros', JSON.stringify(foros));
        
        document.getElementById('foroMensaje').value = '';
        document.getElementById('foroUrgente').checked = false;
        Store.showToast("Anuncio Publicado");
        renderList();
    });

    renderList();
});
