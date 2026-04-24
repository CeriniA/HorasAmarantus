/**
 * Filtros Avanzados para Objetivos
 * Panel colapsable con filtros adicionales
 */

import { Calendar, TrendingUp } from 'lucide-react';
import { OBJECTIVE_VALIDATION } from '../../constants/validation';

export const ObjectiveAdvancedFilters = ({ filters, onFilterChange, units = [] }) => {
  return (
    <div className="pt-4 border-t border-gray-200 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Área/Proceso */}
        {units.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área/Proceso
            </label>
            <select
              value={filters.unit}
              onChange={(e) => onFilterChange('unit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            >
              <option value="all">Todas las áreas</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Urgencia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline h-4 w-4 mr-1" />
            Urgencia
          </label>
          <select
            value={filters.urgency}
            onChange={(e) => onFilterChange('urgency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="all">Todas</option>
            <option value="overdue">Vencidos</option>
            <option value="urgent">Urgente (≤{OBJECTIVE_VALIDATION.URGENCY_CRITICAL} días)</option>
            <option value="soon">Próximo (≤{OBJECTIVE_VALIDATION.URGENCY_HIGH} días)</option>
            <option value="normal">Normal (&gt;{OBJECTIVE_VALIDATION.URGENCY_HIGH} días)</option>
          </select>
        </div>

        {/* Progreso Mínimo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <TrendingUp className="inline h-4 w-4 mr-1" />
            Progreso Mínimo (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="0"
            value={filters.progressMin}
            onChange={(e) => onFilterChange('progressMin', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Progreso Máximo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Progreso Máximo (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="100"
            value={filters.progressMax}
            onChange={(e) => onFilterChange('progressMax', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Fecha Desde */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Inicio Desde
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange('dateFrom', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Fecha Hasta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Fin Hasta
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onFilterChange('dateTo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default ObjectiveAdvancedFilters;
