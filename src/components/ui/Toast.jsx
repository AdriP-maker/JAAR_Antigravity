/**
 * Toast Component — SIMAP Digital
 * Floating notification container rendered from ToastContext
 */

import { useToast } from '../../context/ToastContext';
import './Toast.css';

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type} animate-fade-in-up`}
          onClick={() => dismissToast(toast.id)}
          role="alert"
        >
          <span className="toast-icon">
            {toast.type === 'success' && '✅'}
            {toast.type === 'error' && '❌'}
            {toast.type === 'warning' && '⚠️'}
            {toast.type === 'info' && 'ℹ️'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
