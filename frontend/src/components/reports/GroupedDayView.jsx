/**
 * Vista Agrupada por Día
 * Muestra registros agrupados por día con totales
 */

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock } from 'lucide-react';
import Card from '../common/Card';
import { getUnitStyle } from '../../constants';
import { VALIDATION } from '../../constants/validation';
import { safeDate } from '../../utils/dateHelpers';

export const GroupedDayView = ({ groupedByDay }) => {
  if (!groupedByDay || groupedByDay.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay registros para mostrar
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groupedByDay.map((dayGroup) => {
        // CRÍTICO: Usar safeDate() para evitar corrimiento de día por zona horaria
        const dayDate = safeDate(dayGroup.date);
        
        return (
          <Card key={dayGroup.date}>
            {/* Header del día */}
            <div className="border-b border-gray-200 pb-4 mb-4">
              {/* Título */}
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                {format(dayDate, "EEEE, d 'de' MMMM yyyy", { locale: es })}
              </h4>
              
              {/* Métricas en grid mobile-first */}
              <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-between">
                {/* Total de horas - Destacado en mobile */}
                <div className="col-span-2 sm:col-span-1 sm:order-last">
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl sm:text-2xl font-bold text-blue-600">
                      {dayGroup.totalHours.toFixed(VALIDATION.HOURS_DECIMAL_PLACES)}h
                    </p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                </div>
                
                {/* Contador de registros */}
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Registros</p>
                  <p className="text-sm font-medium text-gray-900">
                    {dayGroup.entries.length}
                  </p>
                </div>
                
                {/* Rango horario */}
                {dayGroup.workdayStart && dayGroup.workdayEnd && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Horario</p>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">
                        {dayGroup.workdayStart} - {dayGroup.workdayEnd}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lista de registros del día */}
            <div className="space-y-3">
              {dayGroup.entries.map((entry) => {
                return (
                  <div 
                    key={entry.id} 
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {/* Header: Unidad y Horas */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${getUnitStyle(entry.organizational_units?.type, 'badge')}`}>
                        {entry.organizational_units?.name || 'N/A'}
                      </span>
                      <span className="text-base font-bold text-blue-600 flex-shrink-0">
                        {entry.total_hours?.toFixed(VALIDATION.HOURS_DECIMAL_PLACES)}h
                      </span>
                    </div>
                    
                    {/* Usuario (si existe) */}
                    {entry.users?.name && (
                      <p className="text-xs text-gray-500 mb-1">
                        {entry.users.name}
                      </p>
                    )}
                    
                    {/* Descripción */}
                    {entry.description && (
                      <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                        {entry.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default GroupedDayView;
