/**
 * CobroModal — JAAR Digital
 * Payment modal with tabs for different payment types
 */

import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useToast } from '../../context/ToastContext';
import { registrarPago, getResumenUsuario, getPaymentConfig } from '../../services/pagosService';
import { obtenerSaldoPuntos, canjearPuntos, calcularDescuentoBalboas } from '../../services/puntosService';
import { formatMonto, redondear } from '../../utils/formatters';
import { generateFileHash } from '../../utils/crypto';
import db from '../../services/db';
import './CobroModal.css';

const TIPOS = [
  { key: 'mensual', label: 'Mensual', sub: 'B/.3.00' },
  { key: 'diario', label: 'Diario', sub: 'B/.0.10' },
  { key: 'multi_mes', label: 'Varios', sub: 'Meses' },
  { key: 'parcial', label: 'Pago', sub: 'Parcial' },
  { key: 'puesta_al_dia', label: 'Poner', sub: 'al Día' },
];

export default function CobroModal({ isOpen, onClose, user, onPagoComplete }) {
  const { showToast } = useToast();
  const [tipo, setTipo] = useState('mensual');
  const [config, setConfig] = useState({ cuotaMensual: 3.00 });
  const [resumen, setResumen] = useState(null);
  const [dias, setDias] = useState(1);
  const [meses, setMeses] = useState(2);
  const [parcial, setParcial] = useState(1.50);
  const [nota, setNota] = useState('');
  const [file, setFile] = useState(null);
  const [montoFinal, setMontoFinal] = useState(3.00);
  const [submitting, setSubmitting] = useState(false);
  const [puntos, setPuntos] = useState(0);
  const [usarPuntos, setUsarPuntos] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setTipo('mensual');
      setNota('');
      setFile(null);
      setDias(1);
      setMeses(2);
      setParcial(1.50);
      setUsarPuntos(false);
      loadData();
    }
  }, [isOpen, user]);

  useEffect(() => {
    recalcularMonto();
  }, [tipo, dias, meses, parcial, config, resumen]);

  const loadData = async () => {
    const cfg = await getPaymentConfig();
    setConfig(cfg);
    if (user) {
      const res = await getResumenUsuario(user.id);
      setResumen(res);
      const saldoPuntos = await obtenerSaldoPuntos(user.id);
      setPuntos(saldoPuntos);
    }
  };

  const recalcularMonto = () => {
    const cuota = config.cuotaMensual || 3.00;
    let monto = cuota;

    if (tipo === 'mensual') monto = cuota;
    else if (tipo === 'diario') monto = redondear((cuota / 30) * dias);
    else if (tipo === 'multi_mes') monto = redondear(cuota * meses);
    else if (tipo === 'parcial') monto = redondear(parcial);
    else if (tipo === 'puesta_al_dia') monto = resumen?.deuda || cuota;

    if (usarPuntos && puntos > 0) {
      const descuento = calcularDescuentoBalboas(puntos);
      monto = Math.max(0, redondear(monto - descuento));
    }

    setMontoFinal(monto);
  };

  const handleConfirmar = async () => {
    if (!user || montoFinal <= 0) return;
    setSubmitting(true);

    try {
      // Procesar archivo si existe
      let archivoRef = null;
      if (file) {
        try {
          const hash = await generateFileHash(file);
          const reader = new FileReader();
          
          await new Promise((resolve, reject) => {
            reader.onload = async (e) => {
              const fileId = await db.archivos.add({
                nombre: file.name,
                tipo: file.type,
                tamano: file.size,
                hash,
                data: e.target.result,
                subidoPor: 'admin_global', // o usuario en sesion
                fechaSubida: new Date().toISOString()
              });
              archivoRef = fileId;
              resolve();
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
          });
        } catch (e) {
          console.error("Error guardando archivo", e);
          showToast('Error procesando el archivo, pago se guardó sin recibo', { type: 'warning' });
        }
      }

      await registrarPago(user.id, {
        tipo,
        monto: montoFinal,
        nota: archivoRef ? `${nota} (Archivo: ${file.name})` : nota,
      });

      if (usarPuntos && puntos > 0) {
        await canjearPuntos(user.id, puntos, 'Descuento aplicado en cobro');
      }

      showToast(`Cobro de ${formatMonto(montoFinal)} registrado ✅`, { type: 'success' });
      onPagoComplete?.();
      onClose();
    } catch (err) {
      showToast('Error al registrar cobro', { type: 'error' });
      console.error(err);
    }

    setSubmitting(false);
  };

  if (!user) return null;

  const cuota = config.cuotaMensual || 3.00;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="💰 Registrar Cobro">
      {/* User info */}
      <div className="cobro-user-info">
        <strong>{user.nombre}</strong>
        <span className="cobro-user-sector">{user.sector}</span>
        {resumen && resumen.deuda > 0 && (
          <div className="cobro-deuda-status">
            Debe {resumen.mesesDeuda} mes{resumen.mesesDeuda > 1 ? 'es' : ''} ({formatMonto(resumen.deuda)})
          </div>
        )}
        {resumen && resumen.deuda <= 0 && (
          <div className="cobro-ok-status">Al día ✅</div>
        )}
      </div>

      {/* Payment type tabs */}
      <div className="cobro-tabs">
        {TIPOS.map(t => (
          <button
            key={t.key}
            className={`cobro-tab ${tipo === t.key ? 'cobro-tab-active' : ''}`}
            onClick={() => setTipo(t.key)}
          >
            {t.label}<br /><small>{t.sub}</small>
          </button>
        ))}
      </div>

      {/* Type-specific panels */}
      <div className="cobro-panel">
        {tipo === 'mensual' && (
          <p className="cobro-panel-text">Cuota mensual estándar</p>
        )}
        {tipo === 'diario' && (
          <>
            <label className="cobro-panel-label">¿Cuántos días paga?</label>
            <input type="number" className="cobro-panel-input" min="1" max="30" value={dias}
              onChange={e => setDias(parseInt(e.target.value) || 1)} />
            <div className="cobro-calc">{dias} día{dias > 1 ? 's' : ''} × {formatMonto(cuota / 30)} = {formatMonto(montoFinal)}</div>
          </>
        )}
        {tipo === 'multi_mes' && (
          <>
            <label className="cobro-panel-label">¿Cuántos meses?</label>
            <input type="number" className="cobro-panel-input" min="2" max="12" value={meses}
              onChange={e => setMeses(parseInt(e.target.value) || 2)} />
            <div className="cobro-calc">{meses} meses × {formatMonto(cuota)} = {formatMonto(montoFinal)}</div>
          </>
        )}
        {tipo === 'parcial' && (
          <>
            <label className="cobro-panel-label">Monto parcial (B/.)</label>
            <input type="number" className="cobro-panel-input" min="0.10" max="3.00" step="0.10" value={parcial}
              onChange={e => setParcial(parseFloat(e.target.value) || 0)} />
          </>
        )}
        {tipo === 'puesta_al_dia' && (
          <div className="cobro-calc">Deuda total: {formatMonto(resumen?.deuda || 0)}</div>
        )}
      </div>

      {/* Points */}
      {puntos > 0 && (
        <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{color: 'var(--primary-color)'}}>🌟 Tienes {puntos} Puntos JAAR</strong><br/>
            <small>Equivale a {formatMonto(calcularDescuentoBalboas(puntos))} de descuento.</small>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={usarPuntos} 
              onChange={e => setUsarPuntos(e.target.checked)} 
            />
            Usar puntos
          </label>
        </div>
      )}

      {/* Total */}
      <div className="cobro-total">
        <div className="cobro-total-amount">{formatMonto(montoFinal)}</div>
      </div>

      {/* Note and File */}
      <div className="cobro-extras">
        <input
          type="text"
          className="cobro-nota"
          placeholder="Nota opcional..."
          value={nota}
          onChange={e => setNota(e.target.value)}
        />
        <div className="cobro-file-input">
          <label className="cobro-panel-label" style={{display:'block', marginTop:'10px'}}>Adjuntar Recibo/Factura</label>
          <input 
            type="file" 
            accept="image/*,.pdf" 
            onChange={(e) => setFile(e.target.files[0])}
            style={{ fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Confirm button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        loading={submitting}
        onClick={handleConfirmar}
      >
        Confirmar Cobro
      </Button>
    </Modal>
  );
}
