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
// ROLES DE USUARIO (Sistema RBAC)
// ============================================================================
export const USER_ROLES = {
  SUPERADMIN: 'superadmin',  // Rol máximo del sistema
  ADMIN: 'admin',            // Administrador general
  SUPERVISOR: 'supervisor',  // Supervisor de equipos
  TEAM_LEAD: 'team_lead',    // Líder de equipo
  OPERARIO: 'operario'       // Operario básico
};

// Array de todos los roles válidos (para validaciones)
export const USER_ROLES_ARRAY = Object.values(USER_ROLES);

// Labels amigables para roles
export const USER_ROLE_LABELS = {
  [USER_ROLES.SUPERADMIN]: 'Superadministrador',
  [USER_ROLES.ADMIN]: 'Administrador',
  [USER_ROLES.SUPERVISOR]: 'Supervisor',
  [USER_ROLES.TEAM_LEAD]: 'Líder de Equipo',
  [USER_ROLES.OPERARIO]: 'Operario'
};

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
// CATÁLOGO DE PERMISOS RBAC
// ============================================================================

// Recursos del sistema
export const RESOURCES = {
  USERS: 'users',
  TIME_ENTRIES: 'time_entries',
  ORG_UNITS: 'org_units',
  OBJECTIVES: 'objectives',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  ROLES: 'roles',
  PERMISSIONS: 'permissions'
};

// Acciones disponibles
export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  EXPORT: 'export',
  IMPORT: 'import',
  ACTIVATE: 'activate',
  COMPLETE: 'complete',
  MANAGE: 'manage',
  ASSIGN: 'assign'
};

// Alcances de permisos
export const SCOPES = {
  ALL: 'all',      // Todos los registros
  TEAM: 'team',    // Solo del equipo/área
  OWN: 'own'       // Solo propios
};

// Tipos de objetivos (para permisos)
export const OBJECTIVE_TYPES = {
  COMPANY: 'company',     // Objetivos empresariales
  ASSIGNED: 'assigned',   // Objetivos asignados por admin
  PERSONAL: 'personal'    // Objetivos personales
};

// Estados de objetivos
export const OBJECTIVE_STATUS = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

export const OBJECTIVE_STATUS_ARRAY = Object.values(OBJECTIVE_STATUS);

// Diagnósticos de objetivos (para análisis)
export const OBJECTIVE_DIAGNOSIS = {
  EFFICIENT_SUCCESS: 'efficient_success',
  COSTLY_SUCCESS: 'costly_success',
  INCOMPLETE_FAILURE: 'incomplete_failure',
  TOTAL_FAILURE: 'total_failure'
};

// Días de la semana (para distribución semanal)
export const DAYS_OF_WEEK = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6
};

// NOTA: Los helpers buildPermissionKey y parsePermissionKey
// fueron movidos a utils/permissionHelpers.js

// ============================================================================
// LABELS AMIGABLES (para UI)
// ============================================================================

export const ORG_UNIT_TYPE_LABELS = {
  [ORG_UNIT_TYPES.AREA]: 'Área',
  [ORG_UNIT_TYPES.PROCESO]: 'Proceso',
  [ORG_UNIT_TYPES.SUBPROCESO]: 'Subproceso',
  [ORG_UNIT_TYPES.TAREA]: 'Tarea'
};

export const OBJECTIVE_TYPE_LABELS = {
  [OBJECTIVE_TYPES.COMPANY]: 'Empresarial',
  [OBJECTIVE_TYPES.ASSIGNED]: 'Asignado',
  [OBJECTIVE_TYPES.PERSONAL]: 'Personal'
};

export const DAY_LABELS = {
  [DAYS_OF_WEEK.SUNDAY]: 'Domingo',
  [DAYS_OF_WEEK.MONDAY]: 'Lunes',
  [DAYS_OF_WEEK.TUESDAY]: 'Martes',
  [DAYS_OF_WEEK.WEDNESDAY]: 'Miércoles',
  [DAYS_OF_WEEK.THURSDAY]: 'Jueves',
  [DAYS_OF_WEEK.FRIDAY]: 'Viernes',
  [DAYS_OF_WEEK.SATURDAY]: 'Sábado'
};

export const DAY_LABELS_SHORT = {
  [DAYS_OF_WEEK.SUNDAY]: 'Dom',
  [DAYS_OF_WEEK.MONDAY]: 'Lun',
  [DAYS_OF_WEEK.TUESDAY]: 'Mar',
  [DAYS_OF_WEEK.WEDNESDAY]: 'Mié',
  [DAYS_OF_WEEK.THURSDAY]: 'Jue',
  [DAYS_OF_WEEK.FRIDAY]: 'Vie',
  [DAYS_OF_WEEK.SATURDAY]: 'Sáb'
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
  USER_ROLE_LABELS,
  ORG_UNIT_TYPES,
  ORG_UNIT_TYPES_ARRAY,
  ORG_UNIT_LEVELS,
  ORG_UNIT_CHILD_TYPE,
  TIME_ENTRY_STATUS,
  TIME_ENTRY_STATUS_ARRAY,
  ORG_UNIT_STYLES,
  ORG_UNIT_TYPE_LABELS,
  RESOURCES,
  ACTIONS,
  SCOPES,
  OBJECTIVE_TYPES,
  OBJECTIVE_TYPE_LABELS,
  OBJECTIVE_STATUS,
  OBJECTIVE_STATUS_ARRAY,
  OBJECTIVE_DIAGNOSIS,
  DAYS_OF_WEEK,
  DAY_LABELS,
  DAY_LABELS_SHORT,
  // buildPermissionKey y parsePermissionKey movidos a utils/permissionHelpers.js
  isValidRole,
  isValidOrgUnitType,
  isValidTimeEntryStatus,
  getChildType,
  getUnitLevel
};
