/**
 * ThemeToggle Component — SIMAP Digital
 * Animated sun/moon toggle for dark/light mode
 */

import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      <span className={`theme-icon ${isDark ? 'theme-icon-moon' : 'theme-icon-sun'}`}>
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
