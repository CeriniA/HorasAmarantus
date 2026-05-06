/**
 * Roles Service
 * Maneja cache de roles válidos (sistema + DB) con localStorage
 */

import api from './api';
import logger from '../utils/logger';

const CACHE_KEY = 'valid_roles_cache';
const CACHE_EXPIRY_KEY = 'valid_roles_expiry';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

/**
 * Obtiene roles válidos con cache en localStorage
 */
export const getValidRoles = async () => {
  try {
    // Check cache
    const cached = localStorage.getItem(CACHE_KEY);
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
    const now = Date.now();

    if (cached && cached !== 'undefined' && expiry && now < parseInt(expiry)) {
      logger.debug('📦 Roles desde cache');
      return JSON.parse(cached);
    }

    // Fetch desde API
    logger.info('🔄 Fetching roles desde API...');
    const response = await api.get('/roles/valid');
    
    // La respuesta ya viene como objeto directo (no envuelta en .data)
    const roles = response;

    // Validar estructura
    if (!roles || !roles.allSlugs) {
      throw new Error('Respuesta de API inválida');
    }

    // Guardar en cache
    localStorage.setItem(CACHE_KEY, JSON.stringify(roles));
    localStorage.setItem(CACHE_EXPIRY_KEY, (now + CACHE_TTL).toString());

    logger.info(`✅ Roles cargados: ${roles.allSlugs.length} roles`);
    return roles;
  } catch (error) {
    logger.error('Error fetching roles:', error);
    
    // Fallback a cache expirado si existe
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached && cached !== 'undefined') {
      logger.warn('⚠️ Usando cache expirado como fallback');
      return JSON.parse(cached);
    }
    
    // Fallback a roles de sistema hardcoded
    return {
      system: ['superadmin', 'admin', 'operario'],
      database: [],
      allSlugs: ['superadmin', 'admin', 'operario']
    };
  }
};

/**
 * Valida si un rol es válido
 */
export const isValidRole = async (slug) => {
  if (!slug) return false;
  const roles = await getValidRoles();
  return roles.allSlugs.includes(slug);
};

/**
 * Invalida el cache (llamar al crear/editar roles)
 */
export const invalidateRolesCache = () => {
  logger.info('🗑️ Invalidando cache de roles');
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_EXPIRY_KEY);
};

/**
 * Obtiene información de un rol
 */
export const getRoleInfo = async (slug) => {
  const roles = await getValidRoles();
  
  // Sistema
  if (roles.system.includes(slug)) {
    return {
      slug,
      isSystem: true,
      name: slug.charAt(0).toUpperCase() + slug.slice(1)
    };
  }
  
  // DB
  const dbRole = roles.database.find(r => r.slug === slug);
  return dbRole || null;
};
