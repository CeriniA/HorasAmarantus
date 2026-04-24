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
// ROLES DE USUARIO (Sistema RBAC)
// ============================================================================
export const USER_ROLES = {
  SUPERADMIN: 'superadmin',  // Rol máximo del sistema
  ADMIN: 'admin',            // Administrador general
  SUPERVISOR: 'supervisor',  // Supervisor de equipos
  TEAM_LEAD: 'team_lead',    // Líder de equipo
  OPERARIO: 'operario'       // Operario básico
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
  [USER_ROLES.SUPERVISOR]: 'Supervisor',
  [USER_ROLES.TEAM_LEAD]: 'Líder de Equipo',
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
  { value: USER_ROLES.SUPERVISOR, label: USER_ROLE_LABELS[USER_ROLES.SUPERVISOR] },
  { value: USER_ROLES.TEAM_LEAD, label: USER_ROLE_LABELS[USER_ROLES.TEAM_LEAD] },
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

// Labels de tipos de objetivos
export const OBJECTIVE_TYPE_LABELS = {
  [OBJECTIVE_TYPES.COMPANY]: 'Empresarial',
  [OBJECTIVE_TYPES.ASSIGNED]: 'Asignado',
  [OBJECTIVE_TYPES.PERSONAL]: 'Personal'
};

// Labels de días de la semana
export const DAY_LABELS = {
  [DAYS_OF_WEEK.SUNDAY]: 'Domingo',
  [DAYS_OF_WEEK.MONDAY]: 'Lunes',
  [DAYS_OF_WEEK.TUESDAY]: 'Martes',
  [DAYS_OF_WEEK.WEDNESDAY]: 'Miércoles',
  [DAYS_OF_WEEK.THURSDAY]: 'Jueves',
  [DAYS_OF_WEEK.FRIDAY]: 'Viernes',
  [DAYS_OF_WEEK.SATURDAY]: 'Sábado'
};

// Labels cortos de días
export const DAY_LABELS_SHORT = {
  [DAYS_OF_WEEK.SUNDAY]: 'Dom',
  [DAYS_OF_WEEK.MONDAY]: 'Lun',
  [DAYS_OF_WEEK.TUESDAY]: 'Mar',
  [DAYS_OF_WEEK.WEDNESDAY]: 'Mié',
  [DAYS_OF_WEEK.THURSDAY]: 'Jue',
  [DAYS_OF_WEEK.FRIDAY]: 'Vie',
  [DAYS_OF_WEEK.SATURDAY]: 'Sáb'
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

export const OBJECTIVE_STATUS_LABELS = {
  [OBJECTIVE_STATUS.PLANNED]: 'Planificado',
  [OBJECTIVE_STATUS.IN_PROGRESS]: 'En Progreso',
  [OBJECTIVE_STATUS.COMPLETED]: 'Completado',
  [OBJECTIVE_STATUS.OVERDUE]: 'Vencido',
  [OBJECTIVE_STATUS.FAILED]: 'No Cumplido',
  [OBJECTIVE_STATUS.CANCELLED]: 'Cancelado'
};

export const OBJECTIVE_STATUS_COLORS = {
  [OBJECTIVE_STATUS.PLANNED]: 'bg-gray-100 text-gray-800',
  [OBJECTIVE_STATUS.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [OBJECTIVE_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  [OBJECTIVE_STATUS.OVERDUE]: 'bg-orange-100 text-orange-800',
  [OBJECTIVE_STATUS.FAILED]: 'bg-red-100 text-red-800',
  [OBJECTIVE_STATUS.CANCELLED]: 'bg-gray-200 text-gray-600'
};

/**
 * Helper para construir clave de permiso
 */
export const buildPermissionKey = (resource, action, scope = SCOPES.ALL) => {
  return `${resource}.${action}.${scope}`;
};

/**
 * Helper para parsear clave de permiso
 */
export const parsePermissionKey = (key) => {
  const [resource, action, scope = SCOPES.ALL] = key.split('.');
  return { resource, action, scope };
};

// ============================================================================
// CONSTANTES DE REPORTES
// ============================================================================
export const REPORT_CONSTANTS = {
  // Horas estándar
  STANDARD_DAILY_HOURS: 8,
  STANDARD_WEEKLY_HOURS: 40,
  
  // Metas por defecto
  DEFAULT_WEEKLY_GOAL: 40,
  DEFAULT_MONTHLY_GOAL: 160,
  DAILY_GOAL_HOURS: 8,
  
  // Configuración de reportes
  MAX_USERS_COMPARISON: 5,
  ENTRIES_PER_PAGE_DETAIL: 20,
  MAX_MONTHS_TRENDS: 12,
  
  // Colores para gráficos
  COMPARISON_COLORS: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16']
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
  ORG_UNIT_TYPE_LABELS_PLURAL,
  ROLE_OPTIONS,
  ORG_UNIT_TYPE_OPTIONS,
  STATUS_OPTIONS,
  RESOURCES,
  ACTIONS,
  SCOPES,
  OBJECTIVE_TYPES,
  OBJECTIVE_TYPE_LABELS,
  DAYS_OF_WEEK,
  DAY_LABELS,
  DAY_LABELS_SHORT,
  OBJECTIVE_STATUS,
  OBJECTIVE_STATUS_LABELS,
  REPORT_CONSTANTS,
  buildPermissionKey,
  parsePermissionKey,
  isValidRole,
  isValidOrgUnitType,
  isValidTimeEntryStatus,
  getChildType,
  getUnitLevel,
  getUnitStyle,
  getRoleLabel,
  getUnitTypeLabel
};

// ============================================================================
// EXPORTS DE CONSTANTES ADICIONALES
// ============================================================================
export * from './validation';
export * from './sync';
export * from './pagination';
