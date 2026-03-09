import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TimeEntries from './pages/TimeEntries';
import BulkTimeEntry from './pages/BulkTimeEntry';
import OrganizationalUnits from './pages/OrganizationalUnits';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import { syncManager } from './offline/index.js';

function App() {
  // Iniciar sincronización automática
  useEffect(() => {
    syncManager.startAutoSync(30000); // Cada 30 segundos

    return () => {
      syncManager.stopAutoSync();
    };
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
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
            path="/time-entries/bulk"
            element={
              <ProtectedRoute>
                <Layout>
                  <BulkTimeEntry />
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
