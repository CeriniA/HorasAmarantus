/**
 * Servicio de Cache de Roles
 * Maneja validación centralizada de roles de sistema + DB con cache híbrido
 */

import { supabase } from '../config/database.js';
import { USER_ROLES, USER_ROLES_ARRAY } from '../models/constants.js';
import logger from '../utils/logger.js';

// Cache en memoria
let rolesCache = null;
let cacheExpiry = null;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

/**
 * Obtiene todos los roles válidos (sistema + DB) con cache
 */
export const getValidRoles = async () => {
  const now = Date.now();
  
  // Refresh si expiró o no existe
  if (!rolesCache || now > cacheExpiry) {
    logger.info('🔄 Refreshing roles cache...');
    
    const { data: dbRoles, error } = await supabase
      .from('roles')
      .select('id, name, slug, is_system, is_active')
      .eq('is_active', true);
    
    if (error) {
      logger.error('Error fetching roles from DB:', error);
      // Fallback a roles de sistema si falla DB
      return {
        system: USER_ROLES_ARRAY,
        database: [],
        allSlugs: USER_ROLES_ARRAY
      };
    }
    
    rolesCache = {
      system: USER_ROLES_ARRAY,
      database: dbRoles || [],
      allSlugs: [...USER_ROLES_ARRAY, ...(dbRoles?.map(r => r.slug) || [])]
    };
    
    cacheExpiry = now + CACHE_TTL;
    logger.info(`✅ Roles cache refreshed: ${rolesCache.allSlugs.length} roles total`);
  }
  
  return rolesCache;
};

/**
 * Valida si un rol es válido (sistema O DB)
 */
export const isValidRole = async (slug) => {
  if (!slug) return false;
  
  const roles = await getValidRoles();
  return roles.allSlugs.includes(slug);
};

/**
 * Obtiene información de un rol por slug
 */
export const getRoleInfo = async (slug) => {
  const roles = await getValidRoles();
  
  // Buscar en roles de sistema
  if (roles.system.includes(slug)) {
    return {
      slug,
      isSystem: true,
      name: slug.charAt(0).toUpperCase() + slug.slice(1)
    };
  }
  
  // Buscar en roles de DB
  const dbRole = roles.database.find(r => r.slug === slug);
  return dbRole ? { ...dbRole, isSystem: false } : null;
};

/**
 * Invalida el cache (llamar al crear/editar/eliminar roles)
 */
export const invalidateRolesCache = () => {
  logger.info('🗑️ Invalidating roles cache');
  rolesCache = null;
  cacheExpiry = null;
};

/**
 * Verifica si un rol es de sistema (no modificable)
 */
export const isSystemRole = (slug) => {
  return USER_ROLES_ARRAY.includes(slug);
};
