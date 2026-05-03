/* eslint-disable no-alert, no-restricted-globals */
// TODO: Reemplazar alert/confirm con componente de notificaciones (Toast/Modal)
import { useState, useMemo } from 'react';
import { useUsers } from '../hooks/useUsers';
import { useOrganizationalUnits } from '../hooks/useOrganizationalUnits';
import { usePermissions } from '../hooks/usePermissions';
import { useRoles } from '../hooks/useRoles';
import { useAuth } from '../hooks/useAuth';
import { USER_ROLES, getRoleLabel } from '../constants';
import { getRoleBadgeColor, getSelectableRoles } from '../utils/roleHelpers';
import { MESSAGES } from '../constants/messages';
import { BulkUserImport } from '../components/users/BulkUserImport';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const UserManagement = () => {
  // Estados para paginación y filtros (ANTES del hook)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showInactive, setShowInactive] = useState(false);
  
  // Hooks
  const { users, loading, createUser, updateUser, deleteUser } = useUsers(showInactive);
  const { units } = useOrganizationalUnits();
  const { can } = usePermissions();
  const { roles: availableRoles, loading: rolesLoading } = useRoles();
  const { user: currentUser } = useAuth();
  
  const [showModal, setShowModal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role_id: '',  // Cambiar role por role_id
    organizational_unit_id: ''
  });
  const [formError, setFormError] = useState('');

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      name: '',
      role_id: availableRoles.find(r => r.slug === USER_ROLES.OPERARIO)?.id || '',
      organizational_unit_id: ''
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    if (!can('edit', 'users', user)) {
      alert(MESSAGES.NO_PERMISSION_EDIT_USER);
      return;
    }

    setEditingUser(user);
    // Buscar el role_id basado en el slug del rol del usuario
    const userRoleId = availableRoles.find(r => r.slug === user.role)?.id || user.role_id || '';
    
    setFormData({
      username: user.username,
      email: user.email || '',
      password: '',
      role_id: userRoleId,
      organizational_unit_id: user.organizational_unit_id || ''
    });
    setFormError('');
    setShowModal(true);
  };

  const handleDelete = async (user) => {
    if (!can('delete', 'users', user)) {
      alert(MESSAGES.NO_PERMISSION_DELETE_USER);
      return;
    }

    if (!window.confirm(MESSAGES.CONFIRM_DELETE_USER(user.name))) {
      return;
    }

    const result = await deleteUser(user.id);
    if (result.success) {
      alert(MESSAGES.USER_DELETED_SUCCESS);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validaciones
    if (!formData.username || !formData.name) {
      setFormError(MESSAGES.REQUIRED_FIELDS);
      return;
    }

    if (!editingUser && !formData.password) {
      setFormError(MESSAGES.INVALID_PASSWORD);
      return;
    }

    // Verificar permisos
    if (!editingUser && !can('create', 'users', formData)) {
      setFormError(MESSAGES.NO_PERMISSION_CREATE_USER);
      return;
    }

    if (editingUser && !can('edit', 'users', { ...editingUser, ...formData })) {
      setFormError(MESSAGES.NO_PERMISSION_EDIT_USER);
      return;
    }

    // Preparar datos
    const userData = {
      username: formData.username,
      email: formData.email || null, // Email opcional
      name: formData.name,
      role_id: formData.role_id,
      organizational_unit_id: formData.organizational_unit_id || null
    };

    if (formData.password) {
      userData.password = formData.password;
    }

    // Crear o actualizar
    const result = editingUser
      ? await updateUser(editingUser.id, userData)
      : await createUser(userData);

    if (result.success) {
      alert(editingUser ? MESSAGES.USER_UPDATED_SUCCESS : MESSAGES.USER_CREATED_SUCCESS);
      setShowModal(false);
    } else {
      setFormError(result.error);
    }
  };

  // Paginar usuarios (el filtro ya se aplica en el hook)
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return users.slice(startIndex, endIndex);
  }, [users, currentPage, itemsPerPage]);

  // Resetear a página 1 cuando cambia el filtro
  const handleToggleInactive = () => {
    setShowInactive(!showInactive);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra los usuarios del sistema</p>
        </div>
        
        {can('create', 'users', { role: USER_ROLES.OPERARIO }) && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowBulkImport(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              📥 Importar CSV
            </button>
            <button
              onClick={handleOpenCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              + Nuevo Usuario
            </button>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={handleToggleInactive}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Mostrar usuarios inactivos
              </span>
            </label>
          </div>
          <div className="text-sm text-gray-600">
            Mostrando {paginatedUsers.length} de {users.length} usuarios
          </div>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Área
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">@{user.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email || <span className="text-gray-400 italic">Sin email</span>}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.organizational_unit_id ? (
                    units.find(u => u.id === user.organizational_unit_id)?.name || 'N/A'
                  ) : (
                    <span className="text-gray-400">Sin asignar</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {can('edit', 'users', user) && (
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </button>
                  )}
                  {can('delete', 'users', user) && (
                    <button
                      onClick={() => handleDelete(user)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {showInactive 
                ? 'No hay usuarios registrados'
                : 'No hay usuarios activos. Activa "Mostrar usuarios inactivos" para ver todos.'}
            </p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="bg-white shadow-md rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              
              {/* Números de página */}
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Usuario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  {MESSAGES.HELP_TEXT_USERNAME}
                </p>
              </div>

              {/* Email (opcional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (opcional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {MESSAGES.HELP_TEXT_EMAIL_OPTIONAL}
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {!editingUser && '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!editingUser}
                />
                {editingUser && (
                  <p className="mt-1 text-xs text-gray-500">
                    Dejar vacío para mantener la contraseña actual
                  </p>
                )}
              </div>

              {/* Rol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={rolesLoading}
                >
                  {rolesLoading ? (
                    <option value="">{MESSAGES.SELECT_LOADING_ROLES}</option>
                  ) : (
                    getSelectableRoles(availableRoles, currentUser).map((role) => (
                      <option key={role.id} value={role.id}>
                        {getRoleLabel(role.slug || role.name)}
                      </option>
                    ))
                  )}
                </select>
                {rolesLoading && (
                  <p className="mt-1 text-xs text-gray-500">
                    {MESSAGES.HELP_TEXT_ROLES_LOADING}
                  </p>
                )}
              </div>

              {/* Área */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área Organizacional
                </label>
                <select
                  value={formData.organizational_unit_id}
                  onChange={(e) => setFormData({ ...formData, organizational_unit_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sin asignar</option>
                  {units.filter(u => u.type === 'area').map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error */}
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {formError}
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de importación masiva */}
      <BulkUserImport
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        existingUsers={users}
        onSuccess={() => {
          // Recargar usuarios después de importar
          window.location.reload();
        }}
      />
    </div>
  );
};

export default UserManagement;
