import { useState, useEffect } from 'react';
import { authService, api } from '../services/api';
import { db } from '../offline/core/db.js';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar si hay token guardado
    const token = api.getToken();
    if (token) {
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      if (navigator.onLine) {
        // Online: cargar desde backend
        const { user: userData } = await authService.getMe();
        setUser(userData);
        setSession({ user: userData });
        
        // Guardar en cache local
        await db.users.put(userData);
      } else {
        // Offline: cargar desde cache
        const token = api.getToken();
        if (token) {
          // Intentar decodificar el token para obtener el user_id
          try {
            const payload = JSON.parse(window.atob(token.split('.')[1]));
            const userId = payload.id; // El token usa 'id', no 'userId'
            
            if (import.meta.env.DEV) {
              console.log('Loading user from cache (offline):', userId);
            }
            
            const cachedUser = await db.users.get(userId);
            
            if (cachedUser) {
              setUser(cachedUser);
              setSession({ user: cachedUser });
              if (import.meta.env.DEV) {
                console.log('User loaded from cache:', cachedUser.email);
              }
            } else {
              if (import.meta.env.DEV) {
                console.warn('Usuario no encontrado en cache, ID:', userId);
              }
              throw new Error('Usuario no encontrado en cache');
            }
          } catch (decodeError) {
            if (import.meta.env.DEV) {
              console.error('Error decodificando token:', decodeError);
            }
            // No limpiar token si estamos offline, puede ser error temporal
            if (navigator.onLine) {
              api.removeToken();
            }
          }
        }
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError(err.message);
      
      // Solo limpiar token si estamos online (error real del servidor)
      if (navigator.onLine) {
        api.removeToken();
        setUser(null);
        setSession(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      // Verificar conexión
      if (!navigator.onLine) {
        throw new Error('No hay conexión a internet. El login requiere conexión.');
      }

      const { token, user: userData } = await authService.login(email, password);
      
      // Guardar token
      api.setToken(token);
      
      // Actualizar estado
      setUser(userData);
      setSession({ user: userData });
      
      // Guardar en cache local
      await db.users.put(userData);

      return { success: true, user: userData };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      setLoading(true);
      setError(null);

      await authService.register({
        email,
        password,
        name: userData.name,
        role: userData.role || 'operario',
        organizational_unit_id: userData.organizational_unit_id || null,
      });

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      await authService.logout();
      
      // Limpiar estado
      setUser(null);
      setSession(null);

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      setError(null);

      const { user: updatedUser } = await api.put(`/users/${user.id}`, updates);

      setUser(updatedUser);
      await db.users.put(updatedUser);

      return { success: true, data: updatedUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);

      await api.post('/auth/reset-password', { email }, { auth: false });

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    isAuthenticated: !!session,
    isSuperadmin: user?.role === 'superadmin',
    isAdmin: user?.role === 'admin',
    isOperario: user?.role === 'operario',
  };
};

export default useAuth;
