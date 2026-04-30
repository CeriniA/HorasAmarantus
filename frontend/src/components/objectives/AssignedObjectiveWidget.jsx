/**
 * Componente: AssignedObjectiveWidget
 * Widget para mostrar el objetivo asignado al usuario en su dashboard
 */

import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Target, Calendar, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { safeDate } from '../../utils/dateHelpers';
import { DAY_LABELS_SHORT, OBJECTIVE_STATUS } from '../../constants';
import Card from '../common/Card';
import Button from '../common/Button';
import { getObjectiveSchedule } from '../../services/objectives.service';
import logger from '../../utils/logger';

const AssignedObjectiveWidget = ({ objective, onComplete }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSchedule = useCallback(async () => {
    if (!objective?.id) return;

    try {
      setLoading(true);
      const data = await getObjectiveSchedule(objective.id);
      setSchedule(data);
    } catch (error) {
      logger.error('Error al cargar distribución semanal:', error);
    } finally {
      setLoading(false);
    }
  }, [objective?.id]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  if (!objective) {
    return null;
  }

  // Calcular progreso (si hay horas reales registradas)
  const progress = objective.real_hours && objective.target_hours
    ? Math.min((objective.real_hours / objective.target_hours) * 100, 100)
    : 0;

  // Días activos en la distribución
  const activeDays = schedule.filter(d => d.is_active && d.hours_allocated > 0);

  return (
    <Card className="bg-gradient-to-br from-primary-50 to-white border-primary-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Target className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {objective.name}
            </h3>
            <p className="text-sm text-gray-600">Objetivo Asignado</p>
          </div>
        </div>
        {objective.status === OBJECTIVE_STATUS.COMPLETED && (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Completado</span>
          </div>
        )}
      </div>

      {/* Descripción */}
      {objective.description && (
        <p className="text-sm text-gray-700 mb-4">
          {objective.description}
        </p>
      )}

      {/* Período */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <Calendar className="h-4 w-4" />
        <span>
          {format(safeDate(objective.start_date), 'dd/MM/yyyy')} - {format(safeDate(objective.end_date), 'dd/MM/yyyy')}
        </span>
      </div>

      {/* Horas Objetivo */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Progreso de Horas</span>
          <span className="font-medium text-gray-900">
            {objective.real_hours || 0}h / {objective.target_hours}h
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              progress >= 100 ? 'bg-green-500' : 'bg-primary-600'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {progress.toFixed(1)}% completado
        </p>
      </div>

      {/* Distribución Semanal */}
      {!loading && activeDays.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Clock className="h-4 w-4" />
            <span>Distribución Semanal</span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {activeDays
              .sort((a, b) => a.day_of_week - b.day_of_week)
              .map(day => (
                <div
                  key={day.day_of_week}
                  className="text-center p-2 bg-white border border-primary-200 rounded"
                >
                  <div className="text-xs font-medium text-gray-600">
                    {DAY_LABELS_SHORT[day.day_of_week]}
                  </div>
                  <div className="text-sm font-semibold text-primary-600">
                    {day.hours_allocated}h
                  </div>
                  {day.start_time && day.end_time && (
                    <div className="text-xs text-gray-500 mt-1">
                      {day.start_time.slice(0, 5)} - {day.end_time.slice(0, 5)}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Criterios de Éxito */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Criterios de Éxito:
        </h4>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
            {objective.success_criteria}
          </pre>
        </div>
      </div>

      {/* Botón de Marcar Completado */}
      {objective.status !== OBJECTIVE_STATUS.COMPLETED && onComplete && (
        <Button
          onClick={() => onComplete(objective)}
          variant="primary"
          className="w-full"
        >
          Marcar como Completado
        </Button>
      )}

      {/* Notas de Cumplimiento */}
      {objective.status === OBJECTIVE_STATUS.COMPLETED && objective.completion_notes && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-medium text-green-800 mb-1">
            Notas de Cumplimiento:
          </h4>
          <p className="text-sm text-green-700">
            {objective.completion_notes}
          </p>
        </div>
      )}
    </Card>
  );
};

AssignedObjectiveWidget.propTypes = {
  objective: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    start_date: PropTypes.string.isRequired,
    end_date: PropTypes.string.isRequired,
    target_hours: PropTypes.number.isRequired,
    real_hours: PropTypes.number,
    success_criteria: PropTypes.string,
    status: PropTypes.string.isRequired,
    is_completed: PropTypes.bool,
    completion_notes: PropTypes.string
  }),
  onComplete: PropTypes.func
};

export default AssignedObjectiveWidget;
