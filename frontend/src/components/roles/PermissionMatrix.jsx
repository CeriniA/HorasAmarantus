/**
 * PermissionMatrix Component
 * 
 * Responsabilidad: Matriz visual de permisos
 * - Mostrar permisos agrupados por recurso
 * - Seleccionar/deseleccionar permisos
 * - Guardar cambios
 */

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { rolesService } from '../../services/api';
import Alert from '../common/Alert';

const PermissionMatrix = ({ role, permissions, onClose }) => {
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  // Agrupar permisos por recurso
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {});

  // Cargar permisos actuales del rol
  useEffect(() => {
    const loadRolePermissions = async () => {
      try {
        setLoading(true);
        const { permissions: rolePerms } = await rolesService.getPermissions(role.id);
        const permIds = new Set(rolePerms.map(p => p.id));
        setSelectedPermissions(permIds);
      } catch (error) {
        setAlert({
          type: 'error',
          message: 'Error cargando permisos del rol'
        });
      } finally {
        setLoading(false);
      }
    };

    loadRolePermissions();
  }, [role.id]);

  const handleTogglePermission = (permissionId) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (resource) => {
    const resourcePerms = groupedPermissions[resource];
    const allSelected = resourcePerms.every(p => selectedPermissions.has(p.id));

    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      resourcePerms.forEach(p => {
        if (allSelected) {
          newSet.delete(p.id);
        } else {
          newSet.add(p.id);
        }
      });
      return newSet;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await rolesService.setPermissions(role.id, Array.from(selectedPermissions));
      setAlert({
        type: 'success',
        message: 'Permisos actualizados correctamente'
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Error al guardar permisos'
      });
    } finally {
      setSaving(false);
    }
  };

  const getResourceLabel = (resource) => {
    const labels = {
      users: 'Usuarios',
      time_entries: 'Registros de Tiempo',
      org_units: 'Unidades Organizacionales',
      objectives: 'Objetivos',
      reports: 'Reportes',
      settings: 'Configuración',
      roles: 'Roles',
      permissions: 'Permisos'
    };
    return labels[resource] || resource;
  };

  const getActionLabel = (action) => {
    const labels = {
      view: 'Ver',
      create: 'Crear',
      update: 'Actualizar',
      delete: 'Eliminar',
      export: 'Exportar',
      import: 'Importar',
      activate: 'Activar',
      complete: 'Completar',
      manage: 'Gestionar',
      assign: 'Asignar'
    };
    return labels[action] || action;
  };

  const getScopeLabel = (scope) => {
    const labels = {
      all: 'Todos',
      team: 'Equipo',
      own: 'Propios'
    };
    return labels[scope] || scope;
  };

  const getScopeBadgeColor = (scope) => {
    const colors = {
      all: 'bg-purple-100 text-purple-800',
      team: 'bg-blue-100 text-blue-800',
      own: 'bg-green-100 text-green-800'
    };
    return colors[scope] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Permisos de: {role.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Selecciona los permisos que tendrá este rol
          </p>
        </div>

        {/* Alert */}
        {alert && (
          <div className="px-6 pt-4">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([resource, perms]) => {
              const allSelected = perms.every(p => selectedPermissions.has(p.id));
              const someSelected = perms.some(p => selectedPermissions.has(p.id));

              return (
                <div key={resource} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Resource Header */}
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">
                      {getResourceLabel(resource)}
                    </h4>
                    <button
                      onClick={() => handleSelectAll(resource)}
                      className={`text-sm px-3 py-1 rounded ${
                        allSelected
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : someSelected
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    </button>
                  </div>

                  {/* Permissions Grid */}
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {perms.map((permission) => {
                      const isSelected = selectedPermissions.has(permission.id);
                      
                      return (
                        <label
                          key={permission.id}
                          className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleTogglePermission(permission.id)}
                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {getActionLabel(permission.action)}
                              </span>
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getScopeBadgeColor(permission.scope)}`}>
                                {getScopeLabel(permission.scope)}
                              </span>
                            </div>
                            {permission.description && (
                              <p className="text-xs text-gray-500 mt-1">
                                {permission.description}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedPermissions.size} de {permissions.length} permisos seleccionados
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

PermissionMatrix.propTypes = {
  role: PropTypes.object.isRequired,
  permissions: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired
};

export default PermissionMatrix;
