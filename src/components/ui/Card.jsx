/**
 * Card Component — SIMAP Digital
 * Animated card with fade-in-up entrance
 */

import './Card.css';

export default function Card({
  children,
  delay = 0,
  className = '',
  onClick,
  hoverable = false,
  ...props
}) {
  return (
    <div
      className={`card animate-fade-in-up ${hoverable ? 'card-hoverable' : ''} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
