/**
 * Tipos y modelos de datos del sistema
 * Estos deben coincidir EXACTAMENTE con el schema de Supabase
 */

/**
 * @typedef {Object} User
 * @property {string} id - UUID
 * @property {string} email - Email único
 * @property {string} password_hash - Hash bcrypt del password
 * @property {string} name - Nombre completo
 * @property {'admin'|'supervisor'|'operario'} role - Rol del usuario
 * @property {string|null} organizational_unit_id - UUID de la unidad organizacional
 * @property {boolean} is_active - Si el usuario está activo
 * @property {string} created_at - Timestamp ISO
 * @property {string} updated_at - Timestamp ISO
 */

/**
 * @typedef {Object} OrganizationalUnit
 * @property {string} id - UUID
 * @property {string} name - Nombre de la unidad
 * @property {'area'|'proceso'|'subproceso'|'tarea'} type - Tipo de unidad
 * @property {string|null} parent_id - UUID del padre
 * @property {number} level - Nivel en la jerarquía (0-3)
 * @property {string} path - Path jerárquico (calculado por trigger)
 * @property {boolean} is_active - Si la unidad está activa
 * @property {string} created_at - Timestamp ISO
 * @property {string} updated_at - Timestamp ISO
 */

/**
 * @typedef {Object} TimeEntry
 * @property {string} id - UUID
 * @property {string} client_id - UUID único del cliente (para sync offline)
 * @property {string} user_id - UUID del usuario
 * @property {string} organizational_unit_id - UUID de la unidad organizacional
 * @property {string|null} description - Descripción del trabajo
 * @property {string} start_time - Timestamp ISO de inicio
 * @property {string} end_time - Timestamp ISO de fin
 * @property {number} total_hours - Horas totales (calculado por trigger)
 * @property {'completed'} status - Estado (siempre completed en sistema manual)
 * @property {string} created_at - Timestamp ISO
 * @property {string} updated_at - Timestamp ISO
 */

/**
 * @typedef {Object} JWTPayload
 * @property {string} id - UUID del usuario
 * @property {string} email - Email del usuario
 * @property {'admin'|'supervisor'|'operario'} role - Rol del usuario
 * @property {string|null} organizational_unit_id - UUID de la unidad organizacional
 */

// Validaciones de negocio
export const VALIDATION_RULES = {
  password: {
    minLength: 8,
    maxLength: 100,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  name: {
    minLength: 2,
    maxLength: 255,
  },
  description: {
    maxLength: 1000,
  },
  timeEntry: {
    maxHoursPerDay: 24,
    maxDaysInPast: 60,
    maxHoursInFuture: 1, // 1 hora de tolerancia
  },
};

// Roles y permisos
export const ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  OPERARIO: 'operario',
};

export const PERMISSIONS = {
  // Users
  VIEW_ALL_USERS: [ROLES.ADMIN],
  VIEW_AREA_USERS: [ROLES.ADMIN, ROLES.SUPERVISOR],
  CREATE_USER: [ROLES.ADMIN],
  UPDATE_ANY_USER: [ROLES.ADMIN],
  DELETE_USER: [ROLES.ADMIN],

  // Time Entries
  VIEW_ALL_ENTRIES: [ROLES.ADMIN],
  VIEW_AREA_ENTRIES: [ROLES.ADMIN, ROLES.SUPERVISOR],
  CREATE_ENTRY_FOR_OTHERS: [ROLES.ADMIN],
  UPDATE_ANY_ENTRY: [ROLES.ADMIN],
  DELETE_ANY_ENTRY: [ROLES.ADMIN],

  // Organizational Units
  CREATE_ORG_UNIT: [ROLES.ADMIN, ROLES.SUPERVISOR],
  UPDATE_ORG_UNIT: [ROLES.ADMIN, ROLES.SUPERVISOR],
  DELETE_ORG_UNIT: [ROLES.ADMIN],
};

// Helper para verificar permisos
export const hasPermission = (userRole, permission) => {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles && allowedRoles.includes(userRole);
};

export default {
  VALIDATION_RULES,
  ROLES,
  PERMISSIONS,
  hasPermission,
};
