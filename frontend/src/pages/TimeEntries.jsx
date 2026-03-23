import { useState } from 'react';
import { Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { useOrganizationalUnits } from '../hooks/useOrganizationalUnits';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { BulkTimeEntry } from '../components/timeEntry/BulkTimeEntry';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const TimeEntries = () => {
  const { user } = useAuthContext();
  const { 
    timeEntries, 
    createEntry,
    updateEntry,
    deleteEntry 
  } = useTimeEntries(user?.id);
  const { units } = useOrganizationalUnits();

  const [showBulkEntry, setShowBulkEntry] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editForm, setEditForm] = useState({ startTime: '', endTime: '' });
  const [alert, setAlert] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expandedDays, setExpandedDays] = useState(new Set());
  
  // Filtros
  const [filterMode, setFilterMode] = useState('month'); // 'month' | 'year' | 'all'
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedYear, setSelectedYear] = useState(format(new Date(), 'yyyy'));

  // Filtrar registros según modo seleccionado
  const filteredEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.start_time);
    
    if (filterMode === 'month') {
      const entryMonth = format(entryDate, 'yyyy-MM');
      return entryMonth === selectedMonth;
    } else if (filterMode === 'year') {
      const entryYear = format(entryDate, 'yyyy');
      return entryYear === selectedYear;
    }
    
    return true; // 'all' - mostrar todos
  });

  const handleBulkSave = async (entries) => {
    setSaving(true);

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const entryData of entries) {
        console.log('📤 Enviando entry:', entryData); // Debug
        const result = await createEntry(entryData);
        console.log('📥 Resultado:', result); // Debug
        
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          errors.push(result.error);
        }
      }

      if (errorCount === 0) {
        setAlert({ type: 'success', message: `✅ ${successCount} ${successCount === 1 ? 'registro creado' : 'registros creados'} correctamente` });
        setShowBulkEntry(false);
      } else {
        console.error('❌ Errores:', errors);
        setAlert({ type: 'warning', message: `⚠️ ${successCount} creados, ${errorCount} con error. Ver consola.` });
      }
    } catch (error) {
      console.error('Error creating entries:', error);
      setAlert({ type: 'error', message: `Error: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (date) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDays(newExpanded);
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setEditForm({
      startTime: format(new Date(entry.start_time), 'HH:mm'),
      endTime: format(new Date(entry.end_time), 'HH:mm')
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;

    setSaving(true);
    try {
      const date = format(new Date(editingEntry.start_time), 'yyyy-MM-dd');
      const newStartTime = `${date}T${editForm.startTime}:00`;
      const newEndTime = `${date}T${editForm.endTime}:00`;

      const result = await updateEntry(editingEntry.id, {
        start_time: newStartTime,
        end_time: newEndTime
      });

      if (result.success) {
        setAlert({ type: 'success', message: '✅ Registro actualizado correctamente' });
        setShowEditModal(false);
        setEditingEntry(null);
      } else {
        setAlert({ type: 'error', message: result.error || 'Error al actualizar' });
      }
    } catch (error) {
      console.error('Error updating entry:', error);
      setAlert({ type: 'error', message: `Error: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entry) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;

    const result = await deleteEntry(entry.id || entry.client_id);
    
    if (result.success) {
      setAlert({ type: 'success', message: 'Registro eliminado correctamente' });
    } else {
      setAlert({ type: 'error', message: result.error });
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Registro de Horas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona y visualiza tus registros de tiempo
        </p>
      </div>

      {/* Controles superiores: Filtros + Botón Cargar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Filtros */}
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="month">Por Mes</option>
            <option value="year">Por Año</option>
            <option value="all">Todos</option>
          </select>

          {filterMode === 'month' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          )}

          {filterMode === 'year' && (
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              min="2020"
              max="2030"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-24 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          )}

          <span className="text-sm text-gray-600">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        {/* Botón Cargar */}
        <Button onClick={() => setShowBulkEntry(true)}>
          📋 Cargar Horas
        </Button>
      </div>

      {/* Alertas */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Historial - ULTRA COMPACTO */}
      <Card>
        <div className="divide-y divide-gray-100">
        {Object.entries(
          filteredEntries.reduce((acc, entry) => {
            const date = format(new Date(entry.start_time), 'yyyy-MM-dd');
            if (!acc[date]) acc[date] = [];
            acc[date].push(entry);
            return acc;
          }, {})
        ).sort(([a], [b]) => new Date(b) - new Date(a)).map(([date, entries]) => {
          const totalHours = entries.reduce((sum, entry) => {
            return sum + ((new Date(entry.end_time) - new Date(entry.start_time)) / (1000 * 60 * 60));
          }, 0);
          const isExpanded = expandedDays.has(date);

          return (
            <div key={date}>
              {/* Header del día - ULTRA COMPACTO */}
              <button
                onClick={() => toggleDay(date)}
                className="w-full bg-gray-50 px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-primary-600 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-primary-600 flex-shrink-0" />
                    )}
                    <div className="text-left min-w-0">
                      <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">
                        {format(new Date(date), "EEE, dd MMM yyyy", { locale: es })}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {entries.length} {entries.length === 1 ? 'reg' : 'regs'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg md:text-xl font-bold text-primary-600">
                      {totalHours.toFixed(2)}h
                    </p>
                  </div>
                </div>
              </button>

              {/* Tabla de registros del día - COLAPSABLE */}
              {isExpanded && (
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Tarea
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Horas
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {entries.map((entry) => {
                      const hours = ((new Date(entry.end_time) - new Date(entry.start_time)) / (1000 * 60 * 60)).toFixed(2);
                      
                      return (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-sm text-gray-900">
                            <div className="font-medium">{entry.organizational_units?.name || 'Sin asignar'}</div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-base font-bold text-primary-600 text-right">
                            {hours}h
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                            <div className="flex gap-1 justify-end">
                              <button
                                onClick={() => handleEdit(entry)}
                                className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                                title="Editar"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(entry)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          );
        })}

        {filteredEntries.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            <p className="text-lg font-medium">No hay registros de tiempo</p>
            <p className="mt-2 text-sm">¡Comienza creando uno con el botón &quot;📋 Cargar Horas&quot;!</p>
          </div>
        )}
        </div>
      </Card>

      {/* Modal de carga múltiple */}
      <BulkTimeEntry
        isOpen={showBulkEntry}
        onClose={() => setShowBulkEntry(false)}
        units={units}
        onSave={handleBulkSave}
        loading={saving}
      />

      {/* Modal de edición */}
      {editingEntry && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingEntry(null);
          }}
          title="✏️ Editar Registro"
          footer={
            <>
              <Button variant="secondary" onClick={() => {
                setShowEditModal(false);
                setEditingEntry(null);
              }}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit} loading={saving}>
                💾 Guardar Cambios
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Fecha"
              type="date"
              value={format(new Date(editingEntry.start_time), 'yyyy-MM-dd')}
              disabled
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Hora Inicio"
                type="time"
                value={editForm.startTime}
                onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                required
              />
              <Input
                label="Hora Fin"
                type="time"
                value={editForm.endTime}
                onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                required
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Tarea:</strong> {editingEntry.organizational_units?.name || 'Sin asignar'}
              </p>
              <p className="text-sm text-blue-800 mt-2">
                <strong>Total:</strong> {(() => {
                  if (!editForm.startTime || !editForm.endTime) return '0.00';
                  const start = new Date(`2000-01-01T${editForm.startTime}:00`);
                  const end = new Date(`2000-01-01T${editForm.endTime}:00`);
                  const hours = (end - start) / (1000 * 60 * 60);
                  return hours > 0 ? hours.toFixed(2) : '0.00';
                })()}h
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TimeEntries;
