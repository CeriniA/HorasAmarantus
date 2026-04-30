/**
 * Reporte Detallado de Registros - REFACTORIZADO
 * Componente principal que orquesta las vistas agrupada y detallada
 * Siguiendo principio de responsabilidad única
 */

import { useState, useMemo } from 'react';
import { FileText, Search, Calendar, List } from 'lucide-react';
import Card from '../common/Card';
import { groupByDay } from '../../utils/entryGrouping';
import { isAdminOrSuperadmin } from '../../utils/roleHelpers';
import { safeDate } from '../../utils/dateHelpers';
import { GroupedDayView } from './GroupedDayView';
import { DetailedTableView } from './DetailedTableView';

export const DetailedEntriesReport = ({ timeEntries, user, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grouped');
  const [sortField, setSortField] = useState('start_time');
  const [sortDirection, setSortDirection] = useState('desc');

  const canEdit = isAdminOrSuperadmin(user);

  const filteredEntries = useMemo(() => {
    if (!searchTerm) return timeEntries;
    const search = searchTerm.toLowerCase();
    return timeEntries.filter(entry => 
      (entry.description || '').toLowerCase().includes(search) ||
      (entry.users?.name || '').toLowerCase().includes(search) ||
      (entry.organizational_units?.name || '').toLowerCase().includes(search)
    );
  }, [timeEntries, searchTerm]);

  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => {
      let aVal, bVal;
      switch (sortField) {
        case 'start_time':
          aVal = safeDate(a.start_time);
          bVal = safeDate(b.start_time);
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
          aVal = a.hours || 0;
          bVal = b.hours || 0;
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredEntries, sortField, sortDirection]);

  const groupedByDay = useMemo(() => {
    if (viewMode !== 'grouped') return [];
    return groupByDay(sortedEntries);
  }, [sortedEntries, viewMode]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Detalle de Registros</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por descripción, usuario o unidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="inline-flex rounded-lg border border-gray-300 bg-white">
              <button
                onClick={() => setViewMode('grouped')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors flex items-center gap-2 ${viewMode === 'grouped' ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <Calendar className="h-4 w-4" />
                Agrupado por Día
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors flex items-center gap-2 ${viewMode === 'detailed' ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <List className="h-4 w-4" />
                Detallado
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {filteredEntries.length === timeEntries.length ? (
              <span>{timeEntries.length} {timeEntries.length === 1 ? 'registro' : 'registros'}</span>
            ) : (
              <span>{filteredEntries.length} de {timeEntries.length} registros</span>
            )}
          </div>
        </div>
      </Card>

      {viewMode === 'grouped' ? (
        <GroupedDayView groupedByDay={groupedByDay} canEdit={canEdit} onEdit={onEdit} onDelete={onDelete} />
      ) : (
        <DetailedTableView entries={sortedEntries} canEdit={canEdit} onEdit={onEdit} onDelete={onDelete} sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
      )}

      {filteredEntries.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay registros</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'No se encontraron registros con ese criterio de búsqueda' : 'No hay registros de tiempo en el período seleccionado'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};