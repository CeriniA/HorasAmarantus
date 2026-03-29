/**
 * Sistema de Logs Centralizado - Frontend
 * 
 * - En DEV: Muestra todos los logs en consola
 * - En PROD: Solo muestra errores críticos
 * 
 * Uso:
 *   import logger from '@/utils/logger';
 *   logger.info('Usuario logueado:', user);
 *   logger.error('Error en API:', error);
 */

const isDev = import.meta.env.DEV;

const formatMessage = (level, ...args) => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  return [`[${timestamp}] [${level}]`, ...args];
};

export const logger = {
  /**
   * Log general (solo DEV)
   */
  log: (...args) => {
    if (isDev) {
      console.log(...formatMessage('LOG', ...args));
    }
  },

  /**
   * Información (solo DEV)
   */
  info: (...args) => {
    if (isDev) {
      console.info(...formatMessage('INFO', ...args));
    }
  },

  /**
   * Debug detallado (solo DEV)
   */
  debug: (...args) => {
    if (isDev) {
      console.debug(...formatMessage('DEBUG', ...args));
    }
  },

  /**
   * Advertencias (solo DEV)
   */
  warn: (...args) => {
    if (isDev) {
      console.warn(...formatMessage('WARN', ...args));
    }
  },

  /**
   * Errores (solo DEV)
   */
  error: (...args) => {
    if (isDev) {
      console.error(...formatMessage('ERROR', ...args));
    }
  },

  /**
   * Errores críticos (SIEMPRE se muestran, incluso en PROD)
   */
  critical: (...args) => {
    console.error(...formatMessage('CRITICAL', ...args));
    // En producción, aquí podrías enviar a un servicio de monitoreo (Sentry, etc.)
  }
};

export default logger;
