/**
 * RoleManagement Page
 * 
 * Responsabilidad: Gestión de roles y permisos (solo superadmin)
 * - Listar roles
 * - Crear/editar/eliminar roles
 * - Gestionar permisos de roles
 */

// React/hooks
import { useState } from 'react';

// Librerías externas
import { Shield, Edit, Trash2, Settings, Plus } from 'lucide-react';

// Componentes
import RoleFormModal from '../components/roles/RoleFormModal';
import PermissionMatrix from '../components/roles/PermissionMatrix';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

// Hooks
import { usePermissions } from '../hooks/usePermissions';
import { useRoles } from '../hooks/useRoles';

// Constantes
import { USER_ROLES } from '../constants';

const RoleManagement = () => {
  const { isSuperadmin } = usePermissions();
  const { roles, permissions, loading, error, createRole, updateRole, deleteRole } = useRoles();
  
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [alert, setAlert] = useState(null);

  // Verificar permisos
  if (!isSuperadmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600">Solo superadministradores pueden gestionar roles.</p>
        </div>
      </div>
    );
  }

  const handleCreateRole = () => {
    setEditingRole(null);
    setShowRoleModal(true);
  };

  const handleEditRole = (role) => {
    // Solo permitir editar roles personalizados
    if (role.is_system) {
      setAlert({
        type: 'error',
        message: 'Los roles del sistema no se pueden editar. Puedes gestionar sus permisos desde el botón "Permisos".'
      });
      return;
    }
    setEditingRole(role);
    setShowRoleModal(true);
  };

  const handleDeleteRole = async (role) => {
    if (role.is_system) {
      setAlert({
        type: 'error',
        message: 'No se pueden eliminar roles del sistema'
      });
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar el rol "${role.name}"?`)) {
      const result = await deleteRole(role.id);
      
      if (result.success) {
        setAlert({
          type: 'success',
          message: 'Rol eliminado correctamente'
        });
      } else {
        setAlert({
          type: 'error',
          message: result.error || 'Error al eliminar rol'
        });
      }
    }
  };

  const handleManagePermissions = (role) => {
    // Superadmin no se puede modificar
    if (role.slug === USER_ROLES.SUPERADMIN) {
      setAlert({
        type: 'error',
        message: 'Los permisos del Superadministrador no se pueden modificar. Tiene acceso total al sistema.'
      });
      return;
    }
    setSelectedRole(role);
    setShowPermissionModal(true);
  };

  const handleSaveRole = async (roleData) => {
    let result;
    
    if (editingRole) {
      result = await updateRole(editingRole.id, roleData);
    } else {
      result = await createRole(roleData);
    }

    if (result.success) {
      setAlert({
        type: 'success',
        message: editingRole ? 'Rol actualizado correctamente' : 'Rol creado correctamente'
      });
      setShowRoleModal(false);
    } else {
      setAlert({
        type: 'error',
        message: result.error || 'Error al guardar rol'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Roles</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">
              Administra roles y permisos del sistema
            </p>
          </div>
          <Button
            onClick={handleCreateRole}
            className="flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Plus className="h-5 w-5" />
            Crear Rol
          </Button>
        </div>

        {/* Alert */}
        {alert && (
          <div className="mb-6">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6">
            <Alert
              type="error"
              message={error}
              onClose={() => {}}
            />
          </div>
        )}

        {/* Roles List - Mobile: Cards, Desktop: Table */}
        
        {/* Empty State */}
        {roles.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay roles</h3>
              <p className="text-gray-600 mb-4">
                Comienza creando tu primer rol personalizado
              </p>
              <Button onClick={handleCreateRole} className="flex items-center gap-2 mx-auto">
                <Plus className="h-5 w-5" />
                Crear Rol
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Mobile View (Cards) */}
            <div className="block lg:hidden space-y-4">
              {roles.map((role) => (
            <Card key={role.id}>
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-5 w-5 text-primary-600 flex-shrink-0" />
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {role.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500 font-mono">{role.slug}</p>
                  </div>
                </div>

                {/* Description */}
                {role.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {role.description}
                  </p>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    role.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {role.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    role.is_system 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {role.is_system ? 'Sistema' : 'Personalizado'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-200">
                  {/* Superadmin: solo lectura */}
                  {role.slug === USER_ROLES.SUPERADMIN ? (
                    <div className="text-center py-2 text-sm text-gray-500">
                      🔒 Rol protegido del sistema (solo lectura)
                    </div>
                  ) : (
                    <>
                      {/* Otros roles del sistema: solo permisos */}
                      {role.is_system ? (
                        <Button
                          variant="outline"
                          onClick={() => handleManagePermissions(role)}
                          className="flex items-center justify-center gap-2 flex-1"
                        >
                          <Settings className="h-4 w-4" />
                          Permisos
                        </Button>
                      ) : (
                        /* Roles personalizados: todo */
                        <>
                          <Button
                            variant="outline"
                            onClick={() => handleManagePermissions(role)}
                            className="flex items-center justify-center gap-2 flex-1"
                          >
                            <Settings className="h-4 w-4" />
                            Permisos
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleEditRole(role)}
                            className="flex items-center justify-center gap-2 flex-1"
                          >
                            <Edit className="h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleDeleteRole(role)}
                            className="flex items-center justify-center gap-2 flex-1 text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {role.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 font-mono">
                        {role.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 max-w-xs truncate block">
                        {role.description || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        role.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {role.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        role.is_system 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {role.is_system ? 'Sistema' : 'Personalizado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* Superadmin: solo lectura */}
                      {role.slug === USER_ROLES.SUPERADMIN ? (
                        <span className="text-gray-500 text-xs">
                          🔒 Protegido
                        </span>
                      ) : (
                        <>
                          {/* Otros roles del sistema: solo permisos */}
                          {role.is_system ? (
                            <button
                              onClick={() => handleManagePermissions(role)}
                              className="text-primary-600 hover:text-primary-900 transition-colors"
                              title="Gestionar permisos"
                            >
                              Permisos
                            </button>
                          ) : (
                            /* Roles personalizados: todo */
                            <>
                              <button
                                onClick={() => handleManagePermissions(role)}
                                className="text-primary-600 hover:text-primary-900 mr-4 transition-colors"
                                title="Gestionar permisos"
                              >
                                Permisos
                              </button>
                              <button
                                onClick={() => handleEditRole(role)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors"
                                title="Editar rol"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteRole(role)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Eliminar rol"
                              >
                                Eliminar
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}

        {/* Modals */}
        {showRoleModal && (
          <RoleFormModal
            role={editingRole}
            onSave={handleSaveRole}
            onClose={() => setShowRoleModal(false)}
          />
        )}

        {showPermissionModal && selectedRole && (
          <PermissionMatrix
            role={selectedRole}
            permissions={permissions}
            onClose={() => {
              setShowPermissionModal(false);
              setSelectedRole(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default RoleManagement;
