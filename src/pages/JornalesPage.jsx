/**
 * JornalesPage — JAAR Digital
 * Register and manage community workday attendance
 */

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../services/db';
import { registerJornal, deleteJornal } from '../services/jornalesService';
import { formatFecha, formatMonto } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import './JornalesPage.css';

export default function JornalesPage() {
  const { showToast } = useToast();
  
  const usuarios = useLiveQuery(() => db.usuarios.toArray()) || [];
  const jornales = useLiveQuery(() => db.jornales.orderBy('fecha').reverse().toArray()) || [];

  const [formData, setFormData] = useState({
    miembroId: '',
    fecha: new Date().toISOString().split('T')[0],
    asiste: 'si',
    quien: 'titular',
    suplente_nombre: '',
    suplente_cedula: '',
    multa: 10,
    horas: 4,
  });
  
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.miembroId || !formData.fecha) {
      showToast('Selecciona un vecino y fecha', { type: 'error' });
      return;
    }

    setSubmitting(true);
    const res = await registerJornal(formData);
    
    if (res.success) {
      showToast('Asistencia registrada correctamente', { type: 'success' });
      // Reset defaults but keep the same date
      setFormData({
        miembroId: '',
        fecha: formData.fecha,
        asiste: 'si',
        quien: 'titular',
        suplente_nombre: '',
        suplente_cedula: '',
        multa: 10,
        horas: 4,
      });
    } else {
      showToast(res.error, { type: 'error' });
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      await deleteJornal(id);
      showToast('Registro eliminado', { type: 'success' });
    }
  };

  // Helper to find username
  const getUserName = (id) => {
    const user = usuarios.find(u => String(u.id) === String(id));
    return user ? user.nombre : 'Vecino Desconocido';
  };

  return (
    <div className="jornales-page">
      <div className="jornales-header">
        <h2>Jornadas Comunitarias</h2>
        <p>Control de asistencia y multas</p>
      </div>

      <Card className="jornales-form-card">
        <form onSubmit={handleSubmit} className="jornales-form">
          
          <div className="form-group">
            <label className="form-label">Vecino / Miembro</label>
            <select 
              className="form-select"
              value={formData.miembroId}
              onChange={(e) => handleChange('miembroId', e.target.value)}
            >
              <option value="">-- Seleccionar Vecino --</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>{u.nombre} - {u.sector}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Fecha de Jornada</label>
            <input 
              type="date" 
              className="form-input"
              value={formData.fecha}
              onChange={(e) => handleChange('fecha', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">¿Asistió a la Jornada?</label>
            <select 
              className="form-select"
              value={formData.asiste}
              onChange={(e) => handleChange('asiste', e.target.value)}
            >
              <option value="si">✅ Sí asistió</option>
              <option value="no">❌ No asistió (Multa)</option>
            </select>
          </div>

          {formData.asiste === 'si' && (
            <div className="jornales-panel asiste-panel animate-fade-in-up">
              <div className="form-group">
                <label className="form-label">¿Quién fue?</label>
                <select 
                  className="form-select"
                  value={formData.quien}
                  onChange={(e) => handleChange('quien', e.target.value)}
                >
                  <option value="titular">Titular</option>
                  <option value="sustituto">Sustituto (Familiar/Tercero)</option>
                </select>
              </div>
              
              {formData.quien === 'sustituto' && (
                <div className="sustituto-fields animate-fade-in-up">
                  <div className="form-group">
                    <label className="form-label">Nombre del Suplente</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="Nombre completo"
                      value={formData.suplente_nombre}
                      onChange={(e) => handleChange('suplente_nombre', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cédula del Suplente</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="8-XXX-XXXX"
                      value={formData.suplente_cedula}
                      onChange={(e) => handleChange('suplente_cedula', e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Horas aportadas</label>
                <input 
                  type="number" 
                  className="form-input"
                  min="1" max="12" step="0.5"
                  value={formData.horas}
                  onChange={(e) => handleChange('horas', e.target.value)}
                />
              </div>
            </div>
          )}

          {formData.asiste === 'no' && (
            <div className="jornales-panel no-asiste-panel animate-fade-in-up">
              <div className="form-group">
                <label className="form-label">Multa aplicable (B/.)</label>
                <input 
                  type="number" 
                  className="form-input text-danger"
                  min="0" step="0.5"
                  value={formData.multa}
                  onChange={(e) => handleChange('multa', e.target.value)}
                />
              </div>
              <p className="jornales-note">Esta multa se sumará a la deuda de agua de este vecino.</p>
            </div>
          )}

          <Button type="submit" variant="primary" fullWidth loading={submitting}>
            Registrar Asistencia
          </Button>
        </form>
      </Card>

      <div className="jornales-history">
        <h3>Últimos Registros</h3>
        {jornales.length === 0 ? (
          <EmptyState icon="📝" message="No hay jornadas registradas" />
        ) : (
          <div className="jornales-list">
            {jornales.map(j => (
              <div key={j.id} className="jornal-item">
                <div className="jornal-item-info">
                  <h4>{getUserName(j.miembroId)}</h4>
                  <span className="jornal-date">{formatFecha(j.fecha)}</span>
                  {j.asiste === 'si' ? (
                    <span className="jornal-detail">Asistió ({j.quien}) - {j.horas} Hrs</span>
                  ) : (
                    <span className="jornal-detail error">Faltó a jornada</span>
                  )}
                </div>
                <div className="jornal-item-actions">
                  {j.asiste === 'si' ? (
                    <Badge variant="success">+{j.horas}h</Badge>
                  ) : (
                    <Badge variant="danger">-{formatMonto(j.multa)}</Badge>
                  )}
                  <button className="jornal-delete-btn" onClick={() => handleDelete(j.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
