/**
 * ============================================
 * CLIENTE API HTTP - FRONTEND
 * ============================================
 * 
 * Cliente HTTP centralizado con axios.
 * Maneja autenticación, errores, interceptors.
 * 
 * Uso:
 *   import api from '@/services/api';
 *   const users = await api.get('/users');
 *   const user = await api.post('/users', { name: 'John' });
 */

import axios from 'axios';
import { STORAGE_KEYS, ERROR_MESSAGES } from '../constants';

/**
 * ============================================
 * CONFIGURACIÓN BASE
 * ============================================
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_TIMEOUT = 30000; // 30 segundos

/**
 * Crear instancia de axios
 */
const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * ============================================
 * GESTIÓN DE TOKENS
 * ============================================
 */

/**
 * Obtiene el token de localStorage
 */
const getToken = () => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Guarda el token en localStorage
 */
const setToken = (token) => {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }
};

/**
 * Obtiene el refresh token
 */
const getRefreshToken = () => {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * Guarda el refresh token
 */
const setRefreshToken = (token) => {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }
};

/**
 * Limpia todos los tokens
 */
const clearTokens = () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
};

/**
 * ============================================
 * INTERCEPTORS
 * ============================================
 */

/**
 * Request Interceptor
 * Agrega el token a todas las requests
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log en desarrollo
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Maneja errores y refresh de tokens
 */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    // Log en desarrollo
    if (import.meta.env.DEV) {
      console.log(`[API] Response:`, response.data);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no es el endpoint de login
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Si es el endpoint de refresh, limpiar tokens y rechazar
      if (originalRequest.url?.includes('/auth/refresh')) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Si ya estamos refrescando, agregar a la cola
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Intentar refrescar el token
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        setToken(accessToken);
        if (newRefreshToken) {
          setRefreshToken(newRefreshToken);
        }

        // Procesar cola de requests fallidas
        processQueue(null, accessToken);

        // Reintentar request original
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Manejar otros errores
    return Promise.reject(error);
  }
);

/**
 * ============================================
 * MÉTODOS HTTP
 * ============================================
 */

/**
 * Cliente API
 */
const api = {
  /**
   * GET request
   */
  get: async (url, config = {}) => {
    try {
      const response = await axiosInstance.get(url, config);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  /**
   * POST request
   */
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await axiosInstance.post(url, data, config);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  /**
   * PUT request
   */
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await axiosInstance.put(url, data, config);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  /**
   * PATCH request
   */
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await axiosInstance.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  /**
   * DELETE request
   */
  delete: async (url, config = {}) => {
    try {
      const response = await axiosInstance.delete(url, config);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  /**
   * Upload de archivos
   */
  upload: async (url, file, onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        };
      }

      const response = await axiosInstance.post(url, formData, config);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  /**
   * Obtiene el token actual
   */
  getToken,

  /**
   * Guarda el token
   */
  setToken,

  /**
   * Limpia los tokens
   */
  clearTokens,
};

/**
 * ============================================
 * MANEJO DE ERRORES
 * ============================================
 */

/**
 * Maneja y formatea errores de la API
 */
const handleError = (error) => {
  // Error de red
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return {
        message: ERROR_MESSAGES.TIMEOUT,
        code: 'TIMEOUT',
      };
    }
    return {
      message: ERROR_MESSAGES.NETWORK_ERROR,
      code: 'NETWORK_ERROR',
    };
  }

  // Error del servidor
  const { status, data } = error.response;

  // Errores específicos por código
  switch (status) {
    case 400:
      return {
        message: data?.error?.message || ERROR_MESSAGES.VALIDATION_ERROR,
        code: 'VALIDATION_ERROR',
        errors: data?.error?.errors || [],
      };

    case 401:
      return {
        message: data?.error?.message || ERROR_MESSAGES.UNAUTHORIZED,
        code: 'UNAUTHORIZED',
      };

    case 403:
      return {
        message: data?.error?.message || ERROR_MESSAGES.FORBIDDEN,
        code: 'FORBIDDEN',
      };

    case 404:
      return {
        message: data?.error?.message || ERROR_MESSAGES.NOT_FOUND,
        code: 'NOT_FOUND',
      };

    case 500:
    case 502:
    case 503:
      return {
        message: data?.error?.message || ERROR_MESSAGES.SERVER_ERROR,
        code: 'SERVER_ERROR',
      };

    default:
      return {
        message: data?.error?.message || 'Error desconocido',
        code: 'UNKNOWN_ERROR',
      };
  }
};

/**
 * ============================================
 * EXPORT
 * ============================================
 */
export default api;

// Exportar también métodos individuales
export { getToken, setToken, clearTokens, getRefreshToken, setRefreshToken };
