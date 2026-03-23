/**
 * ============================================
 * SISTEMA DE LOGGING
 * ============================================
 * 
 * Logger centralizado para toda la aplicación.
 * Usa Winston para logging estructurado.
 * 
 * Uso:
 *   import { logger } from './utils/logger.js';
 *   logger.info('Usuario creado', { userId: '123' });
 *   logger.error('Error en DB', { error: err.message });
 */

import winston from 'winston';
import { config } from '../config/env.js';

/**
 * ============================================
 * CONFIGURACIÓN DE FORMATOS
 * ============================================
 */

// Formato para consola (desarrollo)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    
    // Agregar metadata si existe
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return msg;
  })
);

// Formato para archivos (producción)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * ============================================
 * CONFIGURACIÓN DE TRANSPORTS
 * ============================================
 */

const transports = [];

// Console transport (siempre activo en desarrollo)
if (config.isDevelopment) {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// File transports (producción)
if (config.isProduction) {
  // Logs generales
  transports.push(
    new winston.transports.File({
      filename: config.logging.file,
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
  
  // Logs de errores
  transports.push(
    new winston.transports.File({
      filename: config.logging.errorFile,
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

/**
 * ============================================
 * CREAR LOGGER
 * ============================================
 */

export const logger = winston.createLogger({
  level: config.logging.level,
  format: fileFormat,
  transports,
  exitOnError: false,
});

/**
 * ============================================
 * MÉTODOS PERSONALIZADOS
 * ============================================
 */

/**
 * Log de request HTTP
 */
logger.logRequest = (req, res, duration) => {
  const logData = {
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  };
  
  if (res.statusCode >= 400) {
    logger.warn('HTTP Request', logData);
  } else {
    logger.info('HTTP Request', logData);
  }
};

/**
 * Log de autenticación
 */
logger.logAuth = (action, userId, success, details = {}) => {
  logger.info('Auth Event', {
    action,
    userId,
    success,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log de base de datos
 */
logger.logDatabase = (operation, table, success, details = {}) => {
  const level = success ? 'info' : 'error';
  logger[level]('Database Operation', {
    operation,
    table,
    success,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log de eventos del sistema
 */
logger.logEvent = (event, data = {}) => {
  logger.info('System Event', {
    event,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * ============================================
 * MIDDLEWARE DE LOGGING
 * ============================================
 */

/**
 * Middleware para loggear todas las requests
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Capturar cuando la respuesta termina
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logRequest(req, res, duration);
  });
  
  next();
};

/**
 * ============================================
 * HELPERS
 * ============================================
 */

/**
 * Sanitiza datos sensibles antes de loggear
 */
export const sanitizeLogData = (data) => {
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
  const sanitized = { ...data };
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  }
  
  return sanitized;
};

/**
 * Crea un logger hijo con contexto específico
 */
export const createChildLogger = (context) => {
  return logger.child({ context });
};

/**
 * ============================================
 * EXPORT DEFAULT
 * ============================================
 */
export default logger;
