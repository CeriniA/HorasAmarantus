/**
 * Componente de filtros del reporte
 */

import { useMemo } from 'react';
import Select from '../common/Select';
import Input from '../common/Input';
import HierarchicalSelect from '../common/HierarchicalSelect';
import MultiUserSelect from '../common/MultiUserSelect';
import { AlertCircle } from 'lucide-react';
import { USER_ROLES } from '../../constants';
import { filterUnitsByType } from '../../utils/comparisonHelpers';

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
  selectedUsers,
  setSelectedUsers,
  selectedAreas,
  setSelectedAreas,
  selectedProcesses,
  setSelectedProcesses,
  comparisonType,
  setComparisonType,
  selectedUnit,
  setSelectedUnit,
  users,
  units,
  onStartDateChange,
  onEndDateChange,
  showMultiUserSelect = false, // Para pestaña de comparativas
  showComparisonTypeSelector = false // Para mostrar selector de tipo de comparativa
}) => {
  // Validar si hay error de fecha negativa
  const hasDateError = useMemo(() => {
    if (dateRange === 'custom' && startDate && endDate) {
      return new Date(startDate) > new Date(endDate);
    }
    return false;
  }, [dateRange, startDate, endDate]);

  // Filtrar áreas y procesos usando helper
  const areas = useMemo(() => filterUnitsByType(units, 'area'), [units]);
  const processes = useMemo(() => filterUnitsByType(units, 'proceso'), [units]);

  return (
    <div className="space-y-4">
      {/* Alerta de error de fechas */}
      {hasDateError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                La fecha de inicio no puede ser posterior a la fecha de fin
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Select
        label="Rango de Fechas"
        value={dateRange}
        onChange={(e) => setDateRange(e.target.value)}
        options={[
          { value: 'week', label: 'Esta Semana' },
          { value: 'month', label: 'Este Mes' },
          { value: 'year', label: 'Este Año' },
          { value: 'lastYear', label: 'Año Anterior' },
          { value: 'custom', label: 'Personalizado' }
        ]}
      />

      {dateRange === 'custom' && (
        <>
          <Input
            label="Fecha Inicio"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange ? onStartDateChange(e.target.value) : setStartDate(e.target.value)}
          />
          <Input
            label="Fecha Fin"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange ? onEndDateChange(e.target.value) : setEndDate(e.target.value)}
            min={startDate}
          />
        </>
      )}

      {/* Selector de tipo de comparativa (solo en pestaña comparativa) */}
      {showComparisonTypeSelector && (
        <Select
          label="Tipo de Comparativa"
          value={comparisonType}
          onChange={(e) => setComparisonType(e.target.value)}
          options={[
            { value: 'users', label: 'Usuarios (máx 5)' },
            { value: 'areas', label: 'Áreas' },
            { value: 'processes', label: 'Procesos' },
            { value: 'top10', label: 'Top 10 Usuarios' }
          ]}
        />
      )}

      {/* Filtros según tipo de comparativa */}
      {(user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPERADMIN) && (
        <>
          {showComparisonTypeSelector ? (
            // Filtros para comparativa
            <>
              {comparisonType === 'users' && (
                <MultiUserSelect
                  users={users}
                  selectedUsers={selectedUsers}
                  onChange={setSelectedUsers}
                  label="Usuarios a Comparar"
                />
              )}
              {comparisonType === 'areas' && (
                <MultiUserSelect
                  users={areas.map(a => ({ id: a.id, name: a.name, email: a.type }))}
                  selectedUsers={selectedAreas}
                  onChange={setSelectedAreas}
                  label="Áreas a Comparar"
                />
              )}
              {comparisonType === 'processes' && (
                <MultiUserSelect
                  users={processes.map(p => ({ id: p.id, name: p.name, email: p.type }))}
                  selectedUsers={selectedProcesses}
                  onChange={setSelectedProcesses}
                  label="Procesos a Comparar"
                />
              )}
              {comparisonType === 'top10' && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <p className="text-sm text-blue-700">
                    Top 10 se genera automáticamente sin necesidad de selección
                  </p>
                </div>
              )}
            </>
          ) : showMultiUserSelect ? (
            // Filtro multi-usuario para otras pestañas
            <MultiUserSelect
              users={users}
              selectedUsers={selectedUsers}
              onChange={setSelectedUsers}
              label="Usuarios (Comparativa)"
            />
          ) : (
            // Filtro simple de usuario
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
        </>
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
    </div>
  );
};

export default ReportFilters;
