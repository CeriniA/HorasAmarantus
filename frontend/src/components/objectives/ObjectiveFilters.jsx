/**
 * Filtros Avanzados para Objetivos
 * Permite filtrar por estado, tipo, fechas, progreso y búsqueda
 */

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import Button from '../common/Button';
import ObjectiveAdvancedFilters from './ObjectiveAdvancedFilters';
import { OBJECTIVE_STATUS, OBJECTIVE_STATUS_LABELS, OBJECTIVE_TYPES, OBJECTIVE_TYPE_LABELS } from '../../constants';

export const ObjectiveFilters = ({ 
  onFilterChange, 
  totalCount = 0, 
  filteredCount = 0,
  units = []
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all',
    unit: 'all',
    dateFrom: '',
    dateTo: '',
    progressMin: '',
    progressMax: '',
    urgency: 'all'
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      status: 'all',
      type: 'all',
      unit: 'all',
      dateFrom: '',
      dateTo: '',
      progressMin: '',
      progressMax: '',
      urgency: 'all'
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return filters.search || 
           filters.status !== 'all' || 
           filters.type !== 'all' || 
           filters.unit !== 'all' ||
           filters.dateFrom ||
           filters.dateTo ||
           filters.progressMin ||
           filters.progressMax ||
           filters.urgency !== 'all';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4">
      {/* Filtros Básicos */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Búsqueda */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Estado */}
        <div className="w-full lg:w-48">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="all">Todos los Estados</option>
            <option value={OBJECTIVE_STATUS.PLANNED}>{OBJECTIVE_STATUS_LABELS[OBJECTIVE_STATUS.PLANNED]}</option>
            <option value={OBJECTIVE_STATUS.IN_PROGRESS}>{OBJECTIVE_STATUS_LABELS[OBJECTIVE_STATUS.IN_PROGRESS]}</option>
            <option value={OBJECTIVE_STATUS.COMPLETED}>{OBJECTIVE_STATUS_LABELS[OBJECTIVE_STATUS.COMPLETED]}</option>
            <option value={OBJECTIVE_STATUS.OVERDUE}>{OBJECTIVE_STATUS_LABELS[OBJECTIVE_STATUS.OVERDUE]}</option>
            <option value={OBJECTIVE_STATUS.FAILED}>{OBJECTIVE_STATUS_LABELS[OBJECTIVE_STATUS.FAILED]}</option>
            <option value={OBJECTIVE_STATUS.CANCELLED}>{OBJECTIVE_STATUS_LABELS[OBJECTIVE_STATUS.CANCELLED]}</option>
          </select>
        </div>

        {/* Tipo */}
        <div className="w-full lg:w-40">
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="all">Todos los Tipos</option>
            <option value={OBJECTIVE_TYPES.COMPANY}>{OBJECTIVE_TYPE_LABELS[OBJECTIVE_TYPES.COMPANY]}</option>
            <option value={OBJECTIVE_TYPES.ASSIGNED}>{OBJECTIVE_TYPE_LABELS[OBJECTIVE_TYPES.ASSIGNED]}</option>
            <option value={OBJECTIVE_TYPES.PERSONAL}>{OBJECTIVE_TYPE_LABELS[OBJECTIVE_TYPES.PERSONAL]}</option>
          </select>
        </div>

        {/* Botón Filtros Avanzados */}
        <Button
          variant={showAdvanced ? 'primary' : 'outline'}
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Avanzados</span>
        </Button>
      </div>

      {/* Filtros Avanzados */}
      {showAdvanced && (
        <ObjectiveAdvancedFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          units={units}
        />
      )}

      {/* Resumen y Acciones */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Mostrando <span className="font-semibold text-gray-900">{filteredCount}</span> de{' '}
          <span className="font-semibold text-gray-900">{totalCount}</span> objetivos
          {hasActiveFilters() && (
            <span className="ml-2 text-primary-600 font-medium">
              (filtros activos)
            </span>
          )}
        </div>

        {hasActiveFilters() && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Limpiar Filtros
          </Button>
        )}
      </div>
    </div>
  );
};

export default ObjectiveFilters;
