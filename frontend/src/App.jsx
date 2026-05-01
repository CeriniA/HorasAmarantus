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
import RoleManagement from './pages/RoleManagement';
import Settings from './pages/Settings';
import Objectives from './pages/Objectives';
import MyObjectives from './pages/MyObjectives';
import { syncManager } from './offline/index.js';
import { OfflineIndicator } from './components/OfflineIndicator';

function App() {
  // ✅ MEJORADO: Sincronización inteligente basada en eventos
  useEffect(() => {
    // 1. Sincronización inicial al cargar la app
    syncManager.sync();

    // 2. Iniciar sincronización automática
    // startAutoSync YA maneja el evento 'online' internamente
    syncManager.startAutoSync(300000); // 5 minutos

    // 3. Sincronizar cuando la app vuelve a estar visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        if (import.meta.env.DEV) {
          console.log('👁️ App visible - sincronizando...');
        }
        syncManager.sync();
      }
    };

    // Agregar event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      syncManager.stopAutoSync();
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
              <ProtectedRoute>
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
            path="/admin/roles"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <Layout>
                  <RoleManagement />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/objectives"
            element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <Layout>
                  <Objectives />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-objectives"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyObjectives />
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
