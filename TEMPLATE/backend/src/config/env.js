/**
 * ============================================
 * CONFIGURACIÓN DE VARIABLES DE ENTORNO
 * ============================================
 * 
 * Archivo base para gestión centralizada de variables de entorno.
 * Incluye validación automática y valores por defecto.
 * 
 * Uso:
 *   import { config } from './config/env.js';
 *   console.log(config.port);
 */

import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Validar que una variable de entorno exista
 * @param {string} key - Nombre de la variable
 * @param {any} defaultValue - Valor por defecto (opcional)
 * @returns {string} Valor de la variable
 * @throws {Error} Si la variable no existe y no hay default
 */
const requireEnv = (key, defaultValue = undefined) => {
  const value = process.env[key] || defaultValue;
  
  if (value === undefined) {
    throw new Error(`❌ Variable de entorno requerida no encontrada: ${key}`);
  }
  
  return value;
};

/**
 * Configuración centralizada de la aplicación
 * Todas las variables de entorno se acceden desde aquí
 */
export const config = {
  // ============================================
  // AMBIENTE
  // ============================================
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  // ============================================
  // SERVIDOR
  // ============================================
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || 'localhost',
  
  // ============================================
  // BASE DE DATOS
  // ============================================
  database: {
    // Supabase
    supabase: {
      url: requireEnv('SUPABASE_URL'),
      serviceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
      anonKey: process.env.SUPABASE_ANON_KEY || '',
    },
    
    // PostgreSQL directo (alternativa)
    postgres: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'myapp',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    },
  },
  
  // ============================================
  // AUTENTICACIÓN
  // ============================================
  jwt: {
    secret: requireEnv('JWT_SECRET', 'default-secret-CHANGE-IN-PRODUCTION'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  
  // ============================================
  // CORS
  // ============================================
  cors: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    allowedOrigins: process.env.NODE_ENV === 'production'
      ? (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '').split(',').map(o => o.trim()).filter(Boolean)
      : [
          'http://localhost:5173',
          'http://localhost:3000',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:3000',
          process.env.FRONTEND_URL
        ].filter(Boolean),
  },
  
  // ============================================
  // RATE LIMITING
  // ============================================
  rateLimit: {
    enabled: process.env.NODE_ENV === 'production' || process.env.ENABLE_RATE_LIMIT === 'true',
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
    maxRequests: process.env.NODE_ENV === 'production' 
      ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
      : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 10),
  },
  
  // ============================================
  // EMAIL
  // ============================================
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@myapp.com',
  },
  
  // ============================================
  // LOGGING
  // ============================================
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    file: process.env.LOG_FILE || 'logs/app.log',
    errorFile: process.env.LOG_ERROR_FILE || 'logs/error.log',
  },
  
  // ============================================
  // UPLOADS
  // ============================================
  uploads: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880', 10), // 5MB
    allowedTypes: (process.env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(','),
    destination: process.env.UPLOAD_DESTINATION || 'uploads/',
  },
};

/**
 * Validar configuración al inicio
 * Verifica que todas las variables críticas estén presentes y sean válidas
 */
export const validateConfig = () => {
  const errors = [];
  
  // Validar Base de Datos
  if (config.database.supabase.url && !config.database.supabase.url.startsWith('http')) {
    errors.push('SUPABASE_URL debe ser una URL válida');
  }
  
  if (config.database.supabase.serviceRoleKey && config.database.supabase.serviceRoleKey.length < 20) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY parece inválida (muy corta)');
  }
  
  // Validar JWT
  if (config.isProduction && config.jwt.secret === 'default-secret-CHANGE-IN-PRODUCTION') {
    errors.push('JWT_SECRET debe cambiarse en producción');
  }
  
  if (config.jwt.secret.length < 32) {
    errors.push('JWT_SECRET debe tener al menos 32 caracteres');
  }
  
  // Validar Puerto
  if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
    errors.push('PORT debe ser un número entre 1 y 65535');
  }
  
  // Validar Email (si está habilitado)
  if (config.email.enabled && !config.email.user) {
    errors.push('EMAIL_USER es requerido cuando EMAIL_ENABLED=true');
  }
  
  if (errors.length > 0) {
    console.error('\n❌ Errores de configuración:');
    errors.forEach(err => console.error(`  - ${err}`));
    throw new Error('Configuración inválida. Revisa las variables de entorno.');
  }
  
  console.log('✅ Configuración validada correctamente');
};

/**
 * Mostrar configuración (sin secretos)
 * Útil para debugging y verificación
 */
export const logConfig = () => {
  console.log('\n📋 Configuración del servidor:');
  console.log(`  Ambiente: ${config.env}`);
  console.log(`  Puerto: ${config.port}`);
  console.log(`  Host: ${config.host}`);
  console.log(`  Base de Datos: ${config.database.supabase.url ? 'Supabase' : 'PostgreSQL'}`);
  console.log(`  JWT Expira en: ${config.jwt.expiresIn}`);
  console.log(`  CORS Origins: ${config.cors.allowedOrigins.length} permitidos`);
  console.log(`  Rate Limiting: ${config.rateLimit.enabled ? 'Habilitado' : 'Deshabilitado'}`);
  if (config.rateLimit.enabled) {
    console.log(`    - Max requests: ${config.rateLimit.maxRequests}/${config.rateLimit.windowMs / 60000}min`);
  }
  console.log(`  Email: ${config.email.enabled ? 'Habilitado' : 'Deshabilitado'}`);
  console.log(`  Log Level: ${config.logging.level}`);
  console.log('');
};

export default config;
