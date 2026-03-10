/**
 * Configuración centralizada de variables de entorno
 * Todas las variables se cargan y validan aquí
 */

import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Validar que una variable de entorno exista
 */
const requireEnv = (key, defaultValue = undefined) => {
  const value = process.env[key] || defaultValue;
  
  if (value === undefined) {
    throw new Error(`Variable de entorno requerida no encontrada: ${key}`);
  }
  
  return value;
};

/**
 * Configuración de la aplicación
 */
export const config = {
  // Ambiente
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Servidor
  port: parseInt(process.env.PORT || '3001', 10),
  
  // Supabase
  supabase: {
    url: requireEnv('SUPABASE_URL'),
    serviceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  },
  
  // JWT
  jwt: {
    secret: requireEnv('JWT_SECRET', 'default-secret-change-in-production'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // CORS
  cors: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    // En producción, permitir múltiples orígenes separados por coma
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
  
  // Rate Limiting
  rateLimit: {
    enabled: process.env.NODE_ENV === 'production' || process.env.ENABLE_RATE_LIMIT === 'true',
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
    maxRequests: process.env.NODE_ENV === 'production' 
      ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
      : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 10),
  },
};

/**
 * Validar configuración al inicio
 */
export const validateConfig = () => {
  const errors = [];
  
  // Validar Supabase
  if (!config.supabase.url.startsWith('http')) {
    errors.push('SUPABASE_URL debe ser una URL válida');
  }
  
  if (config.supabase.serviceRoleKey.length < 20) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY parece inválida');
  }
  
  // Validar JWT
  if (config.isProduction && config.jwt.secret === 'default-secret-change-in-production') {
    errors.push('JWT_SECRET debe cambiarse en producción');
  }
  
  // Validar puerto
  if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
    errors.push('PORT debe ser un número entre 1 y 65535');
  }
  
  if (errors.length > 0) {
    console.error('❌ Errores de configuración:');
    errors.forEach(err => console.error(`  - ${err}`));
    throw new Error('Configuración inválida');
  }
  
  console.log('✅ Configuración validada correctamente');
};

/**
 * Mostrar configuración (sin secretos)
 */
export const logConfig = () => {
  console.log('\n📋 Configuración del servidor:');
  console.log(`  Ambiente: ${config.env}`);
  console.log(`  Puerto: ${config.port}`);
  console.log(`  Supabase URL: ${config.supabase.url}`);
  console.log(`  JWT Expira en: ${config.jwt.expiresIn}`);
  console.log(`  CORS Origins: ${config.cors.allowedOrigins.length} permitidos`);
  console.log(`  Rate Limiting: ${config.rateLimit.enabled ? 'Habilitado' : 'Deshabilitado'}`);
  if (config.rateLimit.enabled) {
    console.log(`    - Max requests: ${config.rateLimit.maxRequests}/${config.rateLimit.windowMs / 60000}min`);
  }
  console.log('');
};

export default config;
