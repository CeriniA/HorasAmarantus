import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Clock, Calendar, CalendarCheck } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { useOrganizationalUnits } from '../hooks/useOrganizationalUnits';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import HierarchicalSelect from '../components/common/HierarchicalSelect';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const TimeEntries = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { 
    timeEntries, 
    loading, 
    createEntry,
    updateEntry,
    deleteEntry 
  } = useTimeEntries(user?.id);
  const { units } = useOrganizationalUnits();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [alert, setAlert] = useState(null);
  const [saving, setSaving] = useState(false);

  // Formulario de nuevo registro
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '08:00',
    end_time: '17:00',
    organizational_unit_id: '',
    description: ''
  });

  const calculateHours = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    const diffMinutes = endMinutes - startMinutes;
    return diffMinutes / 60;
  };

  const totalHours = calculateHours(formData.start_time, formData.end_time);

  const handleCreate = async () => {
    // Validaciones
    if (!formData.organizational_unit_id) {
      setAlert({ type: 'error', message: 'Selecciona una unidad organizacional' });
      return;
    }

    if (!formData.date || !formData.start_time || !formData.end_time) {
      setAlert({ type: 'error', message: 'Completa todos los campos requeridos' });
      return;
    }

    if (totalHours <= 0) {
      setAlert({ type: 'error', message: 'La hora de fin debe ser mayor a la hora de inicio' });
      return;
    }

    setSaving(true);

    try {
      const startDateTime = `${formData.date}T${formData.start_time}:00`;
      const endDateTime = `${formData.date}T${formData.end_time}:00`;

      const entryData = {
        organizational_unit_id: formData.organizational_unit_id,
        start_time: startDateTime,
        end_time: endDateTime,
        description: formData.description || null
      };

      // Usar el hook para crear
      const result = await createEntry(entryData);

      if (result.success) {
        setAlert({ type: 'success', message: 'Registro creado correctamente' });
        
        // Resetear formulario
        setFormData({
          date: format(new Date(), 'yyyy-MM-dd'),
          start_time: '08:00',
          end_time: '17:00',
          organizational_unit_id: '',
          description: ''
        });
        setShowCreateModal(false);
      } else {
        setAlert({ type: 'error', message: result.error || 'Error al crear el registro' });
      }

    } catch (error) {
      console.error('Error creating entry:', error);
      setAlert({ type: 'error', message: 'Error al crear el registro' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry) => {
    // Extraer fecha y horas del entry
    const startDate = new Date(entry.start_time);
    const endDate = entry.end_time ? new Date(entry.end_time) : null;

    setEditingEntry({
      ...entry,
      date: format(startDate, 'yyyy-MM-dd'),
      start_time: format(startDate, 'HH:mm'),
      end_time: endDate ? format(endDate, 'HH:mm') : '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;

    const totalHours = calculateHours(editingEntry.start_time, editingEntry.end_time);

    if (totalHours <= 0) {
      setAlert({ type: 'error', message: 'La hora de fin debe ser mayor a la hora de inicio' });
      return;
    }

    const startDateTime = `${editingEntry.date}T${editingEntry.start_time}:00`;
    const endDateTime = `${editingEntry.date}T${editingEntry.end_time}:00`;

    const result = await updateEntry(editingEntry.id || editingEntry.client_id, {
      description: editingEntry.description,
      organizational_unit_id: editingEntry.organizational_unit_id,
      start_time: startDateTime,
      end_time: endDateTime,
      total_hours: totalHours
    });

    if (result.success) {
      setAlert({ type: 'success', message: 'Registro actualizado correctamente' });
      setShowEditModal(false);
      setEditingEntry(null);
    } else {
      setAlert({ type: 'error', message: result.error });
    }
  };

  const handleDelete = async (entry) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;

    const result = await deleteEntry(entry.id || entry.client_id);
    
    if (result.success) {
      setAlert({ type: 'success', message: 'Registro eliminado correctamente' });
    } else {
      setAlert({ type: 'error', message: result.error });
    }
  };

  const unitOptions = units.map(unit => ({
    value: unit.id,
    label: `${unit.name} (${unit.type})`
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registro de Horas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Registra tus horas de trabajo individual o por jornada completa
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary"
            onClick={() => navigate('/time-entries/bulk')}
          >
            <CalendarCheck className="h-5 w-5 mr-2" />
            Cargar Jornada
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Registro Individual
          </Button>
        </div>
      </div>

      {/* Alertas */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Historial */}
      <Card title="Historial de Registros" subtitle="Tus últimos registros de horas">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeEntries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No hay registros aún. Click en "Nuevo Registro" para comenzar.
                  </td>
                </tr>
              ) : (
                timeEntries.map((entry) => (
                  <tr key={entry.id || entry.client_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(entry.start_time), "dd/MM/yyyy", { locale: es })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">
                          {entry.organizational_units?.name || 'Sin unidad'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {entry.organizational_units?.type}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {entry.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(entry.start_time), "HH:mm")}
                      {entry.end_time && ` - ${format(new Date(entry.end_time), "HH:mm")}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {entry.total_hours?.toFixed(2)}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de crear registro */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Nuevo Registro de Horas"
          size="lg"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreate} loading={saving}>
                Guardar Registro
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Fecha"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Hora Inicio"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />

              <Input
                label="Hora Fin"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>

            {totalHours > 0 && (
              <div className="bg-primary-50 p-3 rounded-lg border border-primary-200">
                <p className="text-sm font-medium text-primary-900">
                  Total: <span className="text-lg font-bold">{totalHours.toFixed(2)}</span> horas
                </p>
              </div>
            )}

            <HierarchicalSelect
              units={units}
              value={formData.organizational_unit_id}
              onChange={(unitId) => setFormData({ ...formData, organizational_unit_id: unitId })}
              required
            />

            <Input
              label="Descripción (opcional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe la tarea realizada..."
            />
          </div>
        </Modal>
      )}

      {/* Modal de edición */}
      {showEditModal && editingEntry && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingEntry(null);
          }}
          title="Editar Registro"
          size="lg"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEntry(null);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit} loading={saving}>
                Guardar Cambios
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Fecha"
              type="date"
              value={editingEntry.date}
              onChange={(e) => setEditingEntry({ ...editingEntry, date: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Hora Inicio"
                type="time"
                value={editingEntry.start_time}
                onChange={(e) => setEditingEntry({ ...editingEntry, start_time: e.target.value })}
                required
              />

              <Input
                label="Hora Fin"
                type="time"
                value={editingEntry.end_time}
                onChange={(e) => setEditingEntry({ ...editingEntry, end_time: e.target.value })}
                required
              />
            </div>

            {calculateHours(editingEntry.start_time, editingEntry.end_time) > 0 && (
              <div className="bg-primary-50 p-3 rounded-lg border border-primary-200">
                <p className="text-sm font-medium text-primary-900">
                  Total: <span className="text-lg font-bold">
                    {calculateHours(editingEntry.start_time, editingEntry.end_time).toFixed(2)}
                  </span> horas
                </p>
              </div>
            )}

            <HierarchicalSelect
              units={units}
              value={editingEntry.organizational_unit_id}
              onChange={(unitId) => setEditingEntry({
                ...editingEntry,
                organizational_unit_id: unitId
              })}
              required
            />

            <Input
              label="Descripción (opcional)"
              value={editingEntry.description || ''}
              onChange={(e) => setEditingEntry({
                ...editingEntry,
                description: e.target.value
              })}
              placeholder="Describe la tarea realizada..."
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TimeEntries;
