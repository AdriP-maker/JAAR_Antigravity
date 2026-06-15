/**
 * Input Component — SIMAP Digital
 * Styled input with label and optional icon
 */

import './Input.css';

export default function Input({
  label,
  id,
  icon,
  error,
  className = '',
  type = 'text',
  ...props
}) {
  return (
    <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          id={id}
          type={type}
          className={`input-field ${icon ? 'input-with-icon' : ''}`}
          {...props}
        />
      </div>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
}

export function Select({ label, id, children, className = '', ...props }) {
  return (
    <div className={`input-group ${className}`}>
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <select id={id} className="input-field input-select" {...props}>
        {children}
      </select>
    </div>
  );
}
