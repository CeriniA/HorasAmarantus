// Cliente API para comunicarse con el backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  constructor() {
    this.baseURL = API_URL;
  }

  // Obtener token del localStorage
  getToken() {
    return localStorage.getItem('auth_token');
  }

  // Guardar token en localStorage
  setToken(token) {
    localStorage.setItem('auth_token', token);
  }

  // Eliminar token del localStorage
  removeToken() {
    localStorage.removeItem('auth_token');
  }

  // Headers por defecto
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Manejo de respuestas
  async handleResponse(response) {
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      if (import.meta.env.DEV) {
        console.error('Error parsing response JSON:', parseError);
      }
      data = {};
    }

    if (!response.ok) {
      // Si es 401, el token expiró
      if (response.status === 401) {
        this.removeToken();
        // Solo redirigir si no estamos ya en login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      // Construir mensaje de error más descriptivo
      let errorMessage = data.error || data.message || 'Error en la petición';
      
      // Agregar información del status code
      const statusMessages = {
        400: 'Solicitud inválida',
        401: 'No autorizado',
        403: 'Acceso denegado',
        404: 'No encontrado',
        500: 'Error del servidor',
        503: 'Servicio no disponible'
      };
      
      if (statusMessages[response.status]) {
        errorMessage = `${statusMessages[response.status]}: ${errorMessage}`;
      }

      if (import.meta.env.DEV) {
        console.error('API Error:', {
          status: response.status,
          url: response.url,
          message: data.message || data.error || 'Error desconocido',
          data: data,
          errors: data.errors,
          fullError: data // Mostrar error completo
        });
        
        // Mostrar errores de validación específicos
        if (data.errors && Array.isArray(data.errors)) {
          console.error('🔴 Errores de validación detallados:');
          data.errors.forEach((err, index) => {
            console.error(`  ${index + 1}.`, err);
          });
        }
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      error.errors = data.errors; // Para errores de validación
      throw error;
    }

    return data;
  }

  // GET request
  async get(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(options.auth !== false),
        ...options,
      });

      return this.handleResponse(response);
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        throw new Error('No se pudo conectar al servidor. Verifica tu conexión a internet.');
      }
      throw error;
    }
  }

  // POST request
  async post(endpoint, body, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(options.auth !== false),
        body: JSON.stringify(body),
        ...options,
      });

      return this.handleResponse(response);
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        throw new Error('No se pudo conectar al servidor. Verifica tu conexión a internet.');
      }
      throw error;
    }
  }

  // PUT request
  async put(endpoint, body, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(options.auth !== false),
        body: JSON.stringify(body),
        ...options,
      });

      return this.handleResponse(response);
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        throw new Error('No se pudo conectar al servidor. Verifica tu conexión a internet.');
      }
      throw error;
    }
  }

  // DELETE request
  async delete(endpoint, body = null, options = {}) {
    try {
      const fetchOptions = {
        method: 'DELETE',
        headers: this.getHeaders(options.auth !== false),
        ...options,
      };
      
      // Si hay body, agregarlo
      if (body) {
        fetchOptions.body = JSON.stringify(body);
      }
      
      const response = await fetch(`${this.baseURL}${endpoint}`, fetchOptions);

      return this.handleResponse(response);
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        throw new Error('No se pudo conectar al servidor. Verifica tu conexión a internet.');
      }
      throw error;
    }
  }
}

// Instancia singleton
export const api = new ApiClient();

// Servicios específicos
export const authService = {
  login: (username, password) => api.post('/auth/login', { username, password }, { auth: false }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  changePassword: (currentPassword, newPassword) => 
    api.post('/auth/change-password', { currentPassword, newPassword }),
  updateEmail: (email) => api.put('/auth/me/email', { email }),
  updateWeeklyGoal: (weekly_goal) => api.put('/auth/me/goal', { weekly_goal }),
  logout: () => {
    api.removeToken();
    return Promise.resolve();
  },
};

export const timeEntriesService = {
  getAll: () => api.get('/time-entries'),
  getById: (id) => api.get(`/time-entries/${id}`),
  create: (data) => api.post('/time-entries', data),
  createBulk: (entries, user_id) => api.post('/time-entries/bulk', { entries, user_id }),
  update: (id, data) => api.put(`/time-entries/${id}`, data),
  delete: (id) => api.delete(`/time-entries/${id}`),
  deleteBulk: (ids) => api.delete('/time-entries/bulk', { ids }),
};

export const usersService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const orgUnitsService = {
  getAll: () => api.get('/organizational-units'),
  getById: (id) => api.get(`/organizational-units/${id}`),
  create: (data) => api.post('/organizational-units', data),
  update: (id, data) => api.put(`/organizational-units/${id}`, data),
  delete: (id) => api.delete(`/organizational-units/${id}`),
};

export const reportsService = {
  getSummary: (params) => api.get('/reports/summary', { params }),
  getOvertime: (params) => api.get('/reports/overtime', { params }),
};

export default api;
