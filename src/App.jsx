/**
 * App.jsx — SIMAP Digital
 * Main application router and providers configuration
 */

import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ui/Toast';
import { isRouteAllowed, getHomeRoute } from './services/authService';
import { initDB } from './services/db';

// Layout
import AppShell from './components/layout/AppShell';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CobrosPage from './pages/CobrosPage';
import HistorialPage from './pages/HistorialPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminPage from './pages/AdminPage';
import GastosPage from './pages/GastosPage';
import JornalesPage from './pages/JornalesPage';
import ComisionesPage from './pages/ComisionesPage';
import ReportePage from './pages/ReportePage';
import ForoPage from './pages/ForoPage';
import ConfigPage from './pages/ConfigPage';
import ChatPage from './pages/ChatPage';
import MapaPage from './pages/MapaPage';

// Initialize DB outside React lifecycle to prevent multiple calls on hot reload
let dbInitialized = false;

// Route guard component
function ProtectedRoute({ children }) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Prevent users from accessing routes they don't have permission for
  if (role && !isRouteAllowed(role, location.pathname)) {
    const home = getHomeRoute(role);
    return <Navigate to={home} replace />;
  }

  return children;
}

// Redirects authenticated users to their home route if they try to access root
function RootRedirect() {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated && role) {
    return <Navigate to={getHomeRoute(role)} replace />;
  }

  return <Navigate to="/login" replace />;
}

export default function App() {
  useEffect(() => {
    if (!dbInitialized) {
      initDB().catch(err => console.error('Failed to initialize DB:', err));
      dbInitialized = true;
    }
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <HashRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />

              {/* App Shell Routes (Protected) */}
              <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
                <Route path="/cobros" element={<CobrosPage />} />
                <Route path="/historial" element={<HistorialPage />} />
                
                {/* Phase 2 Modules */}
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/jornales" element={<JornalesPage />} />
                <Route path="/gastos" element={<GastosPage />} />
                
                {/* Phase 3 Modules */}
                <Route path="/comisiones" element={<ComisionesPage />} />
                <Route path="/reporte" element={<ReportePage />} />
                <Route path="/foro" element={<ForoPage />} />
                <Route path="/puntos-admin" element={<ConfigPage />} />

                {/* Phase 4 Modules */}
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/mapa" element={<MapaPage />} />
              </Route>

              {/* Redirect root to appropriate page */}
              <Route path="/" element={<RootRedirect />} />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </HashRouter>
          <ToastContainer />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
