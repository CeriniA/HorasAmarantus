import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { TaskAccordion } from './TaskAccordion';
import { TimeInputPanel } from './TimeInputPanel';

/**
 * Componente de carga rápida de tiempo
 * Combina selección de tarea con entrada de tiempo
 */
export const QuickTimeEntry = ({ 
  isOpen, 
  onClose, 
  units = [], 
  onSave,
  loading = false 
}) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd')); // OK: fecha actual
  const [description, setDescription] = useState('');

  const handleTaskSelect = (task) => {
    setSelectedTask(task);
  };

  const handleTimeSelect = (hours) => {
    setSelectedTime(hours);
  };

  const handleSave = async () => {
    if (!selectedTask || !selectedTime || selectedTime <= 0) {
      return;
    }

    const startDateTime = `${date}T08:00:00`;
    const endHours = 8 + selectedTime;
    const endDateTime = `${date}T${String(Math.floor(endHours)).padStart(2, '0')}:${String(Math.round((endHours % 1) * 60)).padStart(2, '0')}:00`;

    const entryData = {
      organizational_unit_id: selectedTask.id,
      start_time: startDateTime,
      end_time: endDateTime,
      description: description || null
    };

    await onSave(entryData);
    handleClose();
  };

  const handleClose = () => {
    setSelectedTask(null);
    setSelectedTime(null);
    setDate(format(new Date(), 'yyyy-MM-dd')); // OK: fecha actual
    setDescription('');
    onClose();
  };

  const canSave = selectedTask && selectedTime && selectedTime > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="⚡ Cargar Horas - Vista Rápida"
      size="2xl"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            loading={loading}
            disabled={!canSave}
          >
            💾 Guardar Registro
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Selector de fecha */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary-600" />
            <div className="flex-1">
              <Input
                label="Fecha"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDate(format(new Date(), 'yyyy-MM-dd'))} // OK: fecha actual
                className="px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                Hoy
              </button>
              <button
                onClick={() => {
                  const yesterday = new Date(); // OK: fecha actual
                  yesterday.setDate(yesterday.getDate() - 1);
                  setDate(format(yesterday, 'yyyy-MM-dd'));
                }}
                className="px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                Ayer
              </button>
            </div>
          </div>
        </div>

        {/* Acordeón de tareas */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            1. Selecciona la tarea
          </h3>
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <TaskAccordion
              units={units}
              onTaskSelect={handleTaskSelect}
              selectedTaskId={selectedTask?.id}
            />
          </div>
        </div>

        {/* Panel de tiempo (solo si hay tarea seleccionada) */}
        {selectedTask && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              2. Ingresa el tiempo invertido
            </h3>
            <TimeInputPanel
              onTimeSelect={handleTimeSelect}
              selectedTime={selectedTime}
            />
          </div>
        )}

        {/* Descripción opcional */}
        {selectedTask && selectedTime && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              3. Descripción (opcional)
            </h3>
            <Input
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe brevemente lo que hiciste..."
              multiline
              rows={3}
            />
          </div>
        )}

        {/* Resumen */}
        {selectedTask && selectedTime && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
            <h4 className="text-sm font-semibold text-green-900 mb-2">
              💡 Resumen del registro
            </h4>
            <div className="space-y-1 text-sm text-green-800">
              <p>
                <span className="font-medium">Fecha:</span>{' '}
                {format(new Date(date), "dd 'de' MMMM, yyyy", { locale: es })}
              </p>
              <p>
                <span className="font-medium">Tarea:</span> {selectedTask.name}
              </p>
              <p>
                <span className="font-medium">Tiempo:</span>{' '}
                <span className="text-lg font-bold">{selectedTime.toFixed(2)}</span> horas
              </p>
              {description && (
                <p>
                  <span className="font-medium">Descripción:</span> {description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default QuickTimeEntry;
