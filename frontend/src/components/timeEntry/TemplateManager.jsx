/**
 * Gestor de Plantillas de Jornada
 * Permite guardar y aplicar plantillas de distribución de horas
 */

import { useState, useEffect } from 'react';
import { Save, Trash2, FileText, Plus, Check } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

export const TemplateManager = ({ timeEntries, onApplyTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Cargar plantillas del localStorage
  useEffect(() => {
    const stored = localStorage.getItem('time_entry_templates');
    if (stored) {
      try {
        setTemplates(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    }
  }, []);

  // Guardar plantillas en localStorage
  const saveTemplates = (newTemplates) => {
    localStorage.setItem('time_entry_templates', JSON.stringify(newTemplates));
    setTemplates(newTemplates);
  };

  // Crear nueva plantilla desde timeEntries actual
  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) {
      window.alert('Ingresa un nombre para la plantilla');
      return;
    }

    if (Object.keys(timeEntries).length === 0) {
      window.alert('No hay horas cargadas para guardar como plantilla');
      return;
    }

    const newTemplate = {
      id: Date.now().toString(),
      name: newTemplateName.trim(),
      entries: { ...timeEntries },
      createdAt: new Date().toISOString(),
      totalHours: Object.values(timeEntries).reduce((sum, t) => sum + t.total, 0)
    };

    const updated = [...templates, newTemplate];
    saveTemplates(updated);
    setNewTemplateName('');
    setShowCreateForm(false);
  };

  // Eliminar plantilla
  const handleDeleteTemplate = (templateId) => {
    if (window.confirm('¿Eliminar esta plantilla?')) {
      const updated = templates.filter(t => t.id !== templateId);
      saveTemplates(updated);
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
      }
    }
  };

  // Aplicar plantilla
  const handleApplyTemplate = (template) => {
    if (window.confirm(`¿Aplicar plantilla "${template.name}"? Esto reemplazará las horas actuales.`)) {
      onApplyTemplate(template.entries);
      setSelectedTemplate(template);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Plantillas de Jornada</h3>
          <p className="text-sm text-gray-500">Guarda y reutiliza distribuciones de horas</p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Plantilla
        </Button>
      </div>

      {/* Formulario de creación */}
      {showCreateForm && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex gap-2">
            <Input
              placeholder="Nombre de la plantilla (ej: Día Normal)"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateTemplate()}
            />
            <Button onClick={handleCreateTemplate}>
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateForm(false);
                setNewTemplateName('');
              }}
            >
              Cancelar
            </Button>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            💡 Se guardará la distribución de horas actual
          </p>
        </div>
      )}

      {/* Lista de plantillas */}
      {templates.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No hay plantillas guardadas</p>
          <p className="text-sm text-gray-500 mt-1">
            Carga horas y guárdalas como plantilla para reutilizarlas
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`
                p-4 rounded-lg border-2 transition-all cursor-pointer
                ${selectedTemplate?.id === template.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-white hover:border-primary-300'
                }
              `}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className={`h-5 w-5 ${
                      selectedTemplate?.id === template.id ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                    <h4 className="font-semibold text-gray-900">{template.name}</h4>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {template.totalHours.toFixed(1)}h total
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {Object.keys(template.entries).length} tareas
                  </p>
                </div>

                {selectedTemplate?.id === template.id && (
                  <Check className="h-5 w-5 text-primary-600" />
                )}
              </div>

              {/* Detalles de la plantilla */}
              <div className="space-y-1 mb-3 max-h-32 overflow-y-auto">
                {Object.entries(template.entries).map(([unitId, time]) => (
                  <div key={unitId} className="text-xs text-gray-600 flex justify-between">
                    <span className="truncate">Tarea {unitId.slice(-4)}</span>
                    <span className="font-medium">{time.total.toFixed(1)}h</span>
                  </div>
                ))}
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyTemplate(template);
                  }}
                >
                  Aplicar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTemplate(template.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600">
          💡 <strong>Tip:</strong> Las plantillas se guardan en tu navegador. Carga tus horas habituales
          y guárdalas como plantilla para aplicarlas rápidamente en días similares.
        </p>
      </div>
    </div>
  );
};

export default TemplateManager;
