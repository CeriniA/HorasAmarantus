import { useState, useEffect } from 'react';
import { Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { useOrganizationalUnits } from '../hooks/useOrganizationalUnits';
import { useUsers } from '../hooks/useUsers';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { BulkTimeEntry } from '../components/timeEntry/BulkTimeEntry';
import { timeEntriesService } from '../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { safeDate, extractDate, calculateHours } from '../utils/dateHelpers';

export const TimeEntries = () => {
  const { user } = useAuthContext();
  const { 
    timeEntries,
    setTimeEntries,
    loading,
    createEntry,
    updateEntry,
    deleteEntry 
  } = useTimeEntries(user?.id);
  
  // Detectar si está offline
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  const { units } = useOrganizationalUnits();
  const { users } = useUsers(); // Para el selector de usuarios en admins

  const [showBulkEntry, setShowBulkEntry] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editForm, setEditForm] = useState({ startTime: '', endTime: '' });
  const [alert, setAlert] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [expandedDays, setExpandedDays] = useState(new Set());
  
  // Filtros
  const [filterMode, setFilterMode] = useState('month'); // 'month' | 'year' | 'all'
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedYear, setSelectedYear] = useState(format(new Date(), 'yyyy'));

  // Filtrar registros según modo seleccionado
  // TODOS los usuarios (incluyendo admins) solo ven SUS PROPIOS registros
  const filteredEntries = timeEntries.filter(entry => {
    // Filtro 1: Solo registros del usuario actual
    const isMyEntry = entry.user_id === user?.id;
    
    // Filtro 2: Por fecha
    let dateMatch = true;
    if (filterMode === 'month' || filterMode === 'year') {
      const entryDate = safeDate(entry.start_time);
      if (!entryDate) return false; // Ignorar entries sin fecha válida
      
      if (filterMode === 'month') {
        const entryMonth = format(entryDate, 'yyyy-MM');
        dateMatch = entryMonth === selectedMonth;
      } else if (filterMode === 'year') {
        const entryYear = format(entryDate, 'yyyy');
        dateMatch = entryYear === selectedYear;
      }
    }
    
    return isMyEntry && dateMatch;
  });

  const handleBulkSave = async (entries) => {
    setOperationLoading(true);

    try {
      const isOnline = navigator.onLine;
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
        setAlert({ type: 'success', message: `✅ ${successCount} ${successCount === 1 ? 'registro creado' : 'registros creados'} correctamente${!isOnline ? ' (se sincronizará cuando haya conexión)' : ''}` });
        setShowBulkEntry(false);
      } else {
        console.error('❌ Errores:', errors);
        setAlert({ type: 'warning', message: `⚠️ ${successCount} creados, ${errorCount} con error. Ver consola.` });
      }
    } catch (error) {
      console.error('Error creating entries:', error);
      setAlert({ type: 'error', message: `Error: ${error.message}` });
    } finally {
      setOperationLoading(false);
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
      startTime: format(safeDate(entry.start_time), 'HH:mm'),
      endTime: format(safeDate(entry.end_time), 'HH:mm')
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;

    setOperationLoading(true);
    try {
      const date = extractDate(editingEntry.start_time);
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
      setOperationLoading(false);
    }
  };

  const handleDelete = async (entry) => {
    // eslint-disable-next-line no-restricted-globals
    if (!window.confirm('¿Estás seguro de eliminar este registro?')) return;

    const result = await deleteEntry(entry.id || entry.client_id);
    
    if (result.success) {
      setAlert({ type: 'success', message: 'Registro eliminado correctamente' });
    } else {
      setAlert({ type: 'error', message: result.error });
    }
  };


  // Mostrar loading SOLO en carga inicial (sin datos previos)
  if (loading && timeEntries.length === 0 && !operationLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando registros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Registro de Horas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona y visualiza tus registros de tiempo personales
        </p>
        {(user?.role === 'admin' || user?.role === 'superadmin') && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Nota:</strong> Esta sección muestra solo tus registros personales. 
              Para ver datos de otros usuarios, ve a <strong>Reportes</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Controles superiores: Filtros + Botón Cargar */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1">
            <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
            
            <div className="flex flex-wrap gap-2 items-center">
              {/* Botones de modo */}
              <div className="inline-flex rounded-lg border border-gray-300 bg-white">
                <button
                  onClick={() => setFilterMode('month')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                    filterMode === 'month'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Mes
                </button>
                <button
                  onClick={() => setFilterMode('year')}
                  className={`px-4 py-2 text-sm font-medium border-x border-gray-300 transition-colors ${
                    filterMode === 'year'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Año
                </button>
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                    filterMode === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Todo
                </button>
              </div>

              {/* Selector de mes */}
              {filterMode === 'month' && (
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              )}

              {/* Selector de año */}
              {filterMode === 'year' && (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              )}

              {/* Contador de registros */}
              <div className="px-3 py-2 bg-gray-100 rounded-lg">
                <span className="text-sm font-semibold text-gray-900">
                  {filteredEntries.length}
                </span>
                <span className="text-sm text-gray-600 ml-1">
                  {filteredEntries.length === 1 ? 'registro' : 'registros'}
                </span>
              </div>
            </div>
          </div>

          {/* Botón Cargar */}
          <Button onClick={() => setShowBulkEntry(true)} className="w-full sm:w-auto">
            📋 Cargar Horas
          </Button>
        </div>
      </Card>

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
            // Extraer solo la fecha del timestamp (ignorando la hora y zona horaria)
            const date = entry.start_time.split('T')[0];
            if (!acc[date]) acc[date] = [];
            acc[date].push(entry);
            return acc;
          }, {})
        ).sort(([a], [b]) => new Date(b) - new Date(a)).map(([date, entries]) => {
          const totalHours = entries.reduce((sum, entry) => {
            return sum + calculateHours(entry.start_time, entry.end_time);
          }, 0);
          const isExpanded = expandedDays.has(date);

          return (
            <div key={date}>
              {/* Header del día - ULTRA COMPACTO */}
              <div className="w-full bg-gray-50 px-3 py-2 flex items-center justify-between gap-2">
                <button
                  onClick={() => toggleDay(date)}
                  className="flex items-center gap-2 min-w-0 flex-1 hover:bg-gray-100 transition-colors py-1 px-2 rounded"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-primary-600 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-primary-600 flex-shrink-0" />
                    )}
                    <div className="text-left min-w-0">
                      <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">
                        {format(safeDate(date), "EEE, dd MMM yyyy", { locale: es })}
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
                </button>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (isOffline) {
                      setAlert({ type: 'warning', message: 'Debes estar conectado para eliminar registros' });
                      return;
                    }
                    // eslint-disable-next-line no-restricted-globals
                    if (window.confirm(`¿Eliminar todos los ${entries.length} registros del ${format(safeDate(date), "dd/MM/yyyy", { locale: es })}?`)) {
                      try {
                        // Eliminar todos en una sola petición al backend
                        const ids = entries.map(entry => entry.id);
                        await timeEntriesService.deleteBulk(ids);
                        
                        // Actualizar estado local filtrando los eliminados
                        setTimeEntries(prev => prev.filter(entry => !ids.includes(entry.id)));
                        
                        setAlert({ type: 'success', message: `${entries.length} registros eliminados` });
                      } catch (error) {
                        setAlert({ type: 'error', message: 'Error al eliminar registros' });
                      }
                    }
                  }}
                  className={`p-2 rounded transition-colors flex-shrink-0 ${
                    isOffline 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                  title={isOffline ? 'Debes estar conectado para eliminar' : 'Eliminar día completo'}
                  disabled={isOffline}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

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
                      const hours = calculateHours(entry.start_time, entry.end_time).toFixed(2);
                      
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
                                onClick={() => {
                                  if (isOffline) {
                                    setAlert({ type: 'warning', message: 'Debes estar conectado para editar registros' });
                                    return;
                                  }
                                  handleEdit(entry);
                                }}
                                className={`p-1 rounded ${
                                  isOffline 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : 'text-primary-600 hover:bg-primary-50'
                                }`}
                                title={isOffline ? 'Debes estar conectado para editar' : 'Editar'}
                                disabled={isOffline}
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (isOffline) {
                                    setAlert({ type: 'warning', message: 'Debes estar conectado para eliminar registros' });
                                    return;
                                  }
                                  handleDelete(entry);
                                }}
                                className={`p-1 rounded ${
                                  isOffline 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : 'text-red-600 hover:bg-red-50'
                                }`}
                                title={isOffline ? 'Debes estar conectado para eliminar' : 'Eliminar'}
                                disabled={isOffline}
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
        loading={operationLoading}
        currentUser={user}
        users={users}
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
              <Button onClick={handleSaveEdit} loading={operationLoading}>
                💾 Guardar Cambios
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Fecha"
              type="date"
              value={extractDate(editingEntry.start_time)}
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
