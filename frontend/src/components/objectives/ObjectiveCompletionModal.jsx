/**
 * Modal de Cumplimiento de Objetivo
 * Permite marcar si un objetivo se cumplió o no, con notas
 */

import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const ObjectiveCompletionModal = ({ objective, onClose, onSubmit }) => {
  const [isCompleted, setIsCompleted] = useState(true);
  const [completionNotes, setCompletionNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      is_completed: isCompleted,
      completion_notes: completionNotes.trim() || null
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Marcar Cumplimiento del Objetivo"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del Objetivo */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">{objective?.name}</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Horas Objetivo:</span> {objective?.target_hours}h</p>
            <p>
              <span className="font-medium">Período:</span>{' '}
              {objective?.start_date && format(new Date(objective.start_date), 'dd/MM/yyyy', { locale: es })} -{' '}
              {objective?.end_date && format(new Date(objective.end_date), 'dd/MM/yyyy', { locale: es })}
            </p>
          </div>
        </div>

        {/* Criterios de Cumplimiento */}
        {objective?.success_criteria && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Criterios Definidos:</p>
            <pre className="text-sm text-blue-700 whitespace-pre-wrap font-sans">
              {objective.success_criteria}
            </pre>
          </div>
        )}

        {/* Selector de Cumplimiento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            ¿Se cumplió el objetivo? *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setIsCompleted(true)}
              className={`p-4 border-2 rounded-lg transition-all ${
                isCompleted
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <CheckCircle className={`h-8 w-8 mx-auto mb-2 ${
                isCompleted ? 'text-green-600' : 'text-gray-400'
              }`} />
              <p className={`font-semibold ${
                isCompleted ? 'text-green-900' : 'text-gray-700'
              }`}>
                Sí, Cumplido
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Se lograron los criterios definidos
              </p>
            </button>

            <button
              type="button"
              onClick={() => setIsCompleted(false)}
              className={`p-4 border-2 rounded-lg transition-all ${
                !isCompleted
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <XCircle className={`h-8 w-8 mx-auto mb-2 ${
                !isCompleted ? 'text-red-600' : 'text-gray-400'
              }`} />
              <p className={`font-semibold ${
                !isCompleted ? 'text-red-900' : 'text-gray-700'
              }`}>
                No Cumplido
              </p>
              <p className="text-xs text-gray-600 mt-1">
                No se lograron los criterios
              </p>
            </button>
          </div>
        </div>

        {/* Notas de Cumplimiento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas de Cumplimiento
          </label>
          <textarea
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder={
              isCompleted
                ? "Ej: Completado exitosamente. Se entregaron todos los reportes a tiempo con cero observaciones."
                : "Ej: No se completaron las conciliaciones bancarias. Faltaron 3 de 10 conciliaciones por problemas de acceso al sistema."
            }
          />
          <p className="text-xs text-gray-500 mt-1">
            Opcional: Agrega contexto sobre el cumplimiento o incumplimiento
          </p>
        </div>

        {/* Advertencia */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Importante:</strong> Esta acción marcará el objetivo como &quot;Completado&quot; y registrará
            la fecha y usuario que realizó la evaluación. Asegúrate de que la información sea correcta.
          </p>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className={isCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
            Confirmar {isCompleted ? 'Cumplimiento' : 'Incumplimiento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ObjectiveCompletionModal;
