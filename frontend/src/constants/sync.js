/**
 * Constantes de Sincronización
 * Configuración para el sistema de sincronización offline
 */

export const SYNC_CONFIG = {
  // Intervalo de sincronización automática
  AUTO_SYNC_INTERVAL: 30000, // 30 segundos
  
  // Reintentos
  MAX_RETRIES: 5,
  
  // Exponential backoff
  BACKOFF_BASE_DELAY: 1000, // 1 segundo
  BACKOFF_MAX_DELAY: 60000, // 60 segundos
  
  // Timeouts
  REQUEST_TIMEOUT: 10000, // 10 segundos
  
  // Batch sizes
  BATCH_SIZE: 10, // Items por batch
};

export default SYNC_CONFIG;
