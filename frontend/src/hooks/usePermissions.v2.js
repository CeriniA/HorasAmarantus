/**
 * Hook de Permisos RBAC (Versión 2)
 * 
 * Responsabilidades:
 * - Verificar permisos granulares del usuario
 * - Usar sistema RBAC del backend
 * - Mantener compatibilidad con código existente
 */

import { useAuthContext } from '../context/AuthContext';
import { USER_ROLES, RESOURCES, ACTIONS, SCOPES } from '../constants';
import { buildPermissionKey } from '../utils/permissionHelpers';

/**
 * Hook para verificar permisos del usuario usando sistema RBAC
 */
export const usePermissions = () => {
  const { user } = useAuthContext();

  /**
   * Verificar si el usuario tiene un permiso específico
   * @param {string} resource - Recurso (users, time_entries, etc.)
   * @param {string} action - Acción (view, create, update, delete)
   * @param {string} scope - Alcance (all, team, own)
   * @returns {boolean}
   */
  const userCan = (resource, action, scope = SCOPES.ALL) => {
    if (!user || !user.permissions) return false;

    const permissionKey = buildPermissionKey(resource, action, scope);
    return user.permissions.includes(permissionKey);
  };

  /**
   * Verificar si el usuario puede realizar una acción sobre un recurso
   * Método compatible con código existente
   * @param {string} action - Acción (view, create, edit, delete)
   * @param {string} resource - Recurso (users, time_entries, etc.)
   * @param {Object} targetData - Datos del recurso objetivo
   * @returns {boolean}
   */
  const can = (action, resource, targetData = {}) => {
    if (!user) return false;

    // Superadmin puede todo
    if (user.role === USER_ROLES.SUPERADMIN) return true;

    // Mapear action a ACTIONS
    const actionMap = {
      view: ACTIONS.VIEW,
      create: ACTIONS.CREATE,
      edit: ACTIONS.UPDATE,
      delete: ACTIONS.DELETE,
      export: ACTIONS.EXPORT,
      import: ACTIONS.IMPORT
    };

    const mappedAction = actionMap[action] || action;

    // Verificar permiso 'all' primero
    if (userCan(resource, mappedAction, SCOPES.ALL)) {
      return true;
    }

    // Verificar permiso 'team'
    if (userCan(resource, mappedAction, SCOPES.TEAM)) {
      // Si hay targetData, verificar que sea del mismo equipo
      if (targetData.organizational_unit_id) {
        return targetData.organizational_unit_id === user.organizational_unit_id;
      }
      return true;
    }

    // Verificar permiso 'own'
    if (userCan(resource, mappedAction, SCOPES.OWN)) {
      // Si hay targetData, verificar ownership
      if (targetData.user_id) {
        return targetData.user_id === user.id;
      }
      if (targetData.id) {
        return targetData.id === user.id;
      }
      return true;
    }

    return false;
  };

  /**
   * Verificar si el usuario tiene uno de los roles especificados
   */
  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  /**
   * Verificar si es superadmin
   */
  const isSuperadmin = () => {
    return user?.role === USER_ROLES.SUPERADMIN;
  };

  /**
   * Verificar si es admin o superadmin
   */
  const isAdmin = () => {
    return hasRole(USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN);
  };

  /**
   * Verificar si es supervisor
   */
  const isSupervisor = () => {
    return hasRole(USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN);
  };

  /**
   * Verificar si es team lead
   */
  const isTeamLead = () => {
    return hasRole(USER_ROLES.TEAM_LEAD, USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN);
  };

  /**
   * Verificar si es operario
   */
  const isOperario = () => {
    return user?.role === USER_ROLES.OPERARIO;
  };

  /**
   * Verificar si puede ver todos los usuarios
   */
  const canViewAllUsers = () => {
    return userCan(RESOURCES.USERS, ACTIONS.VIEW, SCOPES.ALL);
  };

  /**
   * Verificar si puede crear usuarios
   */
  const canCreateUsers = () => {
    return userCan(RESOURCES.USERS, ACTIONS.CREATE, SCOPES.ALL);
  };

  /**
   * Verificar si puede ver todos los registros de tiempo
   */
  const canViewAllTimeEntries = () => {
    return userCan(RESOURCES.TIME_ENTRIES, ACTIONS.VIEW, SCOPES.ALL);
  };

  /**
   * Verificar si puede ver registros de su equipo
   */
  const canViewTeamTimeEntries = () => {
    return userCan(RESOURCES.TIME_ENTRIES, ACTIONS.VIEW, SCOPES.ALL) ||
           userCan(RESOURCES.TIME_ENTRIES, ACTIONS.VIEW, SCOPES.TEAM);
  };

  /**
   * Verificar si puede gestionar unidades organizacionales
   */
  const canManageOrgUnits = () => {
    return userCan(RESOURCES.ORG_UNITS, ACTIONS.UPDATE, SCOPES.ALL);
  };

  /**
   * Verificar si puede ver reportes
   */
  const canViewReports = () => {
    return userCan(RESOURCES.REPORTS, ACTIONS.VIEW, SCOPES.ALL) ||
           userCan(RESOURCES.REPORTS, ACTIONS.VIEW, SCOPES.TEAM) ||
           userCan(RESOURCES.REPORTS, ACTIONS.VIEW, SCOPES.OWN);
  };

  /**
   * Verificar si puede exportar reportes
   */
  const canExportReports = () => {
    return userCan(RESOURCES.REPORTS, ACTIONS.EXPORT, SCOPES.ALL) ||
           userCan(RESOURCES.REPORTS, ACTIONS.EXPORT, SCOPES.TEAM);
  };

  /**
   * Verificar si puede gestionar roles y permisos
   */
  const canManageRoles = () => {
    return userCan(RESOURCES.ROLES, ACTIONS.MANAGE, SCOPES.ALL);
  };

  /**
   * Verificar si puede gestionar objetivos empresariales
   */
  const canManageCompanyObjectives = () => {
    return userCan(RESOURCES.OBJECTIVES, ACTIONS.CREATE, 'company');
  };

  /**
   * Verificar si puede asignar objetivos a usuarios
   */
  const canAssignObjectives = () => {
    return userCan(RESOURCES.OBJECTIVES, ACTIONS.CREATE, 'assigned');
  };

  /**
   * Verificar si puede crear objetivos personales
   */
  const canCreatePersonalObjectives = () => {
    return userCan(RESOURCES.OBJECTIVES, ACTIONS.CREATE, 'personal');
  };

  /**
   * Verificar si puede ver todos los objetivos
   */
  const canViewAllObjectives = () => {
    return userCan(RESOURCES.OBJECTIVES, ACTIONS.VIEW, SCOPES.ALL);
  };

  /**
   * Verificar si puede ver objetivos de su equipo
   */
  const canViewTeamObjectives = () => {
    return userCan(RESOURCES.OBJECTIVES, ACTIONS.VIEW, SCOPES.ALL) ||
           userCan(RESOURCES.OBJECTIVES, ACTIONS.VIEW, SCOPES.TEAM);
  };

  /**
   * Verificar si puede ver sus propios objetivos
   */
  const canViewOwnObjectives = () => {
    return userCan(RESOURCES.OBJECTIVES, ACTIONS.VIEW, SCOPES.OWN);
  };

  /**
   * Verificar si puede actualizar sus propios objetivos
   */
  const canUpdateOwnObjectives = () => {
    return userCan(RESOURCES.OBJECTIVES, ACTIONS.UPDATE, SCOPES.OWN);
  };

  /**
   * Verificar si puede eliminar sus propios objetivos
   */
  const canDeleteOwnObjectives = () => {
    return userCan(RESOURCES.OBJECTIVES, ACTIONS.DELETE, SCOPES.OWN);
  };

  return {
    // Métodos principales
    userCan,
    can,
    hasRole,
    
    // Verificadores de rol
    isSuperadmin,
    isAdmin,
    isSupervisor,
    isTeamLead,
    isOperario,
    
    // Shortcuts de permisos comunes
    canViewAllUsers,
    canCreateUsers,
    canViewAllTimeEntries,
    canViewTeamTimeEntries,
    canManageOrgUnits,
    canViewReports,
    canExportReports,
    canManageRoles,
    
    // Permisos de objetivos
    canManageCompanyObjectives,
    canAssignObjectives,
    canCreatePersonalObjectives,
    canViewAllObjectives,
    canViewTeamObjectives,
    canViewOwnObjectives,
    canUpdateOwnObjectives,
    canDeleteOwnObjectives,
    
    // Usuario actual
    user
  };
};

export default usePermissions;
