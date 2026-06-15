/**
 * RegisterPage — SIMAP Digital
 * Page for new neighbors to request access to the system
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, registerJunta } from '../services/authService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ThemeToggle from '../components/layout/ThemeToggle';
import { useToast } from '../context/ToastContext';
import './RegisterPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [tipoRegistro, setTipoRegistro] = useState('vecino'); // 'vecino' o 'junta'
  const [formData, setFormData] = useState({
    nombre: '', user: '', pass: '', casa: '', sector: '',
    nombre_junta: '', ruc: '', email: '', admin_user: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (tipoRegistro === 'vecino') {
      if (!formData.nombre || !formData.user || !formData.pass) {
        setError('Por favor, completa los campos obligatorios (*).');
        return;
      }
    } else {
      if (!formData.nombre_junta || !formData.admin_user || !formData.pass) {
        setError('Por favor, completa los campos obligatorios de la junta (*).');
        return;
      }
    }

    setLoading(true);
    setError('');

    let res;
    if (tipoRegistro === 'vecino') {
      res = await registerUser(formData);
    } else {
      res = await registerJunta({
        nombre_junta: formData.nombre_junta,
        ruc: formData.ruc,
        email: formData.email,
        admin_user: formData.admin_user,
        pass: formData.pass
      });
    }
    if (res.success) {
      showToast('Solicitud enviada. Espera la aprobación de la directiva.', { type: 'success' });
      navigate('/login');
    } else {
      setError(res.error || 'Ocurrió un error al registrar.');
    }
    setLoading(false);
  };

  return (
    <div className="register-page">
      <div className="register-theme-toggle">
        <ThemeToggle />
      </div>

      <div className="register-card animate-scale-in">
        <h2 className="register-title">Solicitar Acceso</h2>
        <p className="register-subtitle">Únete a la plataforma SIMAP Digital</p>

        <div className="register-tabs">
          <button 
            type="button"
            className={`reg-tab ${tipoRegistro === 'vecino' ? 'active' : ''}`}
            onClick={() => setTipoRegistro('vecino')}
          >
            Soy Vecino
          </button>
          <button 
            type="button"
            className={`reg-tab ${tipoRegistro === 'junta' ? 'active' : ''}`}
            onClick={() => setTipoRegistro('junta')}
          >
            Soy Junta Comunal
          </button>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {tipoRegistro === 'vecino' ? (
            <>
              <Input id="nombre" label="Nombre Completo *" placeholder="Ej: Juan Pérez" value={formData.nombre} onChange={handleChange} />
              <div className="register-grid">
                <Input id="casa" label="Número de Casa / Lote" placeholder="Ej: Lote 42" value={formData.casa} onChange={handleChange} />
                <Input id="sector" label="Sector / Calle" placeholder="Ej: Calle Principal" value={formData.sector} onChange={handleChange} />
              </div>
            </>
          ) : (
            <>
              <Input id="nombre_junta" label="Nombre de la Junta *" placeholder="Ej: SIMAP Santa Mónica" value={formData.nombre_junta} onChange={handleChange} />
              <div className="register-grid">
                <Input id="ruc" label="RUC / Tomo" placeholder="Opcional" value={formData.ruc} onChange={handleChange} />
                <Input id="email" label="Correo de contacto" type="email" placeholder="junta@ejemplo.com" value={formData.email} onChange={handleChange} />
              </div>
            </>
          )}

          <div className="register-divider"><span>Credenciales de acceso</span></div>

          <Input
            id={tipoRegistro === 'vecino' ? 'user' : 'admin_user'}
            label="Usuario de acceso *"
            placeholder="Elige un usuario"
            value={tipoRegistro === 'vecino' ? formData.user : formData.admin_user}
            onChange={handleChange}
          />
          <Input
            id="pass"
            label="Contraseña *"
            type="password"
            placeholder="Mínimo 4 caracteres"
            value={formData.pass}
            onChange={handleChange}
          />

          {error && <div className="register-error">{error}</div>}

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} className="register-submit">
            Enviar Solicitud
          </Button>
        </form>

        <div className="register-footer">
          <button className="register-link" onClick={() => navigate('/login')}>
            ← Volver al Login
          </button>
        </div>
      </div>
    </div>
  );
}
