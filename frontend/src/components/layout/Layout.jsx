import Navbar from './Navbar';
import { useOffline } from '../../hooks/useOffline';
import Alert from '../common/Alert';

export const Layout = ({ children }) => {
  const { syncStatus, clearSyncStatus } = useOffline();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Notificaciones de sincronización */}
      {syncStatus && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Alert
            type={syncStatus.type}
            message={syncStatus.message}
            onClose={clearSyncStatus}
          />
        </div>
      )}

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Sistema de Horas Hortícola &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
