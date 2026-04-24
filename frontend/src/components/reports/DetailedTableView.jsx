/**
 * Vista Detallada en Tabla
 * Muestra registros en tabla con ordenamiento y paginación
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Card from '../common/Card';
import Button from '../common/Button';
import { ChevronLeft, ChevronRight, Edit2, Trash2, Calendar, User } from 'lucide-react';
import { safeDate } from '../../utils/dateHelpers';
import { getUnitStyle } from '../../constants';
import { PAGINATION } from '../../constants/pagination';
import { VALIDATION } from '../../constants/validation';

export const DetailedTableView = ({ 
  entries, 
  canEdit, 
  onEdit, 
  onDelete,
  sortField,
  sortDirection,
  onSort
}) => {
  // Paginación
  const totalPages = Math.ceil(entries.length / PAGINATION.ENTRIES_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * PAGINATION.ENTRIES_PER_PAGE;
  const endIndex = startIndex + PAGINATION.ENTRIES_PER_PAGE;
  const currentEntries = entries.slice(startIndex, endIndex);

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <Card>
      {/* Vista Mobile: Cards */}
      <div className="block lg:hidden space-y-3">
        {currentEntries.map((entry) => {
          const entryDate = safeDate(entry.start_time);
          
          return (
            <div key={entry.id} className="p-4 bg-gray-50 rounded-lg">
              {/* Header: Fecha y Horas */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {format(entryDate, 'dd/MM/yyyy', { locale: es })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(entryDate, 'EEEE', { locale: es })}
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-blue-600 flex-shrink-0">
                  {entry.total_hours?.toFixed(VALIDATION.HOURS_DECIMAL_PLACES)}h
                </span>
              </div>
              
              {/* Usuario */}
              {entry.users?.name && (
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-3.5 w-3.5 text-gray-400" />
                  <p className="text-xs text-gray-600">
                    {entry.users.name}
                  </p>
                </div>
              )}
              
              {/* Unidad */}
              <div className="mb-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${getUnitStyle(entry.organizational_units?.type, 'badge')}`}>
                  {entry.organizational_units?.name || 'N/A'}
                </span>
              </div>
              
              {/* Descripción */}
              {entry.description && (
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  {entry.description}
                </p>
              )}
              
              {/* Acciones */}
              {canEdit && (
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit && onEdit(entry)}
                    className="flex items-center gap-2 flex-1"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete && onDelete(entry)}
                    className="flex items-center gap-2 flex-1 text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Vista Desktop: Tabla */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                onClick={() => onSort('start_time')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Fecha <SortIcon field="start_time" />
              </th>
              <th 
                onClick={() => onSort('user')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Usuario <SortIcon field="user" />
              </th>
              <th 
                onClick={() => onSort('unit')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Unidad <SortIcon field="unit" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th 
                onClick={() => onSort('hours')}
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Horas <SortIcon field="hours" />
              </th>
              {canEdit && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentEntries.map((entry) => {
              const entryDate = safeDate(entry.start_time);

              return (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {format(entryDate, 'dd/MM/yyyy', { locale: es })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(entryDate, 'EEEE', { locale: es })}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {entry.users?.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUnitStyle(entry.organizational_units?.type, 'badge')}`}>
                      {entry.organizational_units?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={entry.description}>
                      {entry.description || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {entry.total_hours?.toFixed(VALIDATION.HOURS_DECIMAL_PLACES)}h
                    </span>
                  </td>
                  {canEdit && (
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit && onEdit(entry)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete && onDelete(entry)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Info de registros - Oculto en mobile */}
            <div className="hidden sm:block text-sm text-gray-700">
              <span className="font-medium">{startIndex + 1}</span>-
              <span className="font-medium">{Math.min(endIndex, entries.length)}</span> de{' '}
              <span className="font-medium">{entries.length}</span>
            </div>
            
            {/* Controles de paginación */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex-1 sm:flex-none"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sm:inline">Ant.</span>
              </Button>
              <span className="text-sm text-gray-700 px-2">
                {currentPage}/{totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex-1 sm:flex-none"
              >
                <span className="sm:inline">Sig.</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DetailedTableView;
