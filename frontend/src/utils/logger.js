/**
 * Logger utility - Solo muestra logs en desarrollo
 * En producción, los logs no se muestran en consola
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },

  error: (...args) => {
    if (isDev) {
      console.error(...args);
    }
  },

  warn: (...args) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  info: (...args) => {
    if (isDev) {
      console.info(...args);
    }
  },

  debug: (...args) => {
    if (isDev) {
      console.debug(...args);
    }
  },

  // Para errores críticos que siempre deben mostrarse
  critical: (...args) => {
    console.error('[CRITICAL]', ...args);
  }
};

export default logger;
