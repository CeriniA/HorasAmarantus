/**
 * ============================================
 * MIDDLEWARE DE MANEJO DE ERRORES
 * ============================================
 * 
 * Sistema centralizado de manejo de errores.
 * Todos los errores de la aplicación pasan por aquí.
 * 
 * Uso:
 *   import { errorHandler, AppError } from './middleware/errorHandler.js';
 *   app.use(errorHandler);
 */

import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * ============================================
 * CLASE DE ERROR PERSONALIZADA
 * ============================================
 */
export class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * ============================================
 * TIPOS DE ERRORES ESPECÍFICOS
 * ============================================
 */

export class ValidationError extends AppError {
  constructor(message = ERROR_MESSAGES.VALIDATION_ERROR, errors = []) {
    super(message, HTTP_STATUS.BAD_REQUEST);
    this.errors = errors;
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message, HTTP_STATUS.UNAUTHORIZED);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = ERROR_MESSAGES.FORBIDDEN) {
    super(message, HTTP_STATUS.FORBIDDEN);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = ERROR_MESSAGES.NOT_FOUND) {
    super(message, HTTP_STATUS.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = ERROR_MESSAGES.ALREADY_EXISTS) {
    super(message, HTTP_STATUS.CONFLICT);
    this.name = 'ConflictError';
  }
}

export class DatabaseError extends AppError {
  constructor(message = ERROR_MESSAGES.DATABASE_ERROR) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    this.name = 'DatabaseError';
  }
}

/**
 * ============================================
 * MIDDLEWARE DE MANEJO DE ERRORES
 * ============================================
 */

/**
 * Formatea el error para la respuesta
 */
const formatErrorResponse = (err, includeStack = false) => {
  const response = {
    success: false,
    error: {
      message: err.message || ERROR_MESSAGES.INTERNAL_ERROR,
      statusCode: err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      timestamp: err.timestamp || new Date().toISOString(),
    }
  };

  // Agregar errores de validación si existen
  if (err.errors && Array.isArray(err.errors)) {
    response.error.errors = err.errors;
  }

  // Agregar stack trace en desarrollo
  if (includeStack && err.stack) {
    response.error.stack = err.stack;
  }

  return response;
};

/**
 * Middleware principal de manejo de errores
 */
export const errorHandler = (err, req, res, next) => {
  // Log del error
  if (err.isOperational) {
    logger.warn('Error operacional:', {
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  } else {
    logger.error('Error no manejado:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  }

  // Determinar si incluir stack trace
  const includeStack = config.isDevelopment;

  // Formatear y enviar respuesta
  const response = formatErrorResponse(err, includeStack);
  
  res.status(err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
};

/**
 * ============================================
 * MIDDLEWARE DE RUTA NO ENCONTRADA
 * ============================================
 */
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Ruta no encontrada: ${req.method} ${req.path}`);
  next(error);
};

/**
 * ============================================
 * WRAPPER PARA ASYNC HANDLERS
 * ============================================
 * 
 * Envuelve funciones async para capturar errores automáticamente
 * 
 * Uso:
 *   router.get('/users', asyncHandler(async (req, res) => {
 *     const users = await getUsers();
 *     res.json(users);
 *   }));
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * ============================================
 * MANEJO DE ERRORES NO CAPTURADOS
 * ============================================
 */

/**
 * Maneja errores no capturados (unhandled rejections)
 */
export const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', {
      reason,
      promise,
    });
    
    // En producción, cerrar el servidor gracefully
    if (config.isProduction) {
      process.exit(1);
    }
  });
};

/**
 * Maneja excepciones no capturadas (uncaught exceptions)
 */
export const handleUncaughtException = () => {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', {
      message: error.message,
      stack: error.stack,
    });
    
    // Cerrar el servidor inmediatamente
    process.exit(1);
  });
};

/**
 * ============================================
 * HELPERS
 * ============================================
 */

/**
 * Crea un error de validación desde express-validator
 */
export const createValidationError = (errors) => {
  const formattedErrors = errors.map(err => ({
    field: err.path || err.param,
    message: err.msg,
    value: err.value,
  }));
  
  return new ValidationError('Errores de validación', formattedErrors);
};

/**
 * Verifica si un error es operacional
 */
export const isOperationalError = (error) => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

/**
 * ============================================
 * EXPORT DEFAULT
 * ============================================
 */
export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  createValidationError,
  isOperationalError,
  handleUnhandledRejection,
  handleUncaughtException,
};
