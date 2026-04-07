document.addEventListener('DOMContentLoaded', () => {
    const listEl = document.getElementById('jornalesList');
    const selectEl = document.getElementById('jornalVecino');
    
    // Poblar Selector
    const miembros = Store.getMiembros();
    miembros.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.nombre;
        selectEl.appendChild(opt);
    });

    // Alternar paneles de asistencia
    const asistenciaSelect = document.getElementById('jornalAsistencia');
    const panelAsiste = document.getElementById('panelAsiste');
    const panelNoAsiste = document.getElementById('panelNoAsiste');
    
    const quienSelect = document.getElementById('jornalQuien');
    const grupoSustituto = document.getElementById('grupoSustituto');

    asistenciaSelect.addEventListener('change', (e) => {
        if(e.target.value === 'si'){
            panelAsiste.style.display = 'block';
            panelNoAsiste.style.display = 'none';
        } else {
            panelAsiste.style.display = 'none';
            panelNoAsiste.style.display = 'block';
        }
    });

    quienSelect.addEventListener('change', (e) => {
        if(e.target.value === 'sustituto') grupoSustituto.style.display = 'block';
        else grupoSustituto.style.display = 'none';
    });

    // Cargar Historial
    const renderList = () => {
        const jornales = Store.getJornales();
        listEl.innerHTML = '';
        if(jornales.length === 0){
            listEl.innerHTML = `<div class="empty-state">No hay jornales registrados</div>`;
            return;
        }
        
        jornales.slice().reverse().forEach(j => {
            const m = miembros.find(mim => mim.id.toString() === j.miembroId.toString());
            const nombre = m ? m.nombre : 'Desconocido';
            
            let statusHtml = '';
            if(j.asiste === 'si'){
                let txt = 'Personal';
                if(j.quien === 'sustituto') txt = `Sustituto: ${j.nSustituto || 'Sin nombre'}`;
                statusHtml = `<div style="font-weight:bold; color:var(--primary);">${j.horas} Hrs <small>(${txt})</small></div>`;
            } else {
                statusHtml = `<div style="font-weight:bold; color:var(--danger);">Faltó (-$${j.multa})</div>`;
            }

            const card = document.createElement('div');
            card.className = 'user-card';
            card.innerHTML = `
                <div class="user-info">
                    <h3>${nombre}</h3>
                    <p>${j.tarea} (${j.fecha})</p>
                </div>
                ${statusHtml}
            `;
            listEl.appendChild(card);
        });
    };

    // Guardar
    document.getElementById('btnGuardarJornal').addEventListener('click', () => {
        const tarea = document.getElementById('jornalTarea').value;
        const asiste = asistenciaSelect.value;
        
        let horas = 0;
        let quien = '';
        let nSustituto = '';
        let multa = 0;

        if(!tarea) return alert("Escribe la tarea realizada o asignada.");

        if(asiste === 'si'){
            horas = document.getElementById('jornalHoras').value;
            quien = quienSelect.value;
            if(quien === 'sustituto') {
                nSustituto = document.getElementById('jornalNombreSustituto').value;
                if(!nSustituto) return alert("Por favor indica el nombre del sustituto.");
            }
            if(!horas) return alert("Completa las horas.");
        } else {
            multa = document.getElementById('jornalMulta').value;
            if(!multa) return alert("Agrega el monto de la multa.");
        }

        const jornales = Store.getJornales();
        jornales.push({
            id: Date.now(),
            miembroId: selectEl.value,
            tarea,
            asiste,
            horas,
            quien,
            nSustituto,
            multa,
            fecha: new Date().toLocaleDateString()
        });
        Store.saveJornales(jornales);
        
        document.getElementById('jornalTarea').value = '';
        document.getElementById('jornalHoras').value = '';
        document.getElementById('jornalNombreSustituto').value = '';
        Store.showToast(asiste === 'si' ? "Jornal registrado" : "Inasistencia y Multa registradas");
        renderList();
    });

    renderList();
});
