/**
 * js/reporte.js - Generación dinámica de reportes con filtros y exportación dual (PDF + Excel)
 */
document.addEventListener('DOMContentLoaded', () => {

    // ──────────────────────────────
    // Utilidades de fecha
    // ──────────────────────────────
    const parseFecha = (fechaStr) => {
        // Soporte para "DD/MM/YYYY" y "MM/DD/YYYY" según configuración local
        if(!fechaStr) return null;
        const parts = fechaStr.split('/');
        if(parts.length === 3) {
            // Intentar "DD/MM/AAAA" (estilo Panamá)
            return new Date(`${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`);
        }
        return new Date(fechaStr);
    };

    const enRango = (fechaStr, desde, hasta) => {
        if(!desde && !hasta) return true;
        const f = parseFecha(fechaStr);
        if(!f || isNaN(f)) return true; // si no parsea, incluir
        if(desde) {
            const d = new Date(desde + '-01');
            if(f < d) return false;
        }
        if(hasta) {
            const parts = hasta.split('-');
            const h = new Date(parseInt(parts[0]), parseInt(parts[1]), 0); // último día del mes
            if(f > h) return false;
        }
        return true;
    };

    // ──────────────────────────────
    // Datos de estado global del reporte
    // ──────────────────────────────
    let cache = { ingresos:[], egresos:[], jornalesData:[], totalIn:0, totalOut:0 };

    // ──────────────────────────────
    // Función principal de generación
    // ──────────────────────────────
    const generarReporte = () => {
        const desde = document.getElementById('filtroDesde').value;
        const hasta = document.getElementById('filtroHasta').value;
        const mostrarIn = document.getElementById('chkIngresos').checked;
        const mostrarOut = document.getElementById('chkEgresos').checked;
        const mostrarJor= document.getElementById('chkJornales').checked;

        document.getElementById('secIngresos').style.display = mostrarIn  ? 'block' : 'none';
        document.getElementById('secEgresos' ).style.display = mostrarOut ? 'block' : 'none';
        document.getElementById('secJornales').style.display = mostrarJor ? 'block' : 'none';

        const usuarios = Store.getMiembros();
        const pagos    = Store.getPagos();
        const gastos   = Store.getGastos();
        const jornales = Store.getJornales();

        // ── INGRESOS ──
        let totalIn = 0;
        const ingresos = [];

        const pagados = usuarios.filter(u => u.pagadoEsteMes);
        if(pagados.length > 0) {
            const sum = pagados.length * 3.00; // Ajustado al Piloto Caballero ($1.00 Agua + $1.00 Tanque + $1.00 Puerco)
            totalIn += sum;
            ingresos.push({ desc:`Cuotas Vecinales (${pagados.length} casas)`, fecha:'Período actual', monto:sum });
        }
        pagos.filter(p => enRango(p.fecha, desde, hasta)).forEach(p => {
            totalIn += parseFloat(p.monto||0);
            ingresos.push({ desc:`Recaudo Offline`, fecha:p.fecha||'-', monto:parseFloat(p.monto||0) });
        });
        cache.ingresos = ingresos;
        cache.totalIn = totalIn;

        const tbIn = document.getElementById('tablaIngresos');
        tbIn.innerHTML = ingresos.length === 0
            ? `<tr><td colspan="3" style="text-align:center; color:var(--text-muted);">Sin ingresos en el período</td></tr>`
            : ingresos.map(i=>`<tr><td>${i.desc}</td><td>${i.fecha}</td><td style="text-align:right;">$${i.monto.toFixed(2)}</td></tr>`).join('');
        document.getElementById('tIngresos').textContent = `$${totalIn.toFixed(2)}`;

        // ── EGRESOS ──
        let totalOut = 0;
        const egresosF = gastos.filter(g => enRango(g.fecha, desde, hasta));
        cache.egresos = egresosF;

        const tbOut = document.getElementById('tablaEgresos');
        if(egresosF.length === 0){
            tbOut.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted);">Sin egresos en el período</td></tr>`;
        } else {
            tbOut.innerHTML = egresosF.map(g => {
                const val = parseFloat(g.monto||0);
                totalOut += val;
                return `<tr><td>${g.desc}</td><td>${g.fecha}</td><td style="text-align:right; color:var(--danger);">-$${val.toFixed(2)}</td></tr>`;
            }).join('');
        }
        cache.totalOut = totalOut;
        document.getElementById('tEgresos').textContent = `-$${totalOut.toFixed(2)}`;

        // ── JORNALES ──
        const jornalesF = jornales.filter(j => enRango(j.fecha, desde, hasta));
        cache.jornalesData = jornalesF;

        const tbJor = document.getElementById('tablaJornales');
        if(jornalesF.length === 0){
            tbJor.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted);">Sin jornales en el período</td></tr>`;
        } else {
            tbJor.innerHTML = jornalesF.map(j => {
                const m = usuarios.find(u => u.id.toString() === j.miembroId.toString());
                const nombre = m ? m.nombre : 'Desconocido';
                const detalle = j.asiste === 'si'
                    ? `<span style="color:var(--primary); font-weight:600;">${j.horas} Hrs</span>`
                    : `<span style="color:var(--danger); font-weight:600;">Multa: -$${j.multa}</span>`;
                return `<tr><td>${nombre}</td><td>${j.tarea||'-'}</td><td style="text-align:right;">${detalle}</td></tr>`;
            }).join('');
        }

        // ── SALDO ──
        const saldo = totalIn - totalOut;
        const el = document.getElementById('saldoNeto');
        el.textContent = `$${saldo.toFixed(2)}`;
        el.style.color = saldo >= 0 ? 'var(--primary-dark)' : 'var(--danger)';
    };

    // ──────────────────────────────
    // Exportar Excel con SheetJS
    // ──────────────────────────────
    const exportarExcel = () => {
        if(typeof XLSX === 'undefined') { alert('La librería de Excel no está disponible.'); return; }

        const wb = XLSX.utils.book_new();

        // Hoja 1: Ingresos
        const inRows = [['Concepto','Fecha','Monto (USD)']];
        cache.ingresos.forEach(i => inRows.push([i.desc, i.fecha, i.monto]));
        inRows.push(['','TOTAL INGRESOS', cache.totalIn]);
        const wsIn = XLSX.utils.aoa_to_sheet(inRows);
        XLSX.utils.book_append_sheet(wb, wsIn, 'Ingresos');

        // Hoja 2: Egresos
        const outRows = [['Concepto','Fecha','Monto (USD)']];
        cache.egresos.forEach(g => outRows.push([g.desc, g.fecha, parseFloat(g.monto||0)]));
        outRows.push(['','TOTAL EGRESOS', cache.totalOut]);
        const wsOut = XLSX.utils.aoa_to_sheet(outRows);
        XLSX.utils.book_append_sheet(wb, wsOut, 'Egresos');

        // Hoja 3: Jornales
        const jorRows = [['Vecino','Tarea','Asistencia','Horas','Multa ($)']];
        const miembros = Store.getMiembros();
        cache.jornalesData.forEach(j => {
            const m = miembros.find(u => u.id.toString() === j.miembroId.toString());
            jorRows.push([
                m ? m.nombre : 'Desconocido',
                j.tarea||'-',
                j.asiste === 'si' ? 'Asistió' : 'No asistió',
                j.asiste === 'si' ? j.horas : 0,
                j.asiste !== 'si' ? j.multa : 0
            ]);
        });
        const wsJor = XLSX.utils.aoa_to_sheet(jorRows);
        XLSX.utils.book_append_sheet(wb, wsJor, 'Jornales');

        // Hoja 4: Resumen
        const resRows = [
            ['REPORTE FINANCIERO JAAR'],
            ['Generado:', new Date().toLocaleDateString()],
            [],
            ['Concepto', 'Monto (USD)'],
            ['Total Ingresos', cache.totalIn],
            ['Total Egresos',  cache.totalOut],
            ['SALDO NETO',     cache.totalIn - cache.totalOut],
        ];
        const wsRes = XLSX.utils.aoa_to_sheet(resRows);
        XLSX.utils.book_append_sheet(wb, wsRes, 'Resumen');

        XLSX.writeFile(wb, `Reporte_JAAR_${new Date().toISOString().slice(0,10)}.xlsx`);
    };

    // ──────────────────────────────
    // Event Listeners
    // ──────────────────────────────
    document.getElementById('btnAplicar').addEventListener('click', generarReporte);
    document.getElementById('btnPdf').addEventListener('click', () => window.print());
    document.getElementById('btnExcel').addEventListener('click', exportarExcel);

    // Carga inicial
    generarReporte();
});
