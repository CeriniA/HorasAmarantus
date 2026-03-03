import { createContext, useContext, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { syncService } from '../services/syncService';

const AuthContext = createContext({});

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const auth = useAuth();

  useEffect(() => {
    // Iniciar sincronización automática cuando el usuario esté autenticado
    if (auth.user) {
      syncService.startAutoSync(30000); // Cada 30 segundos
      
      // Descargar datos iniciales
      syncService.downloadData(auth.user.id).catch(err => {
        console.error('Error downloading initial data:', err);
      });
    } else {
      syncService.stopAutoSync();
    }

    return () => {
      syncService.stopAutoSync();
    };
  }, [auth.user]);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
