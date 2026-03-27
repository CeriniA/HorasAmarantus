import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TimeEntries from './pages/TimeEntries';
import OrganizationalUnits from './pages/OrganizationalUnits';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import { syncManager } from './offline/index.js';
import { OfflineIndicator } from './components/OfflineIndicator';

function App() {
  // ✅ MEJORADO: Sincronización inteligente basada en eventos
  useEffect(() => {
    // 1. Sincronización inicial al cargar la app
    syncManager.sync();

    // 2. Sincronización periódica más espaciada (5 minutos en lugar de 30 segundos)
    // Solo como fallback, la sincronización principal es por eventos
    syncManager.startAutoSync(300000); // 5 minutos

    // 3. Sincronizar cuando se vuelve online
    const handleOnline = () => {
      if (import.meta.env.DEV) {
        console.log('📶 Conexión restaurada - sincronizando...');
      }
      syncManager.sync();
    };

    // 4. Sincronizar cuando la ventana vuelve a tener foco
    // (usuario regresa a la app después de estar en otra pestaña)
    const handleVisibilityChange = () => {
      if (!document.hidden && navigator.onLine) {
        if (import.meta.env.DEV) {
          console.log('👁️ App visible - verificando sincronización...');
        }
        syncManager.sync();
      }
    };

    // Agregar event listeners
    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      syncManager.stopAutoSync();
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        {/* ✅ Indicador de estado offline */}
        <OfflineIndicator />
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/time-entries"
            element={
              <ProtectedRoute>
                <Layout>
                  <TimeEntries />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizational-units"
            element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <Layout>
                  <OrganizationalUnits />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <Layout>
                  <UserManagement />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
