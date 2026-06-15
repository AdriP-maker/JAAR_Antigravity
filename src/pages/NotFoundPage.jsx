/**
 * NotFoundPage — SIMAP Digital
 * 404 error page for unmatched routes
 */

import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import './NotFoundPage.css';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-content animate-fade-in-up">
        <div className="not-found-icon">💧</div>
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Página no encontrada</h2>
        <p className="not-found-text">
          Parece que te has perdido. La página que estás buscando no existe o no tienes permisos para verla.
        </p>
        <Button variant="primary" size="lg" onClick={() => navigate('/', { replace: true })}>
          Volver al Inicio
        </Button>
      </div>
    </div>
  );
}
