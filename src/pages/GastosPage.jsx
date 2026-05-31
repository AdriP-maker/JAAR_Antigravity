/**
 * GastosPage — JAAR Digital
 * Tracker for community expenses and repairs
 */

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../services/db';
import { addGasto } from '../services/gastosService';
import { formatMonto, formatFecha } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import './GastosPage.css';

export default function GastosPage() {
  const { showToast } = useToast();
  
  const gastos = useLiveQuery(() => db.gastos.orderBy('fecha').reverse().toArray()) || [];
  const total = gastos.reduce((sum, g) => sum + (parseFloat(g.monto) || 0), 0);

  const [formData, setFormData] = useState({ monto: '', desc: '', fecha: new Date().toISOString().split('T')[0] });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.monto || !formData.desc || !formData.fecha) {
      showToast('Por favor completa todos los campos', { type: 'error' });
      return;
    }

    setSubmitting(true);
    const res = await addGasto(formData);
    
    if (res.success) {
      showToast('Gasto registrado con éxito', { type: 'success' });
      setFormData({ monto: '', desc: '', fecha: new Date().toISOString().split('T')[0] });
    } else {
      showToast(res.error, { type: 'error' });
    }
    setSubmitting(false);
  };

  return (
    <div className="gastos-page">
      <div className="gastos-header">
        <h2>Registro de Gastos</h2>
      </div>

      <Card className="gastos-summary-card">
        <span className="gastos-summary-label">Total Gastos Acumulados</span>
        <div className="gastos-summary-total">{formatMonto(total)}</div>
      </Card>

      <Card className="gastos-form-card">
        <h3>Añadir Nuevo Gasto</h3>
        <form onSubmit={handleSubmit} className="gastos-form">
          <Input 
            id="desc" 
            label="Descripción / Motivo" 
            placeholder="Ej: Reparación de tubería principal" 
            value={formData.desc}
            onChange={handleChange}
          />
          <div className="gastos-form-row">
            <Input 
              id="monto" 
              type="number"
              step="0.01"
              label="Monto (B/.)" 
              placeholder="0.00" 
              value={formData.monto}
              onChange={handleChange}
            />
            <Input 
              id="fecha" 
              type="date"
              label="Fecha" 
              value={formData.fecha}
              onChange={handleChange}
            />
          </div>
          <Button type="submit" variant="danger" fullWidth loading={submitting}>
            Registrar Salida de Dinero
          </Button>
        </form>
      </Card>

      <div className="gastos-history">
        <h3>Historial de Gastos</h3>
        {gastos.length === 0 ? (
          <EmptyState icon="💸" message="No hay gastos registrados aún" />
        ) : (
          <div className="gastos-list">
            {gastos.map((g, i) => (
              <div key={g.id || i} className="gasto-item animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                <div className="gasto-info">
                  <h4>{g.desc}</h4>
                  <span>{formatFecha(g.fecha)}</span>
                </div>
                <div className="gasto-amount">-{formatMonto(g.monto)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
