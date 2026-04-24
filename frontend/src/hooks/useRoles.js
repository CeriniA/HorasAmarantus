/**
 * useRoles Hook
 * 
 * Responsabilidad: Gestión de estado para roles
 * - Cargar roles
 * - CRUD de roles
 * - Gestión de permisos de roles
 */

import { useState, useEffect, useCallback } from 'react';
import { rolesService, permissionsService } from '../services/api';
import logger from '../utils/logger';

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { roles: data } = await rolesService.getAll();
      setRoles(data);
    } catch (err) {
      logger.error('Error loading roles:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPermissions = useCallback(async () => {
    try {
      const { permissions: data } = await permissionsService.getAll();
      setPermissions(data);
    } catch (err) {
      logger.error('Error loading permissions:', err);
    }
  }, []);

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, [loadRoles, loadPermissions]);

  const createRole = async (roleData) => {
    try {
      const { role } = await rolesService.create(roleData);
      setRoles(prev => [...prev, role]);
      return { success: true, role };
    } catch (err) {
      logger.error('Error creating role:', err);
      return { success: false, error: err.message };
    }
  };

  const updateRole = async (roleId, roleData) => {
    try {
      const { role } = await rolesService.update(roleId, roleData);
      setRoles(prev => prev.map(r => r.id === roleId ? role : r));
      return { success: true, role };
    } catch (err) {
      logger.error('Error updating role:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteRole = async (roleId) => {
    try {
      await rolesService.delete(roleId);
      setRoles(prev => prev.filter(r => r.id !== roleId));
      return { success: true };
    } catch (err) {
      logger.error('Error deleting role:', err);
      return { success: false, error: err.message };
    }
  };

  const getRolePermissions = async (roleId) => {
    try {
      const { permissions: data } = await rolesService.getPermissions(roleId);
      return { success: true, permissions: data };
    } catch (err) {
      logger.error('Error getting role permissions:', err);
      return { success: false, error: err.message };
    }
  };

  const setRolePermissions = async (roleId, permissionIds) => {
    try {
      await rolesService.setPermissions(roleId, permissionIds);
      return { success: true };
    } catch (err) {
      logger.error('Error setting role permissions:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    roles,
    permissions,
    loading,
    error,
    loadRoles,
    createRole,
    updateRole,
    deleteRole,
    getRolePermissions,
    setRolePermissions
  };
};

export default useRoles;
