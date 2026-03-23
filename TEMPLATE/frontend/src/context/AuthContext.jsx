/**
 * ============================================
 * CONTEXT DE AUTENTICACIÓN - FRONTEND
 * ============================================
 * 
 * Maneja el estado global de autenticación.
 * Incluye login, logout, refresh, y estado del usuario.
 * 
 * Uso:
 *   import { useAuth } from '@/context/AuthContext';
 *   const { user, login, logout, isAuthenticated } = useAuth();
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setToken, clearTokens, getToken } from '../services/api';
import { STORAGE_KEYS, API_ENDPOINTS } from '../constants';

/**
 * ============================================
 * CREAR CONTEXTO
 * ============================================
 */

const AuthContext = createContext(null);

/**
 * ============================================
 * PROVIDER
 * ============================================
 */

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Inicializar autenticación al cargar la app
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Inicializa la autenticación verificando el token guardado
   */
  const initializeAuth = async () => {
    try {
      const token = getToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Verificar token obteniendo el perfil del usuario
      await loadUserProfile();
      
    } catch (error) {
      console.error('Error inicializando autenticación:', error);
      clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carga el perfil del usuario actual
   */
  const loadUserProfile = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.USER_PROFILE);
      
      if (response.success && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
        
        // Guardar en localStorage
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Login de usuario
   */
  const login = async (email, password) => {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, {
        email,
        password,
      });

      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;

        // Guardar tokens
        setToken(accessToken);
        if (refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }

        // Guardar usuario
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

        return { success: true, user };
      }

      return { success: false, message: 'Error en el login' };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: error.message || 'Error al iniciar sesión',
      };
    }
  };

  /**
   * Registro de usuario
   */
  const register = async (userData) => {
    try {
      const response = await api.post(API_ENDPOINTS.REGISTER, userData);

      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;

        // Guardar tokens
        setToken(accessToken);
        if (refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }

        // Guardar usuario
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

        return { success: true, user };
      }

      return { success: false, message: 'Error en el registro' };
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        message: error.message || 'Error al registrarse',
      };
    }
  };

  /**
   * Logout de usuario
   */
  const logout = useCallback(async () => {
    try {
      // Llamar al endpoint de logout (opcional)
      await api.post(API_ENDPOINTS.LOGOUT).catch(() => {
        // Ignorar errores del logout en el servidor
      });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar estado local
      clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      
      // Redirigir al login
      window.location.href = '/login';
    }
  }, []);

  /**
   * Actualiza el perfil del usuario
   */
  const updateProfile = async (updates) => {
    try {
      const response = await api.put(API_ENDPOINTS.USER_PROFILE, updates);

      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
        return { success: true, user: response.data };
      }

      return { success: false, message: 'Error al actualizar perfil' };
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      return {
        success: false,
        message: error.message || 'Error al actualizar perfil',
      };
    }
  };

  /**
   * Verifica si el usuario tiene un rol específico
   */
  const hasRole = useCallback((role) => {
    if (!user) return false;
    return user.role === role;
  }, [user]);

  /**
   * Verifica si el usuario tiene permisos (rol igual o superior)
   */
  const hasPermission = useCallback((requiredRole) => {
    if (!user) return false;
    
    const roleHierarchy = {
      guest: 0,
      user: 1,
      admin: 2,
      superadmin: 3,
    };

    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  }, [user]);

  /**
   * Refresca los datos del usuario
   */
  const refreshUser = useCallback(async () => {
    try {
      await loadUserProfile();
      return { success: true };
    } catch (error) {
      console.error('Error refrescando usuario:', error);
      return { success: false, message: error.message };
    }
  }, []);

  /**
   * Valor del contexto
   */
  const value = {
    // Estado
    user,
    loading,
    isAuthenticated,

    // Métodos
    login,
    register,
    logout,
    updateProfile,
    refreshUser,

    // Helpers
    hasRole,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * ============================================
 * HOOK PERSONALIZADO
 * ============================================
 */

/**
 * Hook para usar el contexto de autenticación
 * @returns {Object} Contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  
  return context;
};

/**
 * ============================================
 * EXPORT
 * ============================================
 */
export default AuthContext;
