/**
 * useRoleValidation Hook
 * Hook para validación de roles (sistema + DB)
 */

import { useState, useEffect } from 'react';
import { getValidRoles } from '../services/roles.service';
import logger from '../utils/logger';

export const useRoleValidation = () => {
  const [roles, setRoles] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getValidRoles()
      .then(data => {
        setRoles(data);
        setLoading(false);
      })
      .catch(err => {
        logger.error('Error loading valid roles:', err);
        setLoading(false);
      });
  }, []);

  /**
   * Verifica si un rol es válido
   */
  const isValidRole = (slug) => {
    if (!roles) return false;
    return roles.allSlugs.includes(slug);
  };

  /**
   * Verifica si el usuario tiene uno de los roles especificados
   */
  const hasRole = (user, ...roleSlugs) => {
    if (!user?.role) return false;
    return roleSlugs.includes(user.role);
  };

  /**
   * Verifica si es rol de sistema
   */
  const isSystemRole = (slug) => {
    if (!roles) return false;
    return roles.system.includes(slug);
  };

  return {
    roles,
    loading,
    isValidRole,
    hasRole,
    isSystemRole
  };
};

export default useRoleValidation;
