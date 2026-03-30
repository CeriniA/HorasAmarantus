import { useState, useMemo, useEffect } from 'react';
import { Calendar, Save, X, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { getAreaColor } from '../../utils/areaColors';
import { TemplateManager } from './TemplateManager';
import { isAdminOrSuperadmin, filterUsersByPermission } from '../../utils/roleHelpers';
import { CONFIG } from '../../constants/config';
import { getStorageKey } from '../../constants/config';
import { calculateHours, createTimestampWithTimezone } from '../../utils/dateHelpers';

/**
 * Componente de carga/edición múltiple de tiempo
 * Permite cargar varias tareas con sus tiempos en una sola vista
 * Soporta modo creación y edición
 * 
 * @param {string} mode - 'create' o 'edit'
 * @param {string} editingDate - Fecha del día a editar (solo en modo edit)
 * @param {Array} existingEntries - Registros existentes del día (solo en modo edit)
 * @param {Function} onUpdate - Callback para actualizar registros (solo en modo edit)
 * @param {Function} onDelete - Callback para eliminar registros (solo en modo edit)
 */
export const BulkTimeEntry = ({ 
  isOpen, 
  onClose, 
  units = [], 
  onSave,
  loading = false,
  currentUser = null,
  users = [], // Lista de usuarios para admins
  mode = 'create', // 'create' | 'edit'
  editingDate = null,
  existingEntries = [],
  allTimeEntries = [] // Todos los registros para validar duplicados
}) => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd')); // OK: fecha actual
  const [timeEntries, setTimeEntries] = useState({});
  const [descriptions, setDescriptions] = useState({}); // Descripciones por tarea
  const [expandedAreas, setExpandedAreas] = useState(new Set());
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(currentUser?.id || null);
  
  // Actualizar selectedUserId cuando cambia currentUser
  useEffect(() => {
    if (currentUser?.id) {
      setSelectedUserId(currentUser.id);
    }
  }, [currentUser]);
  
  // Verificar si el usuario actual es admin o superadmin
  const isAdmin = isAdminOrSuperadmin(currentUser);
  
  // Filtrar usuarios según el rol actual usando helper
  const availableUsers = useMemo(() => {
    return filterUsersByPermission(users, currentUser);
  }, [users, currentUser]);
  
  // Rango horario general (usando configuración centralizada)
  const [workdayStart, setWorkdayStart] = useState(CONFIG.DEFAULT_WORKDAY_START);
  const [workdayEnd, setWorkdayEnd] = useState(CONFIG.DEFAULT_WORKDAY_END);
  
  // Cargar última preferencia de horario (usando storage key centralizado)
  useEffect(() => {
    const savedWorkday = localStorage.getItem(getStorageKey('lastWorkdayRange'));
    if (savedWorkday) {
      try {
        const { start, end } = JSON.parse(savedWorkday);
        setWorkdayStart(start);
        setWorkdayEnd(end);
      } catch (e) {
        // Usar valores por defecto de CONFIG
      }
    }
  }, []);
  
  // Guardar preferencia cuando cambia
  useEffect(() => {
    if (workdayStart && workdayEnd) {
      localStorage.setItem(getStorageKey('lastWorkdayRange'), JSON.stringify({
        start: workdayStart,
        end: workdayEnd
      }));
    }
  }, [workdayStart, workdayEnd]);
  
  // Resetear o pre-cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && editingDate && existingEntries.length > 0) {
        // Modo edición: pre-cargar datos
        setDate(editingDate);
        
        const entries = {};
        const descs = {};
        let minStart = null;
        let maxEnd = null;
        
        existingEntries.forEach(entry => {
          const hours = calculateHours(entry.start_time, entry.end_time);
          const hoursInt = Math.floor(hours);
          const minutesInt = Math.round((hours % 1) * 60);
          
          entries[entry.organizational_unit_id] = {
            hours: String(hoursInt),
            minutes: String(minutesInt),
            total: hours
          };
          
          if (entry.description) {
            descs[entry.organizational_unit_id] = entry.description;
          }
          
          // Calcular rango horario desde los registros
          const startTime = format(new Date(entry.start_time), 'HH:mm');
          const endTime = format(new Date(entry.end_time), 'HH:mm');
          
          if (!minStart || startTime < minStart) minStart = startTime;
          if (!maxEnd || endTime > maxEnd) maxEnd = endTime;
        });
        
        setTimeEntries(entries);
        setDescriptions(descs);
        
        if (minStart) setWorkdayStart(minStart);
        if (maxEnd) setWorkdayEnd(maxEnd);
      } else {
        // Modo creación: resetear
        setDate(format(new Date(), 'yyyy-MM-dd'));
        setTimeEntries({});
        setDescriptions({});
      }
    }
  }, [isOpen, mode, editingDate, existingEntries]);

  // Organizar unidades por jerarquía
  const hierarchy = useMemo(() => {
    const areas = units.filter(u => u.type === 'area');
    
    return areas.map(area => {
      const processes = units.filter(u => u.type === 'proceso' && u.parent_id === area.id);
      
      return {
        ...area,
        children: processes.map(process => {
          const subprocesses = units.filter(u => u.type === 'subproceso' && u.parent_id === process.id);
          
          if (subprocesses.length > 0) {
            return {
              ...process,
              children: subprocesses.map(subprocess => {
                const tasks = units.filter(u => u.type === 'tarea' && u.parent_id === subprocess.id);
                
                if (tasks.length > 0) {
                  return {
                    ...subprocess,
                    children: tasks
                  };
                }
                return subprocess; // Subproceso sin tareas es seleccionable
              })
            };
          }
          return process; // Proceso sin subprocesos es seleccionable
        })
      };
    });
  }, [units]);

  // Obtener todas las unidades seleccionables (hojas del árbol)
  const selectableUnits = useMemo(() => {
    const result = [];
    
    const traverse = (unit, path = []) => {
      const currentPath = [...path, unit.name];
      
      if (unit.children && unit.children.length > 0) {
        unit.children.forEach(child => traverse(child, currentPath));
      } else {
        // Es una hoja (seleccionable)
        result.push({
          ...unit,
          fullPath: currentPath.join(' > ')
        });
      }
    };
    
    hierarchy.forEach(area => traverse(area));
    return result;
  }, [hierarchy]);

  const handleTimeChange = (unitId, hours, minutes) => {
    const totalHours = parseFloat(hours || 0) + (parseFloat(minutes || 0) / 60);
    
    if (totalHours > 0) {
      setTimeEntries(prev => ({
        ...prev,
        [unitId]: {
          hours: hours || '0',
          minutes: minutes || '0',
          total: totalHours
        }
      }));
    } else {
      setTimeEntries(prev => {
        const newEntries = { ...prev };
        delete newEntries[unitId];
        return newEntries;
      });
    }
  };

  // Aplicar plantilla
  const handleApplyTemplate = (templateEntries) => {
    setTimeEntries(templateEntries);
    setShowTemplates(false);
  };

  const totalHours = useMemo(() => {
    return Object.values(timeEntries).reduce((sum, entry) => sum + entry.total, 0);
  }, [timeEntries]);
  
  // Calcular horas del rango horario
  const workdayHours = useMemo(() => {
    if (!workdayStart || !workdayEnd) return 0;
    const [startH, startM] = workdayStart.split(':').map(Number);
    const [endH, endM] = workdayEnd.split(':').map(Number);
    const start = startH + startM / 60;
    const end = endH + endM / 60;
    return end - start;
  }, [workdayStart, workdayEnd]);
  
  // Validar que coincidan
  const isValid = useMemo(() => {
    const diff = Math.abs(workdayHours - totalHours);
    return diff < 0.08; // Tolerancia de ~5 minutos
  }, [workdayHours, totalHours]);

  const handleSave = async () => {
    // Validar que coincidan las horas
    if (!isValid && Object.keys(timeEntries).length > 0) {
      // eslint-disable-next-line no-alert
      window.alert(`Las horas por tarea (${totalHours.toFixed(2)}h) no coinciden con el rango horario (${workdayHours.toFixed(2)}h)`);
      return;
    }
    
    // Distribuir las horas proporcionalmente dentro del rango horario
    let currentTime = workdayStart;
    
    // Filtrar solo las tareas que tienen horas > 0
    const entries = Object.entries(timeEntries)
      .filter(([, time]) => time.total > 0)
      .map(([unitId, time]) => {
      // Parsear hora actual
      const [currentH, currentM] = currentTime.split(':').map(Number);
      const currentMinutes = currentH * 60 + currentM;
      
      // Calcular hora de fin
      const durationMinutes = time.total * 60;
      const endMinutes = currentMinutes + durationMinutes;
      const endH = Math.floor(endMinutes / 60);
      const endM = Math.round(endMinutes % 60);
      
      // Crear timestamps con zona horaria usando helper
      const startDateTime = createTimestampWithTimezone(date, currentTime);
      const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
      const endDateTime = createTimestampWithTimezone(date, endTime);
      
      // Actualizar currentTime para la siguiente tarea
      currentTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

      const entry = {
        organizational_unit_id: unitId,
        start_time: startDateTime,
        end_time: endDateTime,
        description: descriptions[unitId] || null
      };
      
      // Si es admin y seleccionó un usuario específico, incluir user_id
      if (isAdmin && selectedUserId && selectedUserId !== currentUser?.id) {
        entry.user_id = selectedUserId;
      }
      
      return entry;
    });

    console.log('📤 Enviando entries:', entries);
    console.log('📅 Fecha seleccionada:', date);
    console.log('⏰ Rango horario:', workdayStart, '-', workdayEnd);
    console.log('👤 Usuario seleccionado:', selectedUserId);
    console.log('🔍 Primer entry completo:', JSON.stringify(entries[0], null, 2));
    await onSave(entries);
    handleClose();
  };

  const handleClose = () => {
    setTimeEntries({});
    setDescriptions({});
    setDate(format(new Date(), 'yyyy-MM-dd')); // OK: fecha actual
    onClose();
  };

  const toggleArea = (areaName) => {
    const newExpanded = new Set(expandedAreas);
    if (newExpanded.has(areaName)) {
      newExpanded.delete(areaName);
    } else {
      newExpanded.add(areaName);
    }
    setExpandedAreas(newExpanded);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'edit' ? `✏️ Editar Horas del ${format(new Date(date), "d 'de' MMMM", { locale: es })}` : "📋 Carga de Horas por Tarea"}
      size="3xl"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            loading={loading}
            disabled={Object.keys(timeEntries).length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar {Object.keys(timeEntries).length} {Object.keys(timeEntries).length === 1 ? 'Registro' : 'Registros'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Selector de fecha y usuario */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          {/* Aviso si la fecha ya tiene registros */}
          {mode === 'create' && allTimeEntries.some(e => e.start_time?.startsWith(date)) && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <span className="text-yellow-600 text-lg">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  Ya tienes registros cargados para esta fecha
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Si querés modificarlos, usa el botón ✏️ Editar en la lista de registros.
                </p>
              </div>
            </div>
          )}
          
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
            {isAdmin && availableUsers.length > 0 && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <select
                  value={selectedUserId || ''}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Seleccionar usuario...</option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.username})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Plantillas
              </button>
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

          {/* Gestor de Plantillas */}
          {showTemplates && (
            <div className="border-t pt-4 mt-4">
              <TemplateManager
                timeEntries={timeEntries}
                onApplyTemplate={handleApplyTemplate}
                units={units}
              />
            </div>
          )}
          
          {/* Rango Horario General */}
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-gray-700" />
              <label className="text-sm font-medium text-gray-900">
                Rango Horario del Día *
              </label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Inicio</label>
                <input
                  type="time"
                  value={workdayStart}
                  onChange={(e) => setWorkdayStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-base font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Fin</label>
                <input
                  type="time"
                  value={workdayEnd}
                  onChange={(e) => setWorkdayEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-base font-semibold"
                />
              </div>
              <div className={`p-3 rounded-lg border ${isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className="text-xs text-gray-600 mb-1">Total</p>
                <p className={`text-lg font-bold ${isValid ? 'text-green-800' : 'text-red-800'}`}>
                  {workdayHours.toFixed(2)}h
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 La suma de horas por tarea debe coincidir con este total
            </p>
          </div>
        </div>

        {/* Resumen de validación */}
        {Object.keys(timeEntries).length > 0 && (
          <div className={`p-4 rounded-lg border ${isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {isValid ? '✓ Horas coinciden' : '✗ Horas no coinciden'}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Rango: {workdayHours.toFixed(2)}h | Tareas: {totalHours.toFixed(2)}h
                  {!isValid && ` | Diferencia: ${Math.abs(workdayHours - totalHours).toFixed(2)}h`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lista de tareas agrupadas por área */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Tareas Disponibles</h3>
            <p className="text-sm text-gray-500 mt-1">
              Ingresa las horas y minutos trabajados en cada tarea
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {hierarchy.map(area => {
              const areaUnits = selectableUnits.filter(u => u.fullPath.startsWith(area.name));
              const isExpanded = expandedAreas.has(area.name);
              const colors = getAreaColor(area.name);

              return (
                <div key={area.id} className={`border-b border-gray-100 last:border-b-0 ${colors.border}`}>
                  <button
                    onClick={() => toggleArea(area.name)}
                    className={`w-full flex items-center justify-between p-4 transition-colors ${colors.bg} hover:opacity-80`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${colors.text}`}>{area.name}</span>
                      <span className={`text-xs ${colors.text} ${colors.badge} px-2 py-1 rounded font-medium`}>
                        {areaUnits.length} {areaUnits.length === 1 ? 'tarea' : 'tareas'}
                      </span>
                    </div>
                    <span className={colors.text}>{isExpanded ? '▼' : '▶'}</span>
                  </button>

                  {isExpanded && (
                    <div className={colors.bg}>
                      {areaUnits.map(unit => {
                        const entry = timeEntries[unit.id];
                        const hasTime = !!entry;

                        return (
                          <div
                            key={unit.id}
                            className={`
                              p-4 border-t border-gray-200
                              ${hasTime ? 'bg-green-50' : 'hover:bg-white'}
                              transition-colors
                            `}
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {unit.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {unit.fullPath}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="w-20">
                                  <input
                                    type="number"
                                    min="0"
                                    max="24"
                                    placeholder="Hs"
                                    value={entry?.hours || ''}
                                    onChange={(e) => handleTimeChange(unit.id, e.target.value, entry?.minutes || '0')}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                  />
                                </div>
                                <span className="text-gray-400">:</span>
                                <div className="w-20">
                                  <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    step="15"
                                    placeholder="Min"
                                    value={entry?.minutes || ''}
                                    onChange={(e) => handleTimeChange(unit.id, entry?.hours || '0', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                  />
                                </div>
                                {hasTime && (
                                  <>
                                    <span className="text-sm font-medium text-green-600 w-16 text-right">
                                      {entry.total.toFixed(2)}h
                                    </span>
                                    <button
                                      onClick={() => handleTimeChange(unit.id, '0', '0')}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {/* Campo de descripción (solo si tiene horas) */}
                            {hasTime && (
                              <div className="mt-2">
                                <textarea
                                  value={descriptions[unit.id] || ''}
                                  onChange={(e) => setDescriptions(prev => ({
                                    ...prev,
                                    [unit.id]: e.target.value
                                  }))}
                                  placeholder="Descripción (opcional)"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                  rows={2}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Total */}
        {totalHours > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-green-900">
                  Total de Horas
                </h4>
                <p className="text-xs text-green-700 mt-1">
                  {Object.keys(timeEntries).length} {Object.keys(timeEntries).length === 1 ? 'tarea' : 'tareas'} con tiempo asignado
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">
                  {totalHours.toFixed(2)}
                </p>
                <p className="text-sm text-green-700">horas</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BulkTimeEntry;
