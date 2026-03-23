/**
 * CONSTANTES DEL SISTEMA - ÚNICA FUENTE DE VERDAD
 * 
 * Este archivo define TODAS las constantes que se usan en el sistema.
 * NUNCA hardcodear estos valores en otros archivos.
 * 
 * IMPORTANTE: Estos valores deben coincidir EXACTAMENTE con:
 * 1. Los enums en la base de datos Supabase
 * 2. Las validaciones del backend
 * 3. Las constantes del frontend
 */

// ============================================================================
// ROLES DE USUARIO
// ============================================================================
export const USER_ROLES = {
  SUPERADMIN: 'superadmin',  // Rol máximo del sistema (coincide con DB)
  ADMIN: 'admin',
  OPERARIO: 'operario'
};

// Array de todos los roles válidos (para validaciones)
export const USER_ROLES_ARRAY = Object.values(USER_ROLES);

// ============================================================================
// TIPOS DE UNIDADES ORGANIZACIONALES
// ============================================================================
export const ORG_UNIT_TYPES = {
  AREA: 'area',
  PROCESO: 'proceso',
  SUBPROCESO: 'subproceso',
  TAREA: 'tarea'
};

// Array de todos los tipos válidos (para validaciones)
export const ORG_UNIT_TYPES_ARRAY = Object.values(ORG_UNIT_TYPES);

// Jerarquía de niveles (0-3)
export const ORG_UNIT_LEVELS = {
  [ORG_UNIT_TYPES.AREA]: 0,
  [ORG_UNIT_TYPES.PROCESO]: 1,
  [ORG_UNIT_TYPES.SUBPROCESO]: 2,
  [ORG_UNIT_TYPES.TAREA]: 3
};

// Mapeo de tipo hijo por tipo padre
export const ORG_UNIT_CHILD_TYPE = {
  [ORG_UNIT_TYPES.AREA]: ORG_UNIT_TYPES.PROCESO,
  [ORG_UNIT_TYPES.PROCESO]: ORG_UNIT_TYPES.SUBPROCESO,
  [ORG_UNIT_TYPES.SUBPROCESO]: ORG_UNIT_TYPES.TAREA,
  [ORG_UNIT_TYPES.TAREA]: null // Las tareas no tienen hijos
};

// ============================================================================
// ESTADOS DE TIME ENTRIES
// ============================================================================
export const TIME_ENTRY_STATUS = {
  COMPLETED: 'completed'
  // Nota: El sistema actual solo maneja 'completed' (entrada manual)
  // Si se implementa tracking en tiempo real, agregar: IN_PROGRESS, PAUSED, etc.
};

// Array de todos los estados válidos
export const TIME_ENTRY_STATUS_ARRAY = Object.values(TIME_ENTRY_STATUS);

// ============================================================================
// ESTILOS CSS POR TIPO DE UNIDAD (para frontend)
// ============================================================================
export const ORG_UNIT_STYLES = {
  [ORG_UNIT_TYPES.AREA]: {
    badge: 'bg-purple-100 text-purple-800',
    text: 'text-purple-600',
    bg: 'bg-purple-50'
  },
  [ORG_UNIT_TYPES.PROCESO]: {
    badge: 'bg-blue-100 text-blue-800',
    text: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  [ORG_UNIT_TYPES.SUBPROCESO]: {
    badge: 'bg-green-100 text-green-800',
    text: 'text-green-600',
    bg: 'bg-green-50'
  },
  [ORG_UNIT_TYPES.TAREA]: {
    badge: 'bg-yellow-100 text-yellow-800',
    text: 'text-yellow-600',
    bg: 'bg-yellow-50'
  }
};

// ============================================================================
// LABELS AMIGABLES (para UI)
// ============================================================================
export const USER_ROLE_LABELS = {
  [USER_ROLES.SUPERADMIN]: 'Superadministrador',
  [USER_ROLES.ADMIN]: 'Administrador',
  [USER_ROLES.OPERARIO]: 'Operario'
};

export const ORG_UNIT_TYPE_LABELS = {
  [ORG_UNIT_TYPES.AREA]: 'Área',
  [ORG_UNIT_TYPES.PROCESO]: 'Proceso',
  [ORG_UNIT_TYPES.SUBPROCESO]: 'Subproceso',
  [ORG_UNIT_TYPES.TAREA]: 'Tarea'
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Verificar si un rol es válido
 */
export const isValidRole = (role) => {
  return USER_ROLES_ARRAY.includes(role);
};

/**
 * Verificar si un tipo de unidad es válido
 */
export const isValidOrgUnitType = (type) => {
  return ORG_UNIT_TYPES_ARRAY.includes(type);
};

/**
 * Verificar si un estado de time entry es válido
 */
export const isValidTimeEntryStatus = (status) => {
  return TIME_ENTRY_STATUS_ARRAY.includes(status);
};

/**
 * Obtener el tipo de hijo para un tipo de unidad padre
 */
export const getChildType = (parentType) => {
  return ORG_UNIT_CHILD_TYPE[parentType] || null;
};

/**
 * Obtener el nivel de una unidad por su tipo
 */
export const getUnitLevel = (type) => {
  return ORG_UNIT_LEVELS[type] ?? -1;
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================
export default {
  USER_ROLES,
  USER_ROLES_ARRAY,
  ORG_UNIT_TYPES,
  ORG_UNIT_TYPES_ARRAY,
  ORG_UNIT_LEVELS,
  ORG_UNIT_CHILD_TYPE,
  TIME_ENTRY_STATUS,
  TIME_ENTRY_STATUS_ARRAY,
  ORG_UNIT_STYLES,
  USER_ROLE_LABELS,
  ORG_UNIT_TYPE_LABELS,
  isValidRole,
  isValidOrgUnitType,
  isValidTimeEntryStatus,
  getChildType,
  getUnitLevel
};
