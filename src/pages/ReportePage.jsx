/**
 * ReportePage — SIMAP Digital
 * Analytics dashboard and export tool
 */

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../services/db';
import { formatMonto, formatFecha } from '../utils/formatters';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './ReportePage.css';

export default function ReportePage() {
  const pagos = useLiveQuery(() => db.pagos.toArray()) || [];
  const gastos = useLiveQuery(() => db.gastos.toArray()) || [];
  const usuarios = useLiveQuery(() => db.usuarios.toArray()) || [];
  
  // Calculate basic metrics
  // Fallback to 3 if monto isn't present
  const totalIngresos = pagos.reduce((sum, p) => sum + (parseFloat(p.monto) || 3), 0);
  const totalEgresos = gastos.reduce((sum, g) => sum + (parseFloat(g.monto) || 0), 0);
  const balanceNeto = totalIngresos - totalEgresos;

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Hoja Ingresos
    const ingresosData = pagos.map(p => ({
      Fecha: formatFecha(p.fecha),
      Detalle: `Pago ${p.tipo || 'Cuota'}`,
      Monto: parseFloat(p.monto) || 3
    }));
    const wsIngresos = XLSX.utils.json_to_sheet(ingresosData);
    
    // Mejorar anchos de columna (Excel)
    wsIngresos['!cols'] = [
      { wch: 15 }, // Fecha
      { wch: 30 }, // Detalle
      { wch: 15 }  // Monto
    ];
    XLSX.utils.book_append_sheet(wb, wsIngresos, "Ingresos");

    // Hoja Egresos
    const egresosData = gastos.map(g => ({
      Fecha: formatFecha(g.fecha),
      Detalle: g.descripcion || 'Gasto',
      Monto: parseFloat(g.monto) || 0
    }));
    const wsEgresos = XLSX.utils.json_to_sheet(egresosData);
    wsEgresos['!cols'] = [
      { wch: 15 }, // Fecha
      { wch: 40 }, // Detalle
      { wch: 15 }  // Monto
    ];
    XLSX.utils.book_append_sheet(wb, wsEgresos, "Egresos");

    XLSX.writeFile(wb, `Reporte_SIMAP_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text("Junta Administradora de Acueducto Rural (SIMAP)", 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Reporte Financiero Oficial`, 14, 28);
    doc.text(`Fecha de Corte: ${new Date().toLocaleDateString()}`, 14, 34);

    // Ingresos Table
    doc.setFontSize(14);
    doc.text("Resumen de Ingresos", 14, 45);
    
    const ingresosBody = pagos.map(p => [
      formatFecha(p.fecha), 
      `Pago ${p.tipo || 'Cuota'}`, 
      `B/. ${formatMonto(parseFloat(p.monto) || 3)}`
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Fecha', 'Detalle', 'Monto']],
      body: ingresosBody,
      theme: 'grid',
      styles: { fontSize: 10 }
    });

    // Egresos Table
    let finalY = doc.lastAutoTable?.finalY || 50 + (ingresosBody.length * 10);
    doc.setFontSize(14);
    doc.text("Resumen de Egresos", 14, finalY + 10);

    const egresosBody = gastos.map(g => [
      formatFecha(g.fecha), 
      g.descripcion || 'Gasto', 
      `B/. ${formatMonto(parseFloat(g.monto) || 0)}`
    ]);

    autoTable(doc, {
      startY: finalY + 15,
      head: [['Fecha', 'Detalle', 'Monto']],
      body: egresosBody,
      theme: 'grid',
      styles: { fontSize: 10 }
    });

    finalY = doc.lastAutoTable?.finalY || finalY + 15 + (egresosBody.length * 10);

    // Resumen
    doc.setFontSize(12);
    doc.text(`Total Ingresos: B/. ${formatMonto(totalIngresos)}`, 14, finalY + 15);
    doc.text(`Total Egresos: B/. ${formatMonto(totalEgresos)}`, 14, finalY + 22);
    doc.setFont(undefined, 'bold');
    doc.text(`Saldo a Favor: B/. ${formatMonto(balanceNeto)}`, 14, finalY + 30);
    
    // Firma
    doc.setFont(undefined, 'normal');
    doc.text("_________________________", 14, finalY + 60);
    doc.text("Firma del Presidente / Tesorero", 14, finalY + 66);

    doc.save(`Reporte_SIMAP_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="reporte-page">
      <div className="reporte-header">
        <h2>Reporte General</h2>
        <p>Métricas financieras de la SIMAP</p>
      </div>

      <div className="metrics-grid">
        <Card className="metric-card metric-income animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <h4>Ingresos (Pagos)</h4>
          <div className="metric-value text-success">+{formatMonto(totalIngresos)}</div>
          <span className="metric-sub">{pagos.length} transacciones registradas</span>
        </Card>

        <Card className="metric-card metric-expense animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h4>Egresos (Gastos)</h4>
          <div className="metric-value text-danger">-{formatMonto(totalEgresos)}</div>
          <span className="metric-sub">{gastos.length} gastos reportados</span>
        </Card>

        <Card className="metric-card metric-net animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h4>Balance Neto</h4>
          <div className={`metric-value ${balanceNeto >= 0 ? 'text-primary' : 'text-danger'}`}>
            {formatMonto(balanceNeto)}
          </div>
          <span className="metric-sub">Capital actual de la junta</span>
        </Card>

        <Card className="metric-card metric-users animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h4>Comunidad</h4>
          <div className="metric-value text-neutral">{usuarios.length}</div>
          <span className="metric-sub">Vecinos registrados en total</span>
        </Card>
      </div>

      <Card className="export-section">
        <h3>Exportar Datos</h3>
        <p>Descarga el historial completo para analizarlo externamente.</p>
        <div className="export-actions">
          <Button variant="danger" onClick={handleExportPDF}>📄 Descargar PDF Oficial</Button>
          <Button variant="primary" onClick={handleExportExcel} style={{background: '#10b981', borderColor: '#10b981'}}>📊 Descargar Excel</Button>
        </div>
      </Card>
    </div>
  );
}
