/**
 * Reporte Detallado de Registros
 * Muestra tabla con todos los registros individuales (para admins)
 */

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Card from '../common/Card';
import Button from '../common/Button';
import { Search, ChevronLeft, ChevronRight, Edit2, Trash2, FileText } from 'lucide-react';
import { safeDate, parseLocalTime } from '../../utils/dateHelpers';
import { getUnitStyle } from '../../constants';
import { isAdminOrSuperadmin } from '../../utils/roleHelpers';

const ENTRIES_PER_PAGE = 20;

export const DetailedEntriesReport = ({ timeEntries, user, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('start_time');
  const [sortDirection, setSortDirection] = useState('desc');

  const canEdit = isAdminOrSuperadmin(user);

  // Filtrar y ordenar entradas
  const processedEntries = useMemo(() => {
    let filtered = timeEntries;

    // Búsqueda por descripción, usuario o unidad
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        (entry.description || '').toLowerCase().includes(search) ||
        (entry.users?.name || '').toLowerCase().includes(search) ||
        (entry.organizational_units?.name || '').toLowerCase().includes(search)
      );
    }

    // Ordenamiento
    filtered = [...filtered].sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case 'start_time':
          aVal = new Date(a.start_time);
          bVal = new Date(b.start_time);
          break;
        case 'user':
          aVal = a.users?.name || '';
          bVal = b.users?.name || '';
          break;
        case 'unit':
          aVal = a.organizational_units?.name || '';
          bVal = b.organizational_units?.name || '';
          break;
        case 'hours':
          aVal = a.total_hours || 0;
          bVal = b.total_hours || 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [timeEntries, searchTerm, sortField, sortDirection]);

  // Paginación
  const totalPages = Math.ceil(processedEntries.length / ENTRIES_PER_PAGE);
  const startIndex = (currentPage - 1) * ENTRIES_PER_PAGE;
  const endIndex = startIndex + ENTRIES_PER_PAGE;
  const currentEntries = processedEntries.slice(startIndex, endIndex);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  if (!timeEntries.length) {
    return (
      <Card title="Detalle de Registros">
        <div className="text-center py-12 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No hay registros para el período seleccionado</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con búsqueda y stats */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Detalle de Registros
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {processedEntries.length} registro{processedEntries.length !== 1 ? 's' : ''} encontrado{processedEntries.length !== 1 ? 's' : ''}
              {searchTerm && ` (filtrado de ${timeEntries.length} total${timeEntries.length !== 1 ? 'es' : ''})`}
            </p>
          </div>

          {/* Búsqueda */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset a primera página al buscar
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* Tabla */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  onClick={() => handleSort('start_time')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Fecha <SortIcon field="start_time" />
                </th>
                <th 
                  onClick={() => handleSort('user')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Usuario <SortIcon field="user" />
                </th>
                <th 
                  onClick={() => handleSort('unit')}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Unidad <SortIcon field="unit" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horario
                </th>
                <th 
                  onClick={() => handleSort('hours')}
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
                const startTime = parseLocalTime(entry.start_time);
                const endTime = parseLocalTime(entry.end_time);

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
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {entry.total_hours?.toFixed(1)}h
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
          <div className="px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                <span className="font-medium">{Math.min(endIndex, processedEntries.length)}</span> de{' '}
                <span className="font-medium">{processedEntries.length}</span> registros
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm text-gray-700">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DetailedEntriesReport;
