/**
 * Componente: WeeklyScheduleSelector
 * Selector de distribución semanal para objetivos asignados
 * Permite configurar horas por día y horarios opcionales
 */

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DAYS_OF_WEEK, DAY_LABELS_SHORT } from '../../constants';
import Input from '../common/Input';
import Button from '../common/Button';

// Días laborales por defecto (Lunes a Viernes)
const DEFAULT_WORK_DAYS = [
  DAYS_OF_WEEK.MONDAY,
  DAYS_OF_WEEK.TUESDAY,
  DAYS_OF_WEEK.WEDNESDAY,
  DAYS_OF_WEEK.THURSDAY,
  DAYS_OF_WEEK.FRIDAY
];

const WeeklyScheduleSelector = ({ totalHours, schedule = [], onChange }) => {
  const [weeklySchedule, setWeeklySchedule] = useState([]);

  // Inicializar schedule
  useEffect(() => {
    if (schedule && schedule.length > 0) {
      setWeeklySchedule(schedule);
    } else {
      // Inicializar con días laborales
      const defaultSchedule = DEFAULT_WORK_DAYS.map(day => ({
        day_of_week: day,
        hours_allocated: 0,
        start_time: '',
        end_time: '',
        is_active: true
      }));
      setWeeklySchedule(defaultSchedule);
    }
  }, [schedule]);

  // Calcular total de horas asignadas
  const totalAllocated = weeklySchedule
    .filter(day => day.is_active)
    .reduce((sum, day) => sum + (parseFloat(day.hours_allocated) || 0), 0);

  const remaining = totalHours - totalAllocated;

  // Toggle día activo
  const toggleDay = (dayOfWeek) => {
    const exists = weeklySchedule.find(d => d.day_of_week === dayOfWeek);
    
    if (exists) {
      // Si existe, toggle is_active
      const updated = weeklySchedule.map(d =>
        d.day_of_week === dayOfWeek
          ? { ...d, is_active: !d.is_active }
          : d
      );
      setWeeklySchedule(updated);
      onChange(updated);
    } else {
      // Si no existe, agregarlo
      const newDay = {
        day_of_week: dayOfWeek,
        hours_allocated: 0,
        start_time: '',
        end_time: '',
        is_active: true
      };
      const updated = [...weeklySchedule, newDay].sort((a, b) => a.day_of_week - b.day_of_week);
      setWeeklySchedule(updated);
      onChange(updated);
    }
  };

  // Actualizar horas de un día
  const updateHours = (dayOfWeek, hours) => {
    const updated = weeklySchedule.map(d =>
      d.day_of_week === dayOfWeek
        ? { ...d, hours_allocated: parseFloat(hours) || 0 }
        : d
    );
    setWeeklySchedule(updated);
    onChange(updated);
  };

  // Actualizar horario de un día
  const updateTime = (dayOfWeek, field, value) => {
    const updated = weeklySchedule.map(d =>
      d.day_of_week === dayOfWeek
        ? { ...d, [field]: value }
        : d
    );
    setWeeklySchedule(updated);
    onChange(updated);
  };

  // Distribuir horas equitativamente
  const distributeEvenly = () => {
    const activeDays = weeklySchedule.filter(d => d.is_active);
    if (activeDays.length === 0) return;

    const hoursPerDay = totalHours / activeDays.length;
    const updated = weeklySchedule.map(d =>
      d.is_active
        ? { ...d, hours_allocated: parseFloat(hoursPerDay.toFixed(2)) }
        : d
    );
    setWeeklySchedule(updated);
    onChange(updated);
  };

  // Días de la semana en orden
  const daysOrder = [
    DAYS_OF_WEEK.MONDAY,
    DAYS_OF_WEEK.TUESDAY,
    DAYS_OF_WEEK.WEDNESDAY,
    DAYS_OF_WEEK.THURSDAY,
    DAYS_OF_WEEK.FRIDAY,
    DAYS_OF_WEEK.SATURDAY,
    DAYS_OF_WEEK.SUNDAY
  ];

  return (
    <div className="space-y-4">
      {/* Header con resumen */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Distribución Semanal</h3>
          <p className="text-xs text-gray-500 mt-1">
            Total: {totalHours}h | Asignadas: {totalAllocated.toFixed(2)}h | 
            <span className={remaining < 0 ? 'text-red-600 font-medium' : 'text-gray-600'}>
              {' '}Restantes: {remaining.toFixed(2)}h
            </span>
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={distributeEvenly}
        >
          Distribuir Equitativamente
        </Button>
      </div>

      {/* Selector de días */}
      <div className="grid grid-cols-7 gap-2">
        {daysOrder.map(day => {
          const dayData = weeklySchedule.find(d => d.day_of_week === day);
          const isActive = dayData?.is_active || false;

          return (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`
                px-2 py-1 text-xs font-medium rounded transition-colors
                ${isActive
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {DAY_LABELS_SHORT[day]}
            </button>
          );
        })}
      </div>

      {/* Configuración por día */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {weeklySchedule
          .filter(d => d.is_active)
          .sort((a, b) => a.day_of_week - b.day_of_week)
          .map(day => (
            <div key={day.day_of_week} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {DAY_LABELS_SHORT[day.day_of_week]}
                </span>
                <button
                  type="button"
                  onClick={() => toggleDay(day.day_of_week)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Quitar
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* Horas */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Horas</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={day.hours_allocated || ''}
                    onChange={(e) => updateHours(day.day_of_week, e.target.value)}
                    placeholder="0"
                    className="text-sm"
                  />
                </div>

                {/* Hora inicio (opcional) */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Inicio</label>
                  <Input
                    type="time"
                    value={day.start_time || ''}
                    onChange={(e) => updateTime(day.day_of_week, 'start_time', e.target.value)}
                    className="text-sm"
                  />
                </div>

                {/* Hora fin (opcional) */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Fin</label>
                  <Input
                    type="time"
                    value={day.end_time || ''}
                    onChange={(e) => updateTime(day.day_of_week, 'end_time', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Advertencia si excede */}
      {remaining < 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">
            ⚠️ Has asignado más horas de las disponibles ({Math.abs(remaining).toFixed(2)}h de exceso)
          </p>
        </div>
      )}
    </div>
  );
};

WeeklyScheduleSelector.propTypes = {
  totalHours: PropTypes.number.isRequired,
  schedule: PropTypes.arrayOf(PropTypes.shape({
    day_of_week: PropTypes.number.isRequired,
    hours_allocated: PropTypes.number.isRequired,
    start_time: PropTypes.string,
    end_time: PropTypes.string,
    is_active: PropTypes.bool
  })),
  onChange: PropTypes.func.isRequired
};

export default WeeklyScheduleSelector;
