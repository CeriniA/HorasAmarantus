import { useState, useEffect } from 'react';
import Select from './Select';

/**
 * Componente de selección jerárquica para Área → Proceso → Subproceso → Tarea
 */
export const HierarchicalSelect = ({ 
  units = [], 
  value, 
  onChange, 
  required = false,
  disabled = false 
}) => {
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedProcess, setSelectedProcess] = useState('');
  const [selectedSubprocess, setSelectedSubprocess] = useState('');
  const [selectedTask, setSelectedTask] = useState('');

  // Filtrar por tipo (usando nombres en español como el CRUD)
  const areas = units.filter(u => u.type === 'area');
  const processes = units.filter(u => u.type === 'proceso' && u.parent_id === selectedArea);
  const subprocesses = units.filter(u => u.type === 'subproceso' && u.parent_id === selectedProcess);
  const tasks = units.filter(u => u.type === 'tarea' && u.parent_id === selectedSubprocess);

  // Debug
  if (import.meta.env.DEV) {
    console.log('🔍 HierarchicalSelect Debug:', {
      totalUnits: units.length,
      selectedArea,
      selectedProcess,
      selectedSubprocess,
      areas: areas.length,
      processes: processes.length,
      subprocesses: subprocesses.length,
      tasks: tasks.length,
      allUnits: units.map(u => ({ id: u.id, name: u.name, type: u.type, parent_id: u.parent_id }))
    });
  }

  // Inicializar valores si se pasa un value
  useEffect(() => {
    if (value && units.length > 0) {
      const selectedUnit = units.find(u => u.id === value);
      if (selectedUnit) {
        // Reconstruir la jerarquía (usando tipos en español)
        if (selectedUnit.type === 'area') {
          setSelectedArea(selectedUnit.id);
          setSelectedProcess('');
          setSelectedSubprocess('');
          setSelectedTask('');
        } else if (selectedUnit.type === 'proceso') {
          setSelectedProcess(selectedUnit.id);
          setSelectedArea(selectedUnit.parent_id || '');
          setSelectedSubprocess('');
          setSelectedTask('');
        } else if (selectedUnit.type === 'subproceso') {
          setSelectedSubprocess(selectedUnit.id);
          const process = units.find(u => u.id === selectedUnit.parent_id);
          if (process) {
            setSelectedProcess(process.id);
            setSelectedArea(process.parent_id || '');
          }
          setSelectedTask('');
        } else if (selectedUnit.type === 'tarea') {
          setSelectedTask(selectedUnit.id);
          const subprocess = units.find(u => u.id === selectedUnit.parent_id);
          if (subprocess) {
            setSelectedSubprocess(subprocess.id);
            const process = units.find(u => u.id === subprocess.parent_id);
            if (process) {
              setSelectedProcess(process.id);
              setSelectedArea(process.parent_id || '');
            }
          }
        }
      }
    }
  }, [value, units]);

  const handleAreaChange = (areaId) => {
    setSelectedArea(areaId);
    setSelectedProcess('');
    setSelectedSubprocess('');
    setSelectedTask('');
    
    // Si solo hay área, enviar el área como valor
    onChange(areaId);
  };

  const handleProcessChange = (processId) => {
    setSelectedProcess(processId);
    setSelectedSubprocess('');
    setSelectedTask('');
    
    // Enviar el proceso como valor
    onChange(processId);
  };

  const handleSubprocessChange = (subprocessId) => {
    setSelectedSubprocess(subprocessId);
    setSelectedTask('');
    
    // Enviar el subproceso como valor
    onChange(subprocessId);
  };

  const handleTaskChange = (taskId) => {
    setSelectedTask(taskId);
    
    // Enviar la tarea como valor
    onChange(taskId);
  };

  // Opciones para los selects (sin placeholder, Select lo agrega automáticamente)
  const areaOptions = areas.map(a => ({ value: a.id, label: a.name }));
  const processOptions = processes.map(p => ({ value: p.id, label: p.name }));
  const subprocessOptions = subprocesses.map(s => ({ value: s.id, label: s.name }));
  const taskOptions = tasks.map(t => ({ value: t.id, label: t.name }));

  return (
    <div className="space-y-3">
      {/* Área */}
      <Select
        label="Área"
        value={selectedArea}
        onChange={(e) => handleAreaChange(e.target.value)}
        options={areaOptions}
        placeholder="Selecciona un área..."
        required={required}
        disabled={disabled}
      />

      {/* Proceso (solo si hay área seleccionada) */}
      {selectedArea && (
        <Select
          label="Proceso"
          value={selectedProcess}
          onChange={(e) => handleProcessChange(e.target.value)}
          options={processOptions}
          placeholder="Selecciona un proceso..."
          disabled={disabled || processes.length === 0}
          helperText={processes.length === 0 ? 'No hay procesos en esta área' : ''}
        />
      )}

      {/* Subproceso (solo si hay proceso seleccionado) */}
      {selectedProcess && (
        <Select
          label="Subproceso"
          value={selectedSubprocess}
          onChange={(e) => handleSubprocessChange(e.target.value)}
          options={subprocessOptions}
          placeholder="Selecciona un subproceso..."
          disabled={disabled || subprocesses.length === 0}
          helperText={subprocesses.length === 0 ? 'No hay subprocesos en este proceso' : ''}
        />
      )}

      {/* Tarea (solo si hay subproceso seleccionado) */}
      {selectedSubprocess && (
        <Select
          label="Tarea"
          value={selectedTask}
          onChange={(e) => handleTaskChange(e.target.value)}
          options={taskOptions}
          placeholder="Selecciona una tarea..."
          disabled={disabled || tasks.length === 0}
          helperText={tasks.length === 0 ? 'No hay tareas en este subproceso' : ''}
        />
      )}

      {/* Indicador de selección actual */}
      {value && (
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <strong>Seleccionado:</strong>{' '}
          {units.find(u => u.id === value)?.name || 'N/A'}
          {' '}
          <span className="text-gray-400">
            ({units.find(u => u.id === value)?.type || 'N/A'})
          </span>
        </div>
      )}
    </div>
  );
};

export default HierarchicalSelect;
