/**
 * ConfigPage — JAAR Digital
 * Admin settings for base values and point rules
 */

import { useState, useEffect } from 'react';
import { getConfig, saveConfig } from '../services/db';
import { updateComisionesConfig } from '../services/comisionesService';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './ConfigPage.css';

export default function ConfigPage() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getConfig().then(cfg => {
      setFormData({
        cuotaDiaria: cfg.cuotaDiaria || 3.00,
        multaJornal: cfg.multaJornal || 10.00,
        splitDevs: cfg.splitDevs || 0.60,
        splitCobrador: cfg.splitCobrador || 0.40,
        puntosPorPagoPuntual: cfg.puntosPorPagoPuntual || 10,
        puntosRequeridosDescuento: cfg.puntosRequeridosDescuento || 100,
        descuentoGenerado: cfg.descuentoGenerado || 3.00
      });
    });
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Validar splits
    if (formData.splitDevs + formData.splitCobrador !== 1.0) {
      showToast('La suma de % de Cobrador y Devs debe ser 1 (100%)', { type: 'error' });
      setSaving(false);
      return;
    }

    // Guardar cfg
    await saveConfig(formData);
    // updateComisionesConfig does the same but good to be explicit
    await updateComisionesConfig(formData.splitDevs, formData.splitCobrador);

    showToast('Configuración guardada', { type: 'success' });
    setSaving(false);
  };

  if (!formData) return <div className="p-4">Cargando...</div>;

  return (
    <div className="config-page">
      <div className="config-header">
        <h2>Configuración</h2>
        <p>Ajustes globales y variables del sistema</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="config-grid">
          
          <Card className="config-section">
            <h3>Variables de Pago</h3>
            <Input 
              label="Cuota Base (Mensual B/.)" 
              type="number" step="0.1"
              value={formData.cuotaDiaria}
              onChange={e => handleChange('cuotaDiaria', e.target.value)}
            />
            <Input 
              label="Multa Inasistencia Jornal (B/.)" 
              type="number" step="0.5"
              value={formData.multaJornal}
              onChange={e => handleChange('multaJornal', e.target.value)}
            />
          </Card>

          <Card className="config-section">
            <h3>Reparto de Ganancias</h3>
            <Input 
              label="% Fondo Devs/JAAR (ej. 0.60 para 60%)" 
              type="number" step="0.05" min="0" max="1"
              value={formData.splitDevs}
              onChange={e => handleChange('splitDevs', e.target.value)}
            />
            <Input 
              label="% Cobrador (ej. 0.40 para 40%)" 
              type="number" step="0.05" min="0" max="1"
              value={formData.splitCobrador}
              onChange={e => handleChange('splitCobrador', e.target.value)}
            />
          </Card>

          <Card className="config-section span-full">
            <h3>Reglas de Fidelidad (Puntos)</h3>
            <div className="config-row">
              <Input 
                label="Puntos ganados por pago al día" 
                type="number" step="1"
                value={formData.puntosPorPagoPuntual}
                onChange={e => handleChange('puntosPorPagoPuntual', e.target.value)}
              />
              <Input 
                label="Puntos para canje" 
                type="number" step="10"
                value={formData.puntosRequeridosDescuento}
                onChange={e => handleChange('puntosRequeridosDescuento', e.target.value)}
              />
              <Input 
                label="B/. de Descuento al canjear" 
                type="number" step="0.5"
                value={formData.descuentoGenerado}
                onChange={e => handleChange('descuentoGenerado', e.target.value)}
              />
            </div>
          </Card>

        </div>
        
        <div className="config-actions">
          <Button type="submit" variant="primary" loading={saving} fullWidth>
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
