/**
 * CONFIG - Configuración centralizada de la aplicación
 * 
 * NUNCA hardcodear valores de configuración.
 * SIEMPRE usar estas constantes.
 */

export const CONFIG = {
  // ============================================================================
  // HORARIOS
  // ============================================================================
  DEFAULT_WORKDAY_START: '08:00',
  DEFAULT_WORKDAY_END: '16:00',
  DEFAULT_WORKDAY_HOURS: 8,
  
  // ============================================================================
  // VALIDACIONES
  // ============================================================================
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 100,
  
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  
  MAX_DESCRIPTION_LENGTH: 500,
  
  // ============================================================================
  // PAGINACIÓN
  // ============================================================================
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // ============================================================================
  // SINCRONIZACIÓN OFFLINE
  // ============================================================================
  SYNC_RETRY_DELAY: 5000, // 5 segundos
  MAX_SYNC_RETRIES: 3,
  SYNC_BATCH_SIZE: 10, // Sincronizar de a 10 items
  
  // ============================================================================
  // CACHE
  // ============================================================================
  CACHE_EXPIRATION: 60 * 60 * 1000, // 1 hora en milisegundos
  LOCAL_STORAGE_PREFIX: 'sistema_horas_',
  
  // ============================================================================
  // UI
  // ============================================================================
  TOAST_DURATION: 3000, // 3 segundos
  DEBOUNCE_DELAY: 300, // 300ms
  ANIMATION_DURATION: 200, // 200ms
  
  LOADING_SPINNER_DELAY: 500, // Mostrar spinner después de 500ms
  
  // ============================================================================
  // REPORTES
  // ============================================================================
  DEFAULT_REPORT_RANGE: 'month', // 'week' | 'month' | 'year' | 'custom'
  MAX_REPORT_DAYS: 365, // Máximo 1 año
  
  CHART_COLORS: {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4'
  },
  
  // ============================================================================
  // FORMATOS
  // ============================================================================
  DATE_FORMAT: 'dd/MM/yyyy',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'dd/MM/yyyy HH:mm',
  
  // ============================================================================
  // LÍMITES
  // ============================================================================
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_BULK_ENTRIES: 50, // Máximo de registros en carga masiva
  
  // ============================================================================
  // DESARROLLO
  // ============================================================================
  DEBUG_MODE: import.meta.env.DEV,
  API_TIMEOUT: 30000, // 30 segundos
};

/**
 * Obtener prefijo para localStorage
 * @param {string} key - Clave
 * @returns {string}
 */
export const getStorageKey = (key) => {
  return `${CONFIG.LOCAL_STORAGE_PREFIX}${key}`;
};

/**
 * Verificar si está en modo desarrollo
 * @returns {boolean}
 */
export const isDevelopment = () => {
  return CONFIG.DEBUG_MODE;
};

/**
 * Verificar si está en modo producción
 * @returns {boolean}
 */
export const isProduction = () => {
  return !CONFIG.DEBUG_MODE;
};
