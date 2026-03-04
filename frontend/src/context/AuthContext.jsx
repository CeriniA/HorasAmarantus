import { createContext, useContext, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

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
    // Nota: La sincronización automática ya se inicia en App.jsx
    // Este efecto se mantiene por si se necesita lógica adicional por usuario
    
    // TODO: Implementar downloadData en SyncManager si se necesita
    // if (auth.user) {
    //   syncManager.downloadData().catch(err => {
    //     console.error('Error downloading initial data:', err);
    //   });
    // }
  }, [auth.user]);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
