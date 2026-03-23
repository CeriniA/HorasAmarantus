/* eslint-disable no-restricted-globals */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Save, AlertCircle, CheckCircle, ChevronDown, ChevronRight, Plus, User } from 'lucide-react';
import { useOrganizationalUnits } from '../hooks/useOrganizationalUnits';
import { useUsers } from '../hooks/useUsers';
import { useAuthContext } from '../context/AuthContext';
import { timeEntriesService } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ORG_UNIT_TYPES } from '../constants';

export const BulkTimeEntry = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { units, loading: unitsLoading } = useOrganizationalUnits();
  const { users } = useUsers();
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedUserId, setSelectedUserId] = useState(null); // Para superadmin
  const [expandedAreas, setExpandedAreas] = useState([]); // Áreas desplegadas
  const [availableAreas, setAvailableAreas] = useState([]); // Áreas agregadas
  const [selectedProcesses, setSelectedProcesses] = useState({}); // { proceso_id: { checked, start, end } }
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Obtener áreas únicas (type = 'area')
  const allAreas = useMemo(() => units.filter(unit => unit.type === ORG_UNIT_TYPES.AREA), [units]);

  // Obtener procesos de un área (solo nivel 1, sin subprocesos)
  const getProcessesForArea = (areaId) => {
    if (!areaId) return [];
    return units.filter(unit => unit.parent_id === areaId);
  };

  // Obtener subprocesos de un proceso
  const getSubprocesses = (processId) => {
    return units.filter(unit => unit.parent_id === processId);
  };

  // Áreas no agregadas aún
  const remainingAreas = useMemo(() => 
    allAreas.filter(area => !availableAreas.includes(area.id)),
    [allAreas, availableAreas]
  );

  // Agregar área
  const handleAddArea = (areaId) => {
    if (!availableAreas.includes(areaId)) {
      setAvailableAreas([...availableAreas, areaId]);
      setExpandedAreas([...expandedAreas, areaId]);
    }
  };

  // Toggle área expandida/colapsada
  const toggleArea = (areaId) => {
    setExpandedAreas(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  };

  // Manejar checkbox de proceso
  const handleToggleProcess = (processId) => {
    setSelectedProcesses(prev => {
      const newState = { ...prev };
      
      if (newState[processId]?.checked) {
        // Descheckear: eliminar proceso y sus subprocesos
        delete newState[processId];
        const subprocesses = getSubprocesses(processId);
        subprocesses.forEach(sub => delete newState[sub.id]);
      } else {
        // Checkear: agregar proceso
        newState[processId] = {
          checked: true,
          start: '',
          end: ''
        };
      }
      
      return newState;
    });
  };

  // Actualizar horario de proceso
  const handleUpdateTime = (processId, field, value) => {
    setSelectedProcesses(prev => ({
      ...prev,
      [processId]: {
        ...prev[processId],
        [field]: value
      }
    }));
  };

  // Calcular horas de un proceso
  const calculateHours = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(`${date}T${start}`);
    const endDate = new Date(`${date}T${end}`);
    const hours = (endDate - startDate) / (1000 * 60 * 60);
    return hours > 0 ? hours : 0;
  };

  // Calcular total de horas
  const getTotalHours = () => {
    return Object.entries(selectedProcesses).reduce((total, [, data]) => {
      if (data.checked && data.start && data.end) {
        return total + calculateHours(data.start, data.end);
      }
      return total;
    }, 0);
  };

  // Validar solapamientos
  const detectOverlaps = () => {
    const entries = Object.entries(selectedProcesses)
      .filter(([, data]) => data.checked && data.start && data.end)
      .map(([id, data]) => ({ id, ...data }));

    const overlaps = [];
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const entry1 = entries[i];
        const entry2 = entries[j];
        
        const start1 = new Date(`${date}T${entry1.start}`);
        const end1 = new Date(`${date}T${entry1.end}`);
        const start2 = new Date(`${date}T${entry2.start}`);
        const end2 = new Date(`${date}T${entry2.end}`);
        
        if (start1 < end2 && end1 > start2) {
          const process1 = units.find(u => u.id === entry1.id);
          const process2 = units.find(u => u.id === entry2.id);
          overlaps.push({ 
            process1: process1?.name || 'Proceso', 
            process2: process2?.name || 'Proceso' 
          });
        }
      }
    }
    return overlaps;
  };

  // Detectar gaps (huecos)
  const detectGaps = () => {
    const entries = Object.entries(selectedProcesses)
      .filter(([, data]) => data.checked && data.start && data.end)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => a.start.localeCompare(b.start));
    
    const gaps = [];
    for (let i = 0; i < entries.length - 1; i++) {
      const currentEnd = entries[i].end;
      const nextStart = entries[i + 1].start;
      
      if (currentEnd < nextStart) {
        const gapMinutes = (new Date(`${date}T${nextStart}`) - new Date(`${date}T${currentEnd}`)) / (1000 * 60);
        if (gapMinutes > 0) {
          gaps.push({
            from: currentEnd,
            to: nextStart,
            minutes: gapMinutes
          });
        }
      }
    }
    return gaps;
  };

  // Guardar jornada
  const handleSave = async () => {
    setMessage({ type: '', text: '' });

    // Obtener procesos seleccionados
    const selectedEntries = Object.entries(selectedProcesses)
      .filter(([, data]) => data.checked && data.start && data.end);

    if (selectedEntries.length === 0) {
      setMessage({ type: 'error', text: 'Debe seleccionar al menos un proceso con horarios' });
      return;
    }

    // Validar que no haya solapamientos
    const overlaps = detectOverlaps();
    if (overlaps.length > 0) {
      setMessage({ 
        type: 'error', 
        text: `Hay solapamientos entre "${overlaps[0].process1}" y "${overlaps[0].process2}"` 
      });
      return;
    }

    try {
      setLoading(true);

      // Preparar datos para enviar
      const entriesToSend = selectedEntries.map(([processId, data]) => ({
        organizational_unit_id: processId,
        start_time: `${date}T${data.start}:00`,
        end_time: `${date}T${data.end}:00`,
        description: null
      }));

      const targetUserId = user.role === 'superadmin' && selectedUserId ? selectedUserId : undefined;
      const response = await timeEntriesService.createBulk(entriesToSend, targetUserId);

      setMessage({ 
        type: 'success', 
        text: `¡Jornada guardada! ${response.created} registros creados (${response.total_hours} horas)` 
      });

      // Redirigir después de 2 segundos
      window.setTimeout(() => {
        navigate('/time-entries');
      }, 2000);

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Error al guardar la jornada' 
      });
    } finally {
      setLoading(false);
    }
  };

  const totalHours = getTotalHours();
  const overlaps = detectOverlaps();
  const gaps = detectGaps();

  // Componente para renderizar proceso
  const ProcessRow = ({ process, level = 0 }) => {
    const subprocesses = getSubprocesses(process.id);
    const isChecked = selectedProcesses[process.id]?.checked || false;
    const processData = selectedProcesses[process.id] || { start: '', end: '' };
    const hours = calculateHours(processData.start, processData.end);

    return (
      <div key={process.id}>
        <div className={`flex items-center gap-3 py-2 ${level > 0 ? 'ml-8 border-l-2 border-gray-300 pl-4' : ''}`}>
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => handleToggleProcess(process.id)}
            className="h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />

          {/* Nombre del proceso */}
          <span className={`flex-1 ${level > 0 ? 'text-sm text-gray-700' : 'font-medium text-gray-900'}`}>
            {level > 0 && '→ '}{process.name}
          </span>

          {/* Hora inicio */}
          <input
            type="time"
            value={processData.start}
            onChange={(e) => handleUpdateTime(process.id, 'start', e.target.value)}
            disabled={!isChecked}
            className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
          />

          <span className="text-gray-500">-</span>

          {/* Hora fin */}
          <input
            type="time"
            value={processData.end}
            onChange={(e) => handleUpdateTime(process.id, 'end', e.target.value)}
            disabled={!isChecked}
            className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
          />

          {/* Horas calculadas */}
          {hours > 0 && (
            <span className="text-sm text-gray-600 w-20">({hours.toFixed(2)} hs)</span>
          )}
          {!hours && isChecked && (
            <span className="text-sm text-gray-400 w-20">(0 hs)</span>
          )}
        </div>

        {/* Subprocesos */}
        {isChecked && subprocesses.length > 0 && (
          <div className="ml-4">
            {subprocesses.map(subprocess => (
              <ProcessRow key={subprocess.id} process={subprocess} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cargar Jornada Completa</h1>
        <p className="mt-1 text-sm text-gray-500">
          Selecciona los procesos y asigna horarios para registrar tu jornada completa
        </p>
      </div>

      {/* Mensajes */}
      {message.text && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Fecha y Usuario */}
      <Card title="Configuración" icon={Calendar}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de la Jornada *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Usuario (solo superadmin) */}
          {user?.role === 'superadmin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="inline h-4 w-4 mr-1" />
                Usuario (opcional)
              </label>
              <select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Yo mismo ({user.name})</option>
                {users?.filter(u => u.id !== user.id).map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.username})</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Como superadmin puedes cargar horas para otros usuarios
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Áreas y Procesos */}
      <div className="space-y-4">
        {availableAreas.map(areaId => {
          const area = allAreas.find(a => a.id === areaId);
          if (!area) return null;

          const processes = getProcessesForArea(areaId);
          const isExpanded = expandedAreas.includes(areaId);

          return (
            <Card key={areaId}>
              <button
                onClick={() => toggleArea(areaId)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  <span className="text-lg font-semibold text-gray-900">{area.name}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {processes.length} {processes.length === 1 ? 'proceso' : 'procesos'}
                </span>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-1">
                  {processes.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No hay procesos en esta área</p>
                  ) : (
                    processes.map(process => (
                      <ProcessRow key={process.id} process={process} level={0} />
                    ))
                  )}
                </div>
              )}
            </Card>
          );
        })}

        {/* Agregar Área */}
        {remainingAreas.length > 0 && (
          <Card>
            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Plus className="inline h-4 w-4 mr-1" />
                Agregar Otra Área
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddArea(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={unitsLoading}
              >
                <option value="">Seleccionar área...</option>
                {remainingAreas.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
            </div>
          </Card>
        )}

        {availableAreas.length === 0 && (
          <Card>
            <div className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No has agregado ningún área aún</p>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddArea(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full max-w-xs mx-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={unitsLoading}
              >
                <option value="">Seleccionar área para comenzar...</option>
                {allAreas.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
            </div>
          </Card>
        )}
      </div>

      {/* Resumen */}
      {Object.keys(selectedProcesses).length > 0 && (
        <Card title="Resumen de la Jornada" icon={CheckCircle}>
          <div className="space-y-3">
            {/* Total de horas */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-900">Total de horas:</span>
              <span className="text-lg font-bold text-blue-900">{totalHours.toFixed(2)} hs</span>
            </div>

            {/* Advertencias */}
            {(overlaps.length > 0 || gaps.length > 0 || totalHours < 8 || totalHours > 8) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <AlertCircle className="h-4 w-4" />
                  Advertencias:
                </div>

                {overlaps.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                    ⚠️ Hay solapamientos de horarios
                  </div>
                )}

                {gaps.length > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    ⚠️ Hay {gaps.length} hueco(s) entre procesos
                    {gaps.map((gap, i) => (
                      <div key={i} className="mt-1">
                        • De {gap.from} a {gap.to} ({gap.minutes} minutos)
                      </div>
                    ))}
                  </div>
                )}

                {totalHours < 8 && totalHours > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    ⚠️ El total es menor a 8 horas ({totalHours.toFixed(2)} hs)
                  </div>
                )}

                {totalHours > 8 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    ⚠️ El total es mayor a 8 horas ({totalHours.toFixed(2)} hs)
                  </div>
                )}
              </div>
            )}

            {/* Todo OK */}
            {overlaps.length === 0 && gaps.length === 0 && totalHours === 8 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                ✅ Jornada completa de 8 horas sin solapamientos ni huecos
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Botones de acción */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="secondary"
          onClick={() => navigate('/time-entries')}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          loading={loading}
          disabled={Object.keys(selectedProcesses).length === 0 || overlaps.length > 0}
        >
          <Save className="h-4 w-4 mr-2" />
          Guardar Jornada
        </Button>
      </div>
    </div>
  );
};

export default BulkTimeEntry;
