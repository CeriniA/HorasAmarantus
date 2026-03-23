/**
 * ============================================
 * CONSTANTES GLOBALES DEL FRONTEND
 * ============================================
 * 
 * Single Source of Truth para el frontend.
 * Debe estar sincronizado con backend/src/config/constants.js
 * 
 * Uso:
 *   import { USER_ROLES, API_ENDPOINTS } from '@/constants';
 *   if (user.role === USER_ROLES.ADMIN) { ... }
 */

// ============================================
// ROLES DE USUARIO
// ============================================
export const USER_ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
};

export const USER_ROLES_ARRAY = Object.values(USER_ROLES);

// ============================================
// ESTADOS DE ENTIDADES
// ============================================
export const ENTITY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  DELETED: 'deleted',
  ARCHIVED: 'archived',
};

// ============================================
// ENDPOINTS DE LA API
// ============================================
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  
  // Users
  USERS: '/users',
  USER_BY_ID: (id) => `/users/${id}`,
  USER_PROFILE: '/users/profile',
  
  // Generic CRUD
  getAll: (resource) => `/${resource}`,
  getById: (resource, id) => `/${resource}/${id}`,
  create: (resource) => `/${resource}`,
  update: (resource, id) => `/${resource}/${id}`,
  delete: (resource, id) => `/${resource}/${id}`,
};

// ============================================
// RUTAS DE LA APLICACIÓN
// ============================================
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  USERS: '/users',
  SETTINGS: '/settings',
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/401',
};

// ============================================
// MENSAJES DE ERROR
// ============================================
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  UNAUTHORIZED: 'No autorizado. Por favor inicia sesión.',
  FORBIDDEN: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'Recurso no encontrado.',
  SERVER_ERROR: 'Error del servidor. Intenta más tarde.',
  VALIDATION_ERROR: 'Error de validación. Verifica los datos.',
  TIMEOUT: 'La solicitud tardó demasiado. Intenta de nuevo.',
};

// ============================================
// MENSAJES DE ÉXITO
// ============================================
export const SUCCESS_MESSAGES = {
  CREATED: 'Creado exitosamente',
  UPDATED: 'Actualizado exitosamente',
  DELETED: 'Eliminado exitosamente',
  SAVED: 'Guardado exitosamente',
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  LOGOUT_SUCCESS: 'Cierre de sesión exitoso',
};

// ============================================
// CONFIGURACIÓN DE PAGINACIÓN
// ============================================
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// ============================================
// CONFIGURACIÓN DE VALIDACIÓN
// ============================================
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  MAX_DESCRIPTION_LENGTH: 1000,
};

// ============================================
// REGEX PATTERNS
// ============================================
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  URL: /^https?:\/\/.+/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
};

// ============================================
// CONFIGURACIÓN DE ALMACENAMIENTO LOCAL
// ============================================
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  PREFERENCES: 'preferences',
};

// ============================================
// TEMAS
// ============================================
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

// ============================================
// IDIOMAS
// ============================================
export const LANGUAGES = {
  ES: 'es',
  EN: 'en',
  PT: 'pt',
};

// ============================================
// TIPOS DE NOTIFICACIÓN
// ============================================
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// ============================================
// DURACIÓN DE NOTIFICACIONES (ms)
// ============================================
export const NOTIFICATION_DURATION = {
  SHORT: 2000,
  MEDIUM: 4000,
  LONG: 6000,
};

// ============================================
// ESTADOS DE CARGA
// ============================================
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

// ============================================
// HELPERS
// ============================================

/**
 * Obtiene el label amigable de un rol
 */
export const getRoleLabel = (role) => {
  const labels = {
    [USER_ROLES.SUPERADMIN]: 'Superadministrador',
    [USER_ROLES.ADMIN]: 'Administrador',
    [USER_ROLES.USER]: 'Usuario',
    [USER_ROLES.GUEST]: 'Invitado',
  };
  return labels[role] || role;
};

/**
 * Obtiene el label amigable de un estado
 */
export const getStatusLabel = (status) => {
  const labels = {
    [ENTITY_STATUS.ACTIVE]: 'Activo',
    [ENTITY_STATUS.INACTIVE]: 'Inactivo',
    [ENTITY_STATUS.PENDING]: 'Pendiente',
    [ENTITY_STATUS.DELETED]: 'Eliminado',
    [ENTITY_STATUS.ARCHIVED]: 'Archivado',
  };
  return labels[status] || status;
};

/**
 * Obtiene el color de un estado
 */
export const getStatusColor = (status) => {
  const colors = {
    [ENTITY_STATUS.ACTIVE]: 'green',
    [ENTITY_STATUS.INACTIVE]: 'gray',
    [ENTITY_STATUS.PENDING]: 'yellow',
    [ENTITY_STATUS.DELETED]: 'red',
    [ENTITY_STATUS.ARCHIVED]: 'blue',
  };
  return colors[status] || 'gray';
};

/**
 * Obtiene el badge style de un rol
 */
export const getRoleBadgeStyle = (role) => {
  const styles = {
    [USER_ROLES.SUPERADMIN]: 'bg-purple-100 text-purple-800',
    [USER_ROLES.ADMIN]: 'bg-blue-100 text-blue-800',
    [USER_ROLES.USER]: 'bg-green-100 text-green-800',
    [USER_ROLES.GUEST]: 'bg-gray-100 text-gray-800',
  };
  return styles[role] || 'bg-gray-100 text-gray-800';
};

/**
 * Valida si un email es válido
 */
export const isValidEmail = (email) => {
  return PATTERNS.EMAIL.test(email);
};

/**
 * Valida si una contraseña es válida
 */
export const isValidPassword = (password) => {
  return password.length >= VALIDATION.MIN_PASSWORD_LENGTH;
};

/**
 * Trunca un texto a una longitud máxima
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Formatea un número como moneda
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Formatea una fecha
 */
export const formatDate = (date, format = 'short') => {
  const options = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    datetime: { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    },
  };
  
  return new Intl.DateTimeFormat('es-AR', options[format] || options.short).format(new Date(date));
};

// ============================================
// EXPORT DEFAULT
// ============================================
export default {
  USER_ROLES,
  USER_ROLES_ARRAY,
  ENTITY_STATUS,
  API_ENDPOINTS,
  ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PAGINATION,
  VALIDATION,
  PATTERNS,
  STORAGE_KEYS,
  THEMES,
  LANGUAGES,
  NOTIFICATION_TYPES,
  NOTIFICATION_DURATION,
  LOADING_STATES,
  getRoleLabel,
  getStatusLabel,
  getStatusColor,
  getRoleBadgeStyle,
  isValidEmail,
  isValidPassword,
  truncateText,
  formatCurrency,
  formatDate,
};
