/**
 * ForoPage — JAAR Digital
 * Community wall for announcements
 */

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../services/db';
import { createPost, deletePost } from '../services/foroService';
import { useAuth } from '../context/AuthContext';
import { formatRelativeTime } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import './ForoPage.css';

export default function ForoPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const posts = useLiveQuery(() => db.foro.orderBy('fecha').reverse().toArray()) || [];
  const isAdmin = user?.rol === 'admin' || user?.rol === 'cobrador';

  const [formData, setFormData] = useState({ titulo: '', contenido: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.contenido) {
      showToast('Llena todos los campos', { type: 'error' });
      return;
    }

    setSubmitting(true);
    const res = await createPost({
      autor: user?.nombre || user?.user,
      titulo: formData.titulo,
      contenido: formData.contenido
    });

    if (res.success) {
      showToast('Aviso publicado', { type: 'success' });
      setFormData({ titulo: '', contenido: '' });
    } else {
      showToast(res.error, { type: 'error' });
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Borrar este aviso?')) {
      await deletePost(id);
      showToast('Aviso borrado', { type: 'success' });
    }
  };

  return (
    <div className="foro-page">
      <div className="foro-header">
        <h2>Muro Comunitario</h2>
        <p>Avisos oficiales de la junta directiva</p>
      </div>

      {isAdmin && (
        <Card className="foro-compose-card">
          <h3>Publicar un Aviso</h3>
          <form onSubmit={handleSubmit}>
            <Input 
              label="Título del aviso" 
              placeholder="Ej: Corte programado de agua"
              value={formData.titulo}
              onChange={e => setFormData({ ...formData, titulo: e.target.value })}
            />
            <div className="form-group">
              <label className="form-label">Contenido</label>
              <textarea 
                className="form-textarea"
                rows="3"
                placeholder="Escribe los detalles aquí..."
                value={formData.contenido}
                onChange={e => setFormData({ ...formData, contenido: e.target.value })}
              ></textarea>
            </div>
            <Button type="submit" variant="primary" loading={submitting}>Publicar</Button>
          </form>
        </Card>
      )}

      <div className="foro-feed">
        {posts.length === 0 ? (
          <EmptyState icon="📢" message="No hay avisos recientes" />
        ) : (
          posts.map((post, i) => (
            <Card key={post.id} className="foro-post animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
              {isAdmin && (
                <button className="post-delete" onClick={() => handleDelete(post.id)}>🗑️</button>
              )}
              <h4 className="post-title">{post.titulo}</h4>
              <p className="post-content">{post.contenido}</p>
              <div className="post-footer">
                <span className="post-author">👤 {post.autor}</span>
                <span className="post-date">🕒 {formatRelativeTime(post.fecha)}</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
