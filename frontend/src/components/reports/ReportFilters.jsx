/**
 * Componente de filtros del reporte
 */

import Select from '../common/Select';
import Input from '../common/Input';
import HierarchicalSelect from '../common/HierarchicalSelect';
import { Filter } from 'lucide-react';
import { USER_ROLES } from '../../constants';

export const ReportFilters = ({ 
  user,
  dateRange,
  setDateRange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedUser,
  setSelectedUser,
  selectedUnit,
  setSelectedUnit,
  users,
  units
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Select
        label="Rango de Fechas"
        value={dateRange}
        onChange={(e) => setDateRange(e.target.value)}
        options={[
          { value: 'week', label: 'Esta Semana' },
          { value: 'month', label: 'Este Mes' },
          { value: 'custom', label: 'Personalizado' }
        ]}
      />

      {dateRange === 'custom' && (
        <>
          <Input
            label="Fecha Inicio"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Fecha Fin"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </>
      )}

      {(user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPERADMIN) && (
        <Select
          label="Usuario"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          options={[
            { value: 'all', label: 'Todos' },
            ...users.map(u => ({ value: u.id, label: u.name }))
          ]}
        />
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Unidad Organizacional
        </label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="all-units"
              checked={selectedUnit === 'all'}
              onChange={(e) => setSelectedUnit(e.target.checked ? 'all' : '')}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="all-units" className="text-sm text-gray-700">
              Todas las unidades
            </label>
          </div>
          
          {selectedUnit !== 'all' && (
            <HierarchicalSelect
              units={units}
              value={selectedUnit === 'all' ? '' : selectedUnit}
              onChange={(unitId) => setSelectedUnit(unitId || 'all')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;
