document.addEventListener('DOMContentLoaded', () => {
    const listEl = document.getElementById('gastosList');
    
    const renderList = () => {
        const gastos = Store.getGastos();
        listEl.innerHTML = '';
        if(gastos.length === 0){
            listEl.innerHTML = `<div class="empty-state">No hay gastos ingresados</div>`;
            return;
        }
        
        gastos.slice().reverse().forEach(g => {
            const card = document.createElement('div');
            card.className = 'user-card';
            card.innerHTML = `
                <div class="user-info">
                    <h3 style="color:var(--text-main); font-size:0.95rem;">${g.desc}</h3>
                    <p>${g.fecha}</p>
                </div>
                <div style="font-weight:bold; color:var(--danger);">-$${parseFloat(g.monto).toFixed(2)}</div>
            `;
            listEl.appendChild(card);
        });
    };

    document.getElementById('btnGuardarGasto').addEventListener('click', () => {
        const monto = document.getElementById('gastoMonto').value;
        const desc = document.getElementById('gastoDesc').value;
        if(!monto || !desc) return alert("Completa los datos");

        const gastos = Store.getGastos();
        gastos.push({
            id: Date.now(),
            monto,
            desc,
            fecha: new Date().toLocaleDateString()
        });
        Store.saveGastos(gastos);
        
        document.getElementById('gastoMonto').value = '';
        document.getElementById('gastoDesc').value = '';
        Store.showToast("Gasto guardado offline");
        renderList();
    });

    renderList();
});
