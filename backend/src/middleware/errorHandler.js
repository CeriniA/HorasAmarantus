/**
 * Middleware centralizado de manejo de errores
 */

import { config } from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * Clase base para errores personalizados
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // Error esperado vs error de programación
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Errores específicos
 */
export class ValidationError extends AppError {
  constructor(message, errors = null) {
    super(message, 400, errors);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflicto con el estado actual') {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Demasiadas peticiones') {
    super(message, 429);
  }
}

/**
 * Formatear errores de Supabase
 */
const formatSupabaseError = (error) => {
  if (error.code === '23505') {
    return new ConflictError('El registro ya existe');
  }
  
  if (error.code === '23503') {
    return new ValidationError('Referencia inválida');
  }
  
  if (error.code === '23502') {
    return new ValidationError('Campo requerido faltante');
  }
  
  return new AppError(error.message || 'Error de base de datos', 500);
};

/**
 * Middleware de manejo de errores 404
 */
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Ruta no encontrada: ${req.method} ${req.path}`);
  next(error);
};

/**
 * Middleware principal de manejo de errores
 */
export const errorHandler = (err, req, res, next) => {
  // Si es un error de Supabase, formatearlo
  if (err.code && err.code.startsWith('23')) {
    err = formatSupabaseError(err);
  }
  
  // Si no es un AppError, convertirlo
  if (!(err instanceof AppError)) {
    err = new AppError(
      err.message || 'Error interno del servidor',
      err.statusCode || 500
    );
  }
  
  // Log del error
  if (config.isDevelopment || err.statusCode >= 500) {
    logger.error('❌ Error:', {
      message: err.message,
      status: err.statusCode,
      path: req.path,
      method: req.method,
      stack: config.isDevelopment ? err.stack : undefined,
      errors: err.errors,
    });
  }
  
  // Respuesta al cliente
  const response = {
    error: err.message,
    status: err.statusCode,
  };
  
  // Agregar detalles solo en desarrollo
  if (config.isDevelopment) {
    response.stack = err.stack;
    response.path = req.path;
    response.method = req.method;
  }
  
  // Agregar errores de validación si existen
  if (err.errors) {
    response.errors = err.errors;
  }
  
  res.status(err.statusCode).json(response);
};

/**
 * Wrapper para async handlers
 * Evita tener que hacer try-catch en cada ruta
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Helper para validar y lanzar errores
 */
export const assert = (condition, message, StatusCode = 400) => {
  if (!condition) {
    throw new AppError(message, StatusCode);
  }
};

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  assert,
};
