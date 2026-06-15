/**
 * LoginPage — SIMAP Digital
 * Premium login page with gradient background, glassmorphism card, and dark mode
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getHomeRoute } from '../services/authService';
import { recoverByHouse } from '../services/authService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ThemeToggle from '../components/layout/ThemeToggle';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark } = useTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);

  // Recovery modal
  const [showRecover, setShowRecover] = useState(false);
  const [recoverCasa, setRecoverCasa] = useState('');
  const [recoverResult, setRecoverResult] = useState(null);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!username || !password) {
      setError('Ingresa tu usuario y contraseña.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(username, password);

    if (result.success) {
      const home = getHomeRoute(result.user.rol);
      navigate(home, { replace: true });
    } else {
      setError(result.error);
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
    }
    setLoading(false);
  };

  const handleRecover = async () => {
    if (!recoverCasa) return;
    const result = await recoverByHouse(recoverCasa);
    if (result) {
      setRecoverResult({ found: true, ...result });
    } else {
      setRecoverResult({ found: false });
    }
  };

  return (
    <div className="login-page">
      {/* Decorative background elements */}
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />
      <div className="login-bg-orb login-bg-orb-3" />

      <div className="login-theme-toggle">
        <ThemeToggle />
      </div>

      <div className={`login-card animate-fade-in-up ${shaking ? 'login-shake' : ''}`}>
        <div className="login-logo">💧</div>
        <h2 className="login-title">Piloto Caballero (Antón)</h2>
        <p className="login-subtitle">Sistema de Gestión SIMAP · Panamá</p>

        <form onSubmit={handleLogin} className="login-form">
          <Input
            id="loginUser"
            label="Usuario"
            icon="👤"
            placeholder="Tu usuario"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
          />
          <Input
            id="loginPass"
            label="Contraseña"
            icon="🔒"
            type="password"
            placeholder="••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error && (
            <div className="login-error animate-fade-in-up">{error}</div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            Ingresar al Sistema
          </Button>
        </form>

        <div className="login-links">
          <button className="login-link" onClick={() => { setShowRecover(true); setRecoverResult(null); setRecoverCasa(''); }}>
            ¿Olvidé mi contraseña?
          </button>
          <button className="login-link" onClick={() => navigate('/registro')}>
            Solicitar Acceso →
          </button>
        </div>
      </div>

      {/* Recovery Modal */}
      <Modal
        isOpen={showRecover}
        onClose={() => setShowRecover(false)}
        title="🔑 Recuperar Contraseña"
      >
        <p className="recover-desc">
          Ingresa tu número de casa y podrás ver tu usuario registrado. Para un cambio de contraseña contacta al administrador.
        </p>
        <Input
          id="recoverCasa"
          label="Número de Casa / ID"
          placeholder="Ej: Casa-07"
          value={recoverCasa}
          onChange={e => setRecoverCasa(e.target.value)}
        />
        <Button variant="primary" fullWidth onClick={handleRecover}>
          Buscar mi Cuenta
        </Button>
        {recoverResult && (
          <div className={`recover-result ${recoverResult.found ? 'recover-found' : 'recover-not-found'} animate-fade-in-up`}>
            {recoverResult.found ? (
              <>
                ✅ Cuenta encontrada.<br />
                <strong>Usuario:</strong> {recoverResult.user}<br />
                <small>Contacta al administrador para restablecer la contraseña.</small>
              </>
            ) : (
              '❌ No se encontró ninguna cuenta con ese número de casa.'
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
