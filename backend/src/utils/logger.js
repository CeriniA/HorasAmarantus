/**
 * Sistema de Logs Centralizado - Backend
 * 
 * - En DEV: Muestra todos los logs en consola con colores
 * - En PROD: Solo muestra errores y warnings
 * 
 * Uso:
 *   import logger from './utils/logger.js';
 *   logger.info('Usuario logueado:', user);
 *   logger.error('Error en DB:', error);
 */

const isDev = process.env.NODE_ENV !== 'production';

// Colores ANSI para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Colores de texto
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Colores de fondo
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m'
};

const formatMessage = (level, color, ...args) => {
  const timestamp = new Date().toISOString();
  const prefix = `${color}[${timestamp}] [${level}]${colors.reset}`;
  return [prefix, ...args];
};

const logger = {
  /**
   * Log general (solo DEV)
   */
  log: (...args) => {
    if (isDev) {
      console.log(...formatMessage('LOG', colors.white, ...args));
    }
  },

  /**
   * Información (solo DEV)
   */
  info: (...args) => {
    if (isDev) {
      console.info(...formatMessage('INFO', colors.cyan, ...args));
    }
  },

  /**
   * Debug detallado (solo DEV)
   */
  debug: (...args) => {
    if (isDev) {
      console.debug(...formatMessage('DEBUG', colors.magenta, ...args));
    }
  },

  /**
   * Advertencias (DEV y PROD)
   */
  warn: (...args) => {
    console.warn(...formatMessage('WARN', colors.yellow, ...args));
  },

  /**
   * Errores (DEV y PROD)
   */
  error: (...args) => {
    console.error(...formatMessage('ERROR', colors.red, ...args));
  },

  /**
   * Errores críticos (SIEMPRE, con fondo rojo)
   */
  critical: (...args) => {
    console.error(...formatMessage('CRITICAL', `${colors.bgRed}${colors.white}${colors.bright}`, ...args));
    // En producción, aquí podrías enviar a un servicio de monitoreo
  },

  /**
   * Éxito (solo DEV)
   */
  success: (...args) => {
    if (isDev) {
      console.log(...formatMessage('SUCCESS', colors.green, ...args));
    }
  }
};

export default logger;
