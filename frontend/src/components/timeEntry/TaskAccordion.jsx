import { useState } from 'react';
import { ChevronDown, ChevronRight, Building2, FolderTree, GitBranch, CheckSquare } from 'lucide-react';
import { ORG_UNIT_TYPES } from '../../constants';

/**
 * Componente de acordeón para mostrar la jerarquía de tareas
 * Área > Proceso > Subproceso > Tareas
 */
export const TaskAccordion = ({ units = [], onTaskSelect, selectedTaskId = null }) => {
  const [expandedAreas, setExpandedAreas] = useState(new Set());
  const [expandedProcesses, setExpandedProcesses] = useState(new Set());
  const [expandedSubprocesses, setExpandedSubprocesses] = useState(new Set());

  // Filtrar unidades por tipo
  const areas = units.filter(u => u.type === ORG_UNIT_TYPES.AREA);

  const getProcesses = (areaId) => 
    units.filter(u => u.type === ORG_UNIT_TYPES.PROCESO && u.parent_id === areaId);

  const getSubprocesses = (processId) => 
    units.filter(u => u.type === ORG_UNIT_TYPES.SUBPROCESO && u.parent_id === processId);

  const getTasks = (subprocessId) => 
    units.filter(u => u.type === ORG_UNIT_TYPES.TAREA && u.parent_id === subprocessId);

  // Verificar si un proceso tiene hijos
  const hasChildren = (unitId) => {
    return units.some(u => u.parent_id === unitId);
  };

  const toggleArea = (areaId) => {
    const newExpanded = new Set(expandedAreas);
    if (newExpanded.has(areaId)) {
      newExpanded.delete(areaId);
    } else {
      newExpanded.add(areaId);
    }
    setExpandedAreas(newExpanded);
  };

  const toggleProcess = (processId) => {
    const newExpanded = new Set(expandedProcesses);
    if (newExpanded.has(processId)) {
      newExpanded.delete(processId);
    } else {
      newExpanded.add(processId);
    }
    setExpandedProcesses(newExpanded);
  };

  const toggleSubprocess = (subprocessId) => {
    const newExpanded = new Set(expandedSubprocesses);
    if (newExpanded.has(subprocessId)) {
      newExpanded.delete(subprocessId);
    } else {
      newExpanded.add(subprocessId);
    }
    setExpandedSubprocesses(newExpanded);
  };

  return (
    <div className="space-y-2">
      {areas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No hay áreas disponibles</p>
          <p className="text-sm mt-2">Contacta al administrador para configurar la estructura organizacional</p>
        </div>
      ) : (
        areas.map((area) => {
          const isAreaExpanded = expandedAreas.has(area.id);
          const processes = getProcesses(area.id);

          return (
            <div key={area.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* ÁREA */}
              <button
                onClick={() => toggleArea(area.id)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-blue-50 hover:from-primary-100 hover:to-blue-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-primary-600" />
                  <span className="font-semibold text-gray-900">{area.name}</span>
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                    {processes.length} {processes.length === 1 ? 'proceso' : 'procesos'}
                  </span>
                </div>
                {isAreaExpanded ? (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                )}
              </button>

              {/* PROCESOS */}
              {isAreaExpanded && (
                <div className="bg-gray-50 p-2 space-y-2">
                  {processes.length === 0 ? (
                    <p className="text-sm text-gray-500 p-4 text-center">
                      No hay procesos en esta área
                    </p>
                  ) : (
                    processes.map((process) => {
                      const isProcessExpanded = expandedProcesses.has(process.id);
                      const subprocesses = getSubprocesses(process.id);
                      const processHasChildren = hasChildren(process.id);
                      const isProcessSelected = selectedTaskId === process.id;

                      return (
                        <div key={process.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                          <div className="flex items-center">
                            {/* Botón de expandir/colapsar (solo si tiene hijos) */}
                            {processHasChildren && (
                              <button
                                onClick={() => toggleProcess(process.id)}
                                className="p-3 hover:bg-gray-50 transition-colors"
                              >
                                {isProcessExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-gray-600" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-gray-600" />
                                )}
                              </button>
                            )}
                            
                            {/* Botón de selección */}
                            <button
                              onClick={() => onTaskSelect(process)}
                              className={`
                                flex-1 flex items-center justify-between p-3 transition-all
                                ${isProcessSelected
                                  ? 'bg-green-50 border-l-4 border-green-500'
                                  : 'hover:bg-gray-50 border-l-4 border-transparent'
                                }
                              `}
                            >
                              <div className="flex items-center gap-3">
                                <FolderTree className={`h-4 w-4 ${isProcessSelected ? 'text-green-600' : 'text-blue-600'}`} />
                                <span className={`font-medium ${isProcessSelected ? 'text-green-900' : 'text-gray-800'}`}>
                                  {process.name}
                                </span>
                                {processHasChildren && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    {subprocesses.length} {subprocesses.length === 1 ? 'subproceso' : 'subprocesos'}
                                  </span>
                                )}
                              </div>
                              {isProcessSelected && (
                                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                                  Seleccionado
                                </span>
                              )}
                            </button>
                          </div>

                          {/* SUBPROCESOS */}
                          {isProcessExpanded && (
                            <div className="bg-gray-50 p-2 space-y-2">
                              {subprocesses.length === 0 ? (
                                <p className="text-sm text-gray-500 p-3 text-center">
                                  No hay subprocesos en este proceso
                                </p>
                              ) : (
                                subprocesses.map((subprocess) => {
                                  const isSubprocessExpanded = expandedSubprocesses.has(subprocess.id);
                                  const tasks = getTasks(subprocess.id);
                                  const subprocessHasChildren = hasChildren(subprocess.id);
                                  const isSubprocessSelected = selectedTaskId === subprocess.id;

                                  return (
                                    <div key={subprocess.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                      <div className="flex items-center">
                                        {/* Botón de expandir/colapsar (solo si tiene hijos) */}
                                        {subprocessHasChildren && (
                                          <button
                                            onClick={() => toggleSubprocess(subprocess.id)}
                                            className="p-3 hover:bg-gray-50 transition-colors"
                                          >
                                            {isSubprocessExpanded ? (
                                              <ChevronDown className="h-4 w-4 text-gray-600" />
                                            ) : (
                                              <ChevronRight className="h-4 w-4 text-gray-600" />
                                            )}
                                          </button>
                                        )}
                                        
                                        {/* Botón de selección */}
                                        <button
                                          onClick={() => onTaskSelect(subprocess)}
                                          className={`
                                            flex-1 flex items-center justify-between p-3 transition-all
                                            ${isSubprocessSelected
                                              ? 'bg-green-50 border-l-4 border-green-500'
                                              : 'hover:bg-gray-50 border-l-4 border-transparent'
                                            }
                                          `}
                                        >
                                          <div className="flex items-center gap-3">
                                            <GitBranch className={`h-4 w-4 ${isSubprocessSelected ? 'text-green-600' : 'text-purple-600'}`} />
                                            <span className={`font-medium ${isSubprocessSelected ? 'text-green-900' : 'text-gray-700'}`}>
                                              {subprocess.name}
                                            </span>
                                            {subprocessHasChildren && (
                                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {tasks.length} {tasks.length === 1 ? 'tarea' : 'tareas'}
                                              </span>
                                            )}
                                          </div>
                                          {isSubprocessSelected && (
                                            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                                              Seleccionado
                                            </span>
                                          )}
                                        </button>
                                      </div>

                                      {/* TAREAS */}
                                      {isSubprocessExpanded && (
                                        <div className="bg-white border-t border-gray-200">
                                          {tasks.length === 0 ? (
                                            <p className="text-sm text-gray-500 p-3 text-center">
                                              No hay tareas en este subproceso
                                            </p>
                                          ) : (
                                            <div className="divide-y divide-gray-100">
                                              {tasks.map((task) => {
                                                const isSelected = selectedTaskId === task.id;
                                                
                                                return (
                                                  <button
                                                    key={task.id}
                                                    onClick={() => onTaskSelect(task)}
                                                    className={`
                                                      w-full flex items-center justify-between p-3 transition-all
                                                      ${isSelected
                                                        ? 'bg-green-50 border-l-4 border-green-500'
                                                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                                                      }
                                                    `}
                                                  >
                                                    <div className="flex items-center gap-3">
                                                      <CheckSquare 
                                                        className={`h-4 w-4 ${isSelected ? 'text-green-600' : 'text-gray-400'}`} 
                                                      />
                                                      <span className={`text-sm ${isSelected ? 'font-semibold text-green-900' : 'text-gray-700'}`}>
                                                        {task.name}
                                                      </span>
                                                    </div>
                                                    {isSelected && (
                                                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                                                        Seleccionada
                                                      </span>
                                                    )}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default TaskAccordion;
