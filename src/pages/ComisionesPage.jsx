/**
 * ComisionesPage — SIMAP Digital
 * Track the split between collectors and the board/devs
 */

import { useState, useEffect } from 'react';
import { calculateComisiones } from '../services/comisionesService';
import { formatMonto } from '../utils/formatters';
import Card from '../components/ui/Card';
import './ComisionesPage.css';

export default function ComisionesPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    calculateComisiones().then(setData);
  }, []);

  if (!data) return <div className="p-4">Cargando...</div>;

  return (
    <div className="comisiones-page">
      <div className="comisiones-header">
        <h2>Distribución de Ganancias</h2>
        <p>Recaudación total dividida según la configuración de la SIMAP</p>
      </div>

      <div className="comisiones-grid">
        <Card className="comisiones-card total-card">
          <h4>Recaudación Total</h4>
          <div className="amount">{formatMonto(data.totalRecaudado)}</div>
          <span>De {data.pagosCount} pagos procesados</span>
        </Card>

        <div className="splits-container">
          <Card className="comisiones-card split-cobrador animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <div className="split-header">
              <h4>Cobrador</h4>
              <span className="split-badge">{Math.round(data.config.splitCobrador * 100)}%</span>
            </div>
            <div className="amount">{formatMonto(data.cobradorShare)}</div>
            <p>Comisión acumulada por gestión de cobro</p>
          </Card>

          <Card className="comisiones-card split-devs animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="split-header">
              <h4>Fondo SIMAP / Devs</h4>
              <span className="split-badge">{Math.round(data.config.splitDevs * 100)}%</span>
            </div>
            <div className="amount">{formatMonto(data.devShare)}</div>
            <p>Fondo de mantenimiento y desarrollo</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
