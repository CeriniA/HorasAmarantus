/* eslint-disable no-restricted-globals */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Trash2, Save, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useOrganizationalUnits } from '../hooks/useOrganizationalUnits';
import { timeEntriesService } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export const BulkTimeEntry = () => {
  const navigate = useNavigate();
  const { units, loading: unitsLoading } = useOrganizationalUnits();
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState([
    {
      id: window.crypto.randomUUID(),
      area_id: '',
      proceso_id: '',
      start_time: '',
      end_time: '',
      description: ''
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Obtener áreas únicas (type = 'area')
  const areas = units.filter(unit => unit.type === 'area');

  // Obtener procesos de un área específica
  const getProcesosForArea = (areaId) => {
    if (!areaId) return [];
    return units.filter(unit => unit.parent_id === areaId);
  };

  // Agregar nueva entrada
  const handleAddEntry = () => {
    const lastEntry = entries[entries.length - 1];
    setEntries([
      ...entries,
      {
        id: window.crypto.randomUUID(),
        area_id: lastEntry?.area_id || '',
        proceso_id: '',
        start_time: lastEntry?.end_time || '',
        end_time: '',
        description: ''
      }
    ]);
  };

  // Eliminar entrada
  const handleRemoveEntry = (id) => {
    if (entries.length === 1) {
      setMessage({ type: 'error', text: 'Debe haber al menos una entrada' });
      return;
    }
    setEntries(entries.filter(entry => entry.id !== id));
  };

  // Actualizar entrada
  const handleUpdateEntry = (id, field, value) => {
    setEntries(entries.map(entry => {
      if (entry.id === id) {
        const updated = { ...entry, [field]: value };
        
        // Si cambia el área, resetear el proceso
        if (field === 'area_id') {
          updated.proceso_id = '';
        }
        
        return updated;
      }
      return entry;
    }));
  };

  // Calcular horas de una entrada
  const calculateHours = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(`${date}T${start}`);
    const endDate = new Date(`${date}T${end}`);
    const hours = (endDate - startDate) / (1000 * 60 * 60);
    return hours > 0 ? hours : 0;
  };

  // Calcular total de horas
  const getTotalHours = () => {
    return entries.reduce((total, entry) => {
      return total + calculateHours(entry.start_time, entry.end_time);
    }, 0);
  };

  // Validar solapamientos
  const detectOverlaps = () => {
    const overlaps = [];
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const entry1 = entries[i];
        const entry2 = entries[j];
        
        if (!entry1.start_time || !entry1.end_time || !entry2.start_time || !entry2.end_time) {
          continue;
        }
        
        const start1 = new Date(`${date}T${entry1.start_time}`);
        const end1 = new Date(`${date}T${entry1.end_time}`);
        const start2 = new Date(`${date}T${entry2.start_time}`);
        const end2 = new Date(`${date}T${entry2.end_time}`);
        
        if (start1 < end2 && end1 > start2) {
          overlaps.push({ entry1: i + 1, entry2: j + 1 });
        }
      }
    }
    return overlaps;
  };

  // Detectar gaps (huecos)
  const detectGaps = () => {
    const gaps = [];
    const sortedEntries = [...entries]
      .filter(e => e.start_time && e.end_time)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
    
    for (let i = 0; i < sortedEntries.length - 1; i++) {
      const currentEnd = sortedEntries[i].end_time;
      const nextStart = sortedEntries[i + 1].start_time;
      
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

    // Validaciones
    const invalidEntries = entries.filter(e => !e.proceso_id || !e.start_time || !e.end_time);
    if (invalidEntries.length > 0) {
      setMessage({ type: 'error', text: 'Todas las entradas deben tener proceso, hora de inicio y hora de fin' });
      return;
    }

    // Validar que no haya solapamientos
    const overlaps = detectOverlaps();
    if (overlaps.length > 0) {
      setMessage({ 
        type: 'error', 
        text: `Hay solapamientos de horarios entre las entradas ${overlaps[0].entry1} y ${overlaps[0].entry2}` 
      });
      return;
    }

    try {
      setLoading(true);

      // Preparar datos para enviar
      const entriesToSend = entries.map(entry => ({
        organizational_unit_id: entry.proceso_id,
        start_time: `${date}T${entry.start_time}:00`,
        end_time: `${date}T${entry.end_time}:00`,
        description: entry.description || null
      }));

      const response = await timeEntriesService.createBulk(entriesToSend);

      setMessage({ 
        type: 'success', 
        text: `¡Jornada guardada! ${response.created} registros creados (${response.total_hours} horas)` 
      });

      // Redirigir después de 2 segundos
      window.setTimeout(() => {
        navigate('/time-tracking');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cargar Jornada Completa</h1>
        <p className="mt-1 text-sm text-gray-500">
          Registra todas las horas de tu jornada de trabajo en un solo paso
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

      {/* Fecha */}
      <Card title="Fecha de la Jornada" icon={Calendar}>
        <div className="max-w-xs">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Entradas */}
      <Card title="Procesos de la Jornada" icon={Clock}>
        <div className="space-y-4">
          {entries.map((entry, index) => {
            const procesos = getProcesosForArea(entry.area_id);
            const hours = calculateHours(entry.start_time, entry.end_time);
            const selectedArea = areas.find(a => a.id === entry.area_id);
            const selectedProceso = units.find(u => u.id === entry.proceso_id);

            return (
              <div key={entry.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Entrada {index + 1}</span>
                  {entries.length > 1 && (
                    <button
                      onClick={() => handleRemoveEntry(entry.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Área */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Área *
                    </label>
                    <select
                      value={entry.area_id}
                      onChange={(e) => handleUpdateEntry(entry.id, 'area_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={unitsLoading}
                    >
                      <option value="">Seleccionar área...</option>
                      {areas.map(area => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Proceso */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proceso *
                    </label>
                    <select
                      value={entry.proceso_id}
                      onChange={(e) => handleUpdateEntry(entry.id, 'proceso_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!entry.area_id || unitsLoading}
                    >
                      <option value="">Seleccionar proceso...</option>
                      {procesos.map(proceso => (
                        <option key={proceso.id} value={proceso.id}>{proceso.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Hora Inicio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora Inicio *
                    </label>
                    <input
                      type="time"
                      value={entry.start_time}
                      onChange={(e) => handleUpdateEntry(entry.id, 'start_time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Hora Fin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora Fin *
                    </label>
                    <input
                      type="time"
                      value={entry.end_time}
                      onChange={(e) => handleUpdateEntry(entry.id, 'end_time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Descripción */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción (opcional)
                    </label>
                    <input
                      type="text"
                      value={entry.description}
                      onChange={(e) => handleUpdateEntry(entry.id, 'description', e.target.value)}
                      placeholder="Detalles del trabajo realizado..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Info de horas */}
                {hours > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    <Clock className="inline h-4 w-4 mr-1" />
                    {selectedArea?.name} → {selectedProceso?.name}: <span className="font-medium">{hours.toFixed(2)} horas</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Botón Agregar */}
          <button
            onClick={handleAddEntry}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Agregar Proceso
          </button>
        </div>
      </Card>

      {/* Resumen y Advertencias */}
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
                  ⚠️ Hay solapamientos de horarios entre entradas
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

      {/* Botones de acción */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="secondary"
          onClick={() => navigate('/time-tracking')}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          loading={loading}
          disabled={entries.length === 0 || overlaps.length > 0}
        >
          <Save className="h-4 w-4 mr-2" />
          Guardar Jornada ({entries.length} {entries.length === 1 ? 'registro' : 'registros'})
        </Button>
      </div>
    </div>
  );
};

export default BulkTimeEntry;
