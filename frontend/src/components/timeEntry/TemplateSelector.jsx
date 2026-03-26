/**
 * Selector de Plantillas
 * Permite guardar y cargar configuraciones frecuentes de tareas
 */

import { useState, useEffect } from 'react';
import { Save, Trash2, Star, StarOff } from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';

export const TemplateSelector = ({ units, onSelect, currentTasks }) => {
  const [templates, setTemplates] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  // Cargar plantillas desde localStorage (temporal, luego será API)
  const loadTemplates = () => {
    try {
      const saved = localStorage.getItem('timeEntryTemplates');
      if (saved) {
        setTemplates(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  // Guardar plantillas en localStorage
  const saveTemplates = (newTemplates) => {
    try {
      localStorage.setItem('timeEntryTemplates', JSON.stringify(newTemplates));
      setTemplates(newTemplates);
    } catch (error) {
      console.error('Error saving templates:', error);
    }
  };

  // Guardar configuración actual como plantilla
  const saveAsTemplate = () => {
    if (!templateName.trim()) {
      // Mostrar error en el UI en lugar de alert
      return;
    }

    if (currentTasks.length === 0) {
      // Mostrar error en el UI en lugar de alert
      return;
    }

    setSaving(true);

    const newTemplate = {
      id: Date.now().toString(),
      name: templateName.trim(),
      tasks: currentTasks.map(task => ({
        unit_id: task.unit_id,
        unit_name: units.find(u => u.id === task.unit_id)?.name || '',
        hours: task.hours,
        minutes: task.minutes
      })),
      totalHours: currentTasks.reduce((sum, t) => sum + t.hours + (t.minutes / 60), 0),
      createdAt: new Date().toISOString(),
      favorite: false
    };

    const updatedTemplates = [...templates, newTemplate];
    saveTemplates(updatedTemplates);

    setTemplateName('');
    setShowSaveDialog(false);
    setSaving(false);
  };

  // Cargar plantilla
  const loadTemplate = (template) => {
    if (onSelect) {
      onSelect(template.tasks);
    }
  };

  // Eliminar plantilla
  const deleteTemplate = (id) => {
    // eslint-disable-next-line no-restricted-globals
    if (window.confirm('¿Estás seguro de eliminar esta plantilla?')) {
      const updatedTemplates = templates.filter(t => t.id !== id);
      saveTemplates(updatedTemplates);
    }
  };

  // Marcar/desmarcar como favorita
  const toggleFavorite = (id) => {
    const updatedTemplates = templates.map(t =>
      t.id === id ? { ...t, favorite: !t.favorite } : t
    );
    saveTemplates(updatedTemplates);
  };

  // Ordenar: favoritas primero, luego por fecha
  const sortedTemplates = [...templates].sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          Plantillas Guardadas
        </label>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowSaveDialog(true)}
          disabled={!currentTasks || currentTasks.length === 0}
        >
          <Save className="h-4 w-4 mr-1" />
          Guardar como Plantilla
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
          <p className="text-sm text-gray-500">
            No tienes plantillas guardadas aún
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Configura tus tareas y guárdalas como plantilla para reutilizarlas
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedTemplates.map(template => (
            <div
              key={template.id}
              className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => loadTemplate(template)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">
                      {template.name}
                    </h4>
                    {template.favorite && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {template.totalHours.toFixed(1)}h total
                  </p>
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(template.id);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                    title={template.favorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
                  >
                    {template.favorite ? (
                      <StarOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Star className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTemplate(template.id);
                    }}
                    className="p-1 hover:bg-red-50 rounded"
                    title="Eliminar plantilla"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                {template.tasks.slice(0, 3).map((task, index) => (
                  <div key={index} className="flex justify-between text-xs text-gray-600">
                    <span className="truncate">{task.unit_name}</span>
                    <span className="ml-2 font-medium">
                      {task.hours}h {task.minutes > 0 && `${task.minutes}m`}
                    </span>
                  </div>
                ))}
                {template.tasks.length > 3 && (
                  <p className="text-xs text-gray-400">
                    +{template.tasks.length - 3} más...
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para guardar plantilla */}
      <Modal
        isOpen={showSaveDialog}
        onClose={() => {
          setShowSaveDialog(false);
          setTemplateName('');
        }}
        title="Guardar como Plantilla"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Plantilla
            </label>
            <Input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Ej: Mi día típico, Jornada completa, etc."
              autoFocus
            />
          </div>

          {currentTasks && currentTasks.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tareas a Guardar
              </label>
              <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                {currentTasks.map((task, index) => {
                  const unit = units.find(u => u.id === task.unit_id);
                  return (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-700">{unit?.name || 'Sin nombre'}</span>
                      <span className="font-medium text-gray-900">
                        {task.hours}h {task.minutes > 0 && `${task.minutes}m`}
                      </span>
                    </div>
                  );
                })}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Total</span>
                    <span>
                      {currentTasks.reduce((sum, t) => sum + t.hours + (t.minutes / 60), 0).toFixed(1)}h
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setShowSaveDialog(false);
                setTemplateName('');
              }}
            >
              Cancelar
            </Button>
            <Button
              fullWidth
              onClick={saveAsTemplate}
              loading={saving}
              disabled={!templateName.trim()}
            >
              Guardar Plantilla
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TemplateSelector;
