/**
 * ============================================
 * CONSTANTES GLOBALES DE LA APLICACIÓN
 * ============================================
 * 
 * Single Source of Truth para todos los valores constantes.
 * Evita hardcoding y facilita mantenimiento.
 * 
 * Uso:
 *   import { USER_ROLES, HTTP_STATUS } from './config/constants.js';
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

// Array de roles para validaciones
export const USER_ROLES_ARRAY = Object.values(USER_ROLES);

// Jerarquía de roles (mayor número = más permisos)
export const ROLE_HIERARCHY = {
  [USER_ROLES.GUEST]: 0,
  [USER_ROLES.USER]: 1,
  [USER_ROLES.ADMIN]: 2,
  [USER_ROLES.SUPERADMIN]: 3,
};

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

export const ENTITY_STATUS_ARRAY = Object.values(ENTITY_STATUS);

// ============================================
// CÓDIGOS HTTP
// ============================================
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  
  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

// ============================================
// MENSAJES DE ERROR ESTÁNDAR
// ============================================
export const ERROR_MESSAGES = {
  // Autenticación
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'No tienes permisos para realizar esta acción',
  TOKEN_EXPIRED: 'Token expirado',
  TOKEN_INVALID: 'Token inválido',
  
  // Validación
  VALIDATION_ERROR: 'Error de validación',
  REQUIRED_FIELD: 'Campo requerido',
  INVALID_FORMAT: 'Formato inválido',
  INVALID_EMAIL: 'Email inválido',
  INVALID_PASSWORD: 'Contraseña inválida',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres',
  
  // Base de datos
  NOT_FOUND: 'Recurso no encontrado',
  ALREADY_EXISTS: 'El recurso ya existe',
  DATABASE_ERROR: 'Error en la base de datos',
  
  // Servidor
  INTERNAL_ERROR: 'Error interno del servidor',
  SERVICE_UNAVAILABLE: 'Servicio no disponible',
};

// ============================================
// MENSAJES DE ÉXITO ESTÁNDAR
// ============================================
export const SUCCESS_MESSAGES = {
  CREATED: 'Creado exitosamente',
  UPDATED: 'Actualizado exitosamente',
  DELETED: 'Eliminado exitosamente',
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  LOGOUT_SUCCESS: 'Cierre de sesión exitoso',
  EMAIL_SENT: 'Email enviado exitosamente',
};

// ============================================
// LÍMITES Y CONFIGURACIONES
// ============================================
export const LIMITS = {
  // Paginación
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Strings
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_TEXT_LENGTH: 5000,
  
  // Passwords
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  
  // Archivos
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
  
  // Rate Limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_COOLDOWN_MINUTES: 15,
};

// ============================================
// REGEX PATTERNS
// ============================================
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  URL: /^https?:\/\/.+/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
};

// ============================================
// TIPOS DE ARCHIVO PERMITIDOS
// ============================================
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
  ALL: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/csv'],
};

// ============================================
// FORMATOS DE FECHA
// ============================================
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_DATETIME: 'DD/MM/YYYY HH:mm',
  TIME: 'HH:mm:ss',
};

// ============================================
// EVENTOS DEL SISTEMA
// ============================================
export const SYSTEM_EVENTS = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  
  ERROR_OCCURRED: 'error.occurred',
  WARNING_OCCURRED: 'warning.occurred',
};

// ============================================
// CONFIGURACIÓN DE CACHE
// ============================================
export const CACHE_TTL = {
  SHORT: 60, // 1 minuto
  MEDIUM: 300, // 5 minutos
  LONG: 3600, // 1 hora
  DAY: 86400, // 24 horas
};

// ============================================
// HELPERS
// ============================================

/**
 * Verifica si un rol tiene permisos suficientes
 * @param {string} userRole - Rol del usuario
 * @param {string} requiredRole - Rol requerido
 * @returns {boolean}
 */
export const hasRole = (userRole, requiredRole) => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

/**
 * Obtiene el label amigable de un rol
 * @param {string} role - Rol del usuario
 * @returns {string}
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
 * @param {string} status - Estado de la entidad
 * @returns {string}
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
 * Valida si un valor es un UUID válido
 * @param {string} value - Valor a validar
 * @returns {boolean}
 */
export const isValidUUID = (value) => {
  return PATTERNS.UUID.test(value);
};

/**
 * Valida si un valor es un email válido
 * @param {string} value - Valor a validar
 * @returns {boolean}
 */
export const isValidEmail = (value) => {
  return PATTERNS.EMAIL.test(value);
};

// ============================================
// EXPORT DEFAULT
// ============================================
export default {
  USER_ROLES,
  USER_ROLES_ARRAY,
  ROLE_HIERARCHY,
  ENTITY_STATUS,
  ENTITY_STATUS_ARRAY,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LIMITS,
  PATTERNS,
  ALLOWED_FILE_TYPES,
  DATE_FORMATS,
  SYSTEM_EVENTS,
  CACHE_TTL,
  hasRole,
  getRoleLabel,
  getStatusLabel,
  isValidUUID,
  isValidEmail,
};
