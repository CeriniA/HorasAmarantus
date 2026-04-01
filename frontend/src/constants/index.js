/**
 * CONSTANTES DEL SISTEMA - ÚNICA FUENTE DE VERDAD (FRONTEND)
 * 
 * Este archivo debe estar SINCRONIZADO con backend/src/models/constants.js
 * NUNCA hardcodear estos valores en otros archivos del frontend.
 * 
 * IMPORTANTE: Estos valores deben coincidir EXACTAMENTE con:
 * 1. Las constantes del backend
 * 2. Los enums en la base de datos Supabase
 */

// ============================================================================
// ROLES DE USUARIO
// ============================================================================
export const USER_ROLES = {
  SUPERADMIN: 'superadmin',  // Rol máximo del sistema (coincide con DB)
  ADMIN: 'admin',
  OPERARIO: 'operario'
};

// Array de todos los roles válidos
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

// Array de todos los tipos válidos
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
  COMPLETED: 'completed',
  IN_PROGRESS: 'in_progress', // Para futuro uso con tracking en tiempo real
  PENDING: 'pending' // Para sincronización offline
};

// Array de todos los estados válidos
export const TIME_ENTRY_STATUS_ARRAY = Object.values(TIME_ENTRY_STATUS);

// ============================================================================
// ESTILOS CSS POR TIPO DE UNIDAD
// ============================================================================
export const ORG_UNIT_STYLES = {
  [ORG_UNIT_TYPES.AREA]: {
    badge: 'bg-purple-100 text-purple-800',
    text: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200'
  },
  [ORG_UNIT_TYPES.PROCESO]: {
    badge: 'bg-blue-100 text-blue-800',
    text: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  [ORG_UNIT_TYPES.SUBPROCESO]: {
    badge: 'bg-green-100 text-green-800',
    text: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200'
  },
  [ORG_UNIT_TYPES.TAREA]: {
    badge: 'bg-yellow-100 text-yellow-800',
    text: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200'
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

export const ORG_UNIT_TYPE_LABELS_PLURAL = {
  [ORG_UNIT_TYPES.AREA]: 'Áreas',
  [ORG_UNIT_TYPES.PROCESO]: 'Procesos',
  [ORG_UNIT_TYPES.SUBPROCESO]: 'Subprocesos',
  [ORG_UNIT_TYPES.TAREA]: 'Tareas'
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

/**
 * Obtener el estilo CSS para un tipo de unidad
 */
export const getUnitStyle = (type, styleType = 'badge') => {
  return ORG_UNIT_STYLES[type]?.[styleType] || '';
};

/**
 * Obtener el label amigable de un rol
 */
export const getRoleLabel = (role) => {
  return USER_ROLE_LABELS[role] || role;
};

/**
 * Obtener el label amigable de un tipo de unidad
 */
export const getUnitTypeLabel = (type, plural = false) => {
  if (plural) {
    return ORG_UNIT_TYPE_LABELS_PLURAL[type] || type;
  }
  return ORG_UNIT_TYPE_LABELS[type] || type;
};

// ============================================================================
// OPCIONES PARA SELECTS
// ============================================================================

/**
 * Opciones de roles para componentes Select
 */
export const ROLE_OPTIONS = [
  { value: USER_ROLES.SUPERADMIN, label: USER_ROLE_LABELS[USER_ROLES.SUPERADMIN] },
  { value: USER_ROLES.ADMIN, label: USER_ROLE_LABELS[USER_ROLES.ADMIN] },
  { value: USER_ROLES.OPERARIO, label: USER_ROLE_LABELS[USER_ROLES.OPERARIO] }
];

/**
 * Opciones de tipos de unidad para componentes Select
 */
export const ORG_UNIT_TYPE_OPTIONS = [
  { value: ORG_UNIT_TYPES.AREA, label: ORG_UNIT_TYPE_LABELS[ORG_UNIT_TYPES.AREA] },
  { value: ORG_UNIT_TYPES.PROCESO, label: ORG_UNIT_TYPE_LABELS[ORG_UNIT_TYPES.PROCESO] },
  { value: ORG_UNIT_TYPES.SUBPROCESO, label: ORG_UNIT_TYPE_LABELS[ORG_UNIT_TYPES.SUBPROCESO] },
  { value: ORG_UNIT_TYPES.TAREA, label: ORG_UNIT_TYPE_LABELS[ORG_UNIT_TYPES.TAREA] }
];

/**
 * Opciones de estados para componentes Select
 */
export const STATUS_OPTIONS = [
  { value: TIME_ENTRY_STATUS.COMPLETED, label: 'Completado' },
  { value: TIME_ENTRY_STATUS.IN_PROGRESS, label: 'En Progreso' },
  { value: TIME_ENTRY_STATUS.PENDING, label: 'Pendiente' }
];

// ============================================================================
// CONSTANTES DE REPORTES
// ============================================================================
export const REPORT_CONSTANTS = {
  DAILY_GOAL_HOURS: 8,
  MAX_USERS_COMPARISON: 5,
  ENTRIES_PER_PAGE_DETAIL: 20,
  MAX_MONTHS_TRENDS: 12,
  COMPARISON_COLORS: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16']
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
  ORG_UNIT_TYPE_LABELS_PLURAL,
  ROLE_OPTIONS,
  ORG_UNIT_TYPE_OPTIONS,
  STATUS_OPTIONS,
  REPORT_CONSTANTS,
  isValidRole,
  isValidOrgUnitType,
  isValidTimeEntryStatus,
  getChildType,
  getUnitLevel,
  getUnitStyle,
  getRoleLabel,
  getUnitTypeLabel
};
