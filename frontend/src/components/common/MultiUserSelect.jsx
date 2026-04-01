/**
 * Componente de selección múltiple de usuarios
 * Permite seleccionar varios usuarios a la vez para comparativas
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

export const MultiUserSelect = ({ users, selectedUsers, onChange, label = "Usuarios" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      // Remover usuario
      onChange(selectedUsers.filter(id => id !== userId));
    } else {
      // Agregar usuario
      onChange([...selectedUsers, userId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      // Deseleccionar todos
      onChange([]);
    } else {
      // Seleccionar todos
      onChange(users.map(u => u.id));
    }
  };

  const handleRemoveUser = (userId, e) => {
    e.stopPropagation();
    onChange(selectedUsers.filter(id => id !== userId));
  };

  const selectedUserNames = users
    .filter(u => selectedUsers.includes(u.id))
    .map(u => u.name);

  const allSelected = selectedUsers.length === users.length && users.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 flex flex-wrap gap-1 mr-2">
            {selectedUsers.length === 0 && (
              <span className="text-gray-500">Seleccionar usuarios...</span>
            )}
            {selectedUsers.length > 0 && selectedUsers.length <= 3 && (
              selectedUserNames.map((name, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {name}
                  <button
                    onClick={(e) => handleRemoveUser(selectedUsers[index], e)}
                    className="hover:bg-primary-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))
            )}
            {selectedUsers.length > 3 && (
              <span className="text-sm text-gray-900">
                {selectedUsers.length} usuario{selectedUsers.length !== 1 ? 's' : ''} seleccionado{selectedUsers.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {/* Select All */}
          <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-3 py-2">
            <label className="flex items-center cursor-pointer hover:bg-gray-100 rounded px-2 py-1">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
              />
              <span className="text-sm font-medium text-gray-900">
                {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </span>
            </label>
          </div>

          {/* User list */}
          <div className="py-1">
            {users.map((user) => {
              const isSelected = selectedUsers.includes(user.id);
              return (
                <label
                  key={user.id}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleUser(user.id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-3"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                    {user.email && (
                      <div className="text-xs text-gray-500">
                        {user.email}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary-600" />
                  )}
                </label>
              );
            })}
          </div>

          {users.length === 0 && (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              No hay usuarios disponibles
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiUserSelect;
