import { useAuthContext } from '../context/AuthContext';

/**
 * Hook para verificar permisos del usuario
 */
export const usePermissions = () => {
  const { user } = useAuthContext();

  /**
   * Verificar si el usuario puede realizar una acción sobre un recurso
   */
  const can = (action, resource, targetData = {}) => {
    if (!user) return false;

    const { role } = user;

    // Superadmin puede todo
    if (role === 'superadmin') return true;

    // Matriz de permisos por rol
    const permissions = {
      admin: {
        users: {
          view: true,
          create: (target) => {
            // Admin puede crear solo operarios
            return !target.role || target.role === 'operario';
          },
          edit: (target) => {
            // Admin puede editar solo operarios
            return target.role === 'operario';
          },
          delete: (target) => {
            // Admin puede eliminar solo operarios
            return target.role === 'operario';
          }
        },
        organizational_units: {
          view: true,
          create: true,
          edit: true,
          delete: true
        },
        time_entries: {
          view: true,
          create: true,
          edit: true,
          delete: true
        },
        reports: {
          view: true,
          export: true
        }
      },
      operario: {
        users: {
          view: (target) => {
            // Operario solo puede ver su propio perfil
            return target.id === user.id;
          },
          edit: (target) => {
            // Operario solo puede editar su propio perfil
            return target.id === user.id;
          }
        },
        time_entries: {
          view: (target) => {
            // Operario solo puede ver sus propios registros
            return !target.user_id || target.user_id === user.id;
          },
          create: true,
          edit: (target) => {
            // Operario solo puede editar sus propios registros
            return target.user_id === user.id;
          },
          delete: (target) => {
            // Operario solo puede eliminar sus propios registros
            return target.user_id === user.id;
          }
        },
        reports: {
          view: (target) => {
            // Operario solo puede ver sus propios reportes
            return target.user_id === user.id;
          }
        }
      }
    };

    const rolePermissions = permissions[role];
    if (!rolePermissions) return false;

    const resourcePermissions = rolePermissions[resource];
    if (!resourcePermissions) return false;

    const permission = resourcePermissions[action];
    if (permission === undefined) return false;

    // Si es booleano, retornar directamente
    if (typeof permission === 'boolean') return permission;

    // Si es función, ejecutar con targetData
    if (typeof permission === 'function') return permission(targetData);

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
    return user?.role === 'superadmin';
  };

  /**
   * Verificar si es admin o superadmin
   */
  const isAdmin = () => {
    return user?.role === 'admin' || user?.role === 'superadmin';
  };

  /**
   * Verificar si es operario
   */
  const isOperario = () => {
    return user?.role === 'operario';
  };

  return {
    can,
    hasRole,
    isSuperadmin,
    isAdmin,
    isOperario,
    user
  };
};

export default usePermissions;
