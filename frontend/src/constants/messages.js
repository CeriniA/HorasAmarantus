/**
 * MESSAGES - Mensajes centralizados de la aplicación
 * 
 * NUNCA hardcodear mensajes en componentes.
 * SIEMPRE usar estas constantes.
 */

export const MESSAGES = {
  // ============================================================================
  // ÉXITO
  // ============================================================================
  USER_CREATED_SUCCESS: 'Usuario creado exitosamente',
  USER_UPDATED_SUCCESS: 'Usuario actualizado exitosamente',
  USER_DELETED_SUCCESS: 'Usuario eliminado exitosamente',
  
  ENTRY_CREATED_SUCCESS: 'Registro creado exitosamente',
  ENTRY_UPDATED_SUCCESS: 'Registro actualizado exitosamente',
  ENTRY_DELETED_SUCCESS: 'Registro eliminado exitosamente',
  ENTRIES_CREATED_SUCCESS: (count) => `${count} ${count === 1 ? 'registro creado' : 'registros creados'} exitosamente`,
  
  UNIT_CREATED_SUCCESS: 'Unidad organizacional creada exitosamente',
  UNIT_UPDATED_SUCCESS: 'Unidad organizacional actualizada exitosamente',
  UNIT_DELETED_SUCCESS: 'Unidad organizacional eliminada exitosamente',
  
  PROFILE_UPDATED_SUCCESS: 'Perfil actualizado exitosamente',
  PASSWORD_UPDATED_SUCCESS: 'Contraseña actualizada exitosamente',
  
  // ============================================================================
  // ERRORES
  // ============================================================================
  NO_PERMISSION: 'No tienes permisos para realizar esta acción',
  NO_PERMISSION_EDIT_USER: 'No tienes permisos para editar este usuario',
  NO_PERMISSION_DELETE_USER: 'No tienes permisos para eliminar este usuario',
  NO_PERMISSION_CREATE_USER: 'No tienes permisos para crear usuarios con este rol',
  
  INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos',
  REQUIRED_FIELDS: 'Por favor completa todos los campos requeridos',
  REQUIRED_FIELDS_SPECIFIC: (fields) => `Los siguientes campos son requeridos: ${fields.join(', ')}`,
  
  INVALID_EMAIL: 'El email no es válido',
  INVALID_PASSWORD: 'La contraseña debe tener al menos 6 caracteres',
  INVALID_USERNAME: 'El nombre de usuario no es válido',
  
  PASSWORDS_DO_NOT_MATCH: 'Las contraseñas no coinciden',
  
  ERROR_LOADING_DATA: 'Error al cargar los datos',
  ERROR_SAVING_DATA: 'Error al guardar los datos',
  ERROR_DELETING_DATA: 'Error al eliminar los datos',
  
  NETWORK_ERROR: 'Error de conexión. Por favor verifica tu internet.',
  SERVER_ERROR: 'Error del servidor. Por favor intenta más tarde.',
  
  // ============================================================================
  // CONFIRMACIONES
  // ============================================================================
  CONFIRM_DELETE_USER: (name) => `¿Estás seguro de eliminar al usuario ${name}?`,
  CONFIRM_DELETE_ENTRY: '¿Estás seguro de eliminar este registro?',
  CONFIRM_DELETE_UNIT: (name) => `¿Estás seguro de eliminar la unidad "${name}"?`,
  CONFIRM_LOGOUT: '¿Estás seguro de cerrar sesión?',
  
  CONFIRM_DISCARD_CHANGES: '¿Estás seguro de descartar los cambios?',
  
  // ============================================================================
  // ADVERTENCIAS
  // ============================================================================
  UNSAVED_CHANGES: 'Tienes cambios sin guardar',
  HOURS_MISMATCH: (taskHours, rangeHours) => 
    `Las horas por tarea (${taskHours}h) no coinciden con el rango horario (${rangeHours}h)`,
  
  // ============================================================================
  // OFFLINE / SYNC
  // ============================================================================
  SAVED_OFFLINE: 'Guardado localmente (se sincronizará cuando haya conexión)',
  SYNCING: 'Sincronizando...',
  SYNC_COMPLETE: 'Sincronización completada',
  SYNC_ERROR: 'Error al sincronizar. Se reintentará automáticamente.',
  
  OFFLINE_MODE: 'Modo offline - Los cambios se sincronizarán cuando vuelva la conexión',
  ONLINE_MODE: 'Conexión restaurada',
  
  // ============================================================================
  // INFORMACIÓN
  // ============================================================================
  NO_DATA: 'No hay datos para mostrar',
  NO_RESULTS: 'No se encontraron resultados',
  LOADING: 'Cargando...',
  
  EMPTY_TIME_ENTRIES: 'No tienes registros de tiempo',
  EMPTY_USERS: 'No hay usuarios registrados',
  EMPTY_UNITS: 'No hay unidades organizacionales',
  
  // ============================================================================
  // VALIDACIONES
  // ============================================================================
  MIN_LENGTH: (field, min) => `${field} debe tener al menos ${min} caracteres`,
  MAX_LENGTH: (field, max) => `${field} no puede tener más de ${max} caracteres`,
  
  INVALID_DATE: 'La fecha no es válida',
  INVALID_TIME: 'La hora no es válida',
  INVALID_RANGE: 'El rango de fechas no es válido',
  
  // ============================================================================
  // REPORTES
  // ============================================================================
  REPORT_GENERATED: 'Reporte generado exitosamente',
  REPORT_EXPORTED: 'Reporte exportado exitosamente',
  REPORT_ERROR: 'Error al generar el reporte',
  
  // ============================================================================
  // ADMIN
  // ============================================================================
  ADMIN_NOTE_REPORTS: 'Para ver datos de otros usuarios, ve a la sección de Reportes',
  ADMIN_NOTE_PERSONAL_VIEW: 'Esta sección muestra solo tus propios registros',
};

/**
 * Obtener mensaje de error genérico con detalles
 * @param {string} action - Acción que falló
 * @param {string} error - Mensaje de error
 * @returns {string}
 */
export const getErrorMessage = (action, error) => {
  return `Error al ${action}: ${error}`;
};

/**
 * Obtener mensaje de éxito genérico
 * @param {string} action - Acción completada
 * @returns {string}
 */
export const getSuccessMessage = (action) => {
  return `${action} exitosamente`;
};
