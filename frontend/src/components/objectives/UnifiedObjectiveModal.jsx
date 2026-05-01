/**
 * Modal Unificado de Objetivos
 * Maneja creación de objetivos de Empresa, Asignados y Personales con tabs
 */

import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { HierarchicalSelect } from '../common/HierarchicalSelect';
import { Building2, UserCheck, User, AlertCircle } from 'lucide-react';
import { OBJECTIVE_TYPES } from '../../constants';
import { removeEmptyFields } from '../../utils/objectHelpers';
import { validateObjectiveData, validateHoursForPeriod, getValidationWarnings } from '../../utils/objectiveValidation';
import logger from '../../utils/logger';

export const UnifiedObjectiveModal = ({ 
  objective, 
  units, 
  users,
  onClose, 
  onSubmit,
  defaultType = OBJECTIVE_TYPES.COMPANY 
}) => {
  const [activeTab, setActiveTab] = useState(defaultType);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    target_hours: '',
    organizational_unit_id: '',
    assigned_to_user_id: '',
    success_criteria: ''
  });
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    if (objective) {
      setFormData({
        name: objective.name || '',
        description: objective.description || '',
        start_date: objective.start_date || '',
        end_date: objective.end_date || '',
        target_hours: objective.target_hours || '',
        organizational_unit_id: objective.organizational_unit_id || '',
        assigned_to_user_id: objective.assigned_to_user_id || '',
        success_criteria: objective.success_criteria || ''
      });
      setActiveTab(objective.objective_type || defaultType);
    }
  }, [objective, defaultType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    logger.info('🔍 Datos del formulario:', formData);
    logger.info('🔍 Tipo de objetivo activo:', activeTab);
    
    // Validar datos
    const validation = validateObjectiveData(formData, activeTab);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      logger.warn('❌ Validación falló:', validation.errors);
      return;
    }

    // Validar horas para el período
    const hoursValidation = validateHoursForPeriod(
      parseFloat(formData.target_hours),
      formData.start_date,
      formData.end_date
    );

    if (!hoursValidation.isValid) {
      setErrors({ target_hours: hoursValidation.warning });
      logger.warn('❌ Validación de horas falló:', hoursValidation.warning);
      return;
    }

    // Mostrar advertencias si existen
    const validationWarnings = getValidationWarnings(validation.errors);
    if (hoursValidation.warning) {
      validationWarnings.push(hoursValidation.warning);
    }
    setWarnings(validationWarnings);

    // Preparar datos usando helper
    const rawData = {
      name: formData.name,
      description: formData.description,
      start_date: formData.start_date,
      end_date: formData.end_date,
      target_hours: parseFloat(formData.target_hours),
      objective_type: activeTab,
      organizational_unit_id: formData.organizational_unit_id,
      assigned_to_user_id: formData.assigned_to_user_id,
      success_criteria: formData.success_criteria
    };

    // Limpiar campos vacíos (strings vacíos se eliminan, strings se hacen trim)
    const objectiveData = removeEmptyFields(rawData, {
      removeEmptyStrings: true,
      trimStrings: true,
      removeNull: false
    });

    logger.info('✅ Enviando datos al servidor:', objectiveData);
    
    // Limpiar errores y advertencias
    setErrors({});
    setWarnings([]);
    onSubmit(objectiveData);
  };

  const tabs = [
    {
      id: OBJECTIVE_TYPES.COMPANY,
      label: 'Empresa',
      icon: Building2,
      description: 'Para toda un área/proceso'
    },
    {
      id: OBJECTIVE_TYPES.ASSIGNED,
      label: 'Asignado',
      icon: UserCheck,
      description: 'Para un empleado específico'
    },
    {
      id: OBJECTIVE_TYPES.PERSONAL,
      label: 'Personal',
      icon: User,
      description: 'Objetivo personal del usuario'
    }
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={objective ? 'Editar Objetivo' : 'Nuevo Objetivo'}
      size="lg"
    >
      {/* Tabs - Responsive: Vertical en mobile, horizontal en desktop */}
      {!objective && (
        <div className="mb-6">
          {/* Mobile: Dropdown selector */}
          <div className="sm:hidden">
            <label htmlFor="objective-type" className="sr-only">
              Tipo de objetivo
            </label>
            <select
              id="objective-type"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="block w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label} - {tab.description}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop: Tabs horizontales */}
          <div className="hidden sm:block border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-3 px-2 text-center border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <Icon className="h-5 w-5" />
                      <span className="text-xs sm:text-sm">{tab.label}</span>
                      <span className="text-xs text-gray-400 hidden lg:inline">{tab.description}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Advertencias generales */}
        {warnings.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 rounded">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 mb-1">Advertencias:</p>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Objetivo *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2.5 sm:px-4 sm:py-2 border rounded-lg focus:ring-2 focus:border-transparent text-base ${
              errors.name 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-primary-500'
            }`}
            placeholder="Ej: Cierre Contable Q1 2026"
            required
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            className={`w-full px-3 py-2.5 sm:px-4 sm:py-2 border rounded-lg focus:ring-2 focus:border-transparent text-base ${
              errors.description 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-primary-500'
            }`}
            placeholder="Descripción opcional del objetivo"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.description}
            </p>
          )}
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Inicio *
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 sm:px-4 sm:py-2 border rounded-lg focus:ring-2 focus:border-transparent text-base ${
                errors.start_date 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-primary-500'
              }`}
              required
            />
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.start_date}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Fin *
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              min={formData.start_date}
              className={`w-full px-3 py-2.5 sm:px-4 sm:py-2 border rounded-lg focus:ring-2 focus:border-transparent text-base ${
                errors.end_date 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-primary-500'
              }`}
              required
            />
            {errors.end_date && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.end_date}
              </p>
            )}
          </div>
        </div>

        {/* Horas Objetivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Horas Objetivo *
          </label>
          <input
            type="number"
            name="target_hours"
            value={formData.target_hours}
            onChange={handleChange}
            min="0"
            step="0.5"
            className={`w-full px-3 py-2.5 sm:px-4 sm:py-2 border rounded-lg focus:ring-2 focus:border-transparent text-base ${
              errors.target_hours 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-primary-500'
            }`}
            placeholder="Ej: 100"
            required
          />
          {errors.target_hours ? (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.target_hours}
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">
              Total de horas a completar en el período
            </p>
          )}
        </div>

        {/* Campos específicos por tipo */}
        {activeTab === OBJECTIVE_TYPES.COMPANY && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área/Proceso *
            </label>
            <HierarchicalSelect
              units={units}
              value={formData.organizational_unit_id}
              onChange={(value) => {
                setFormData(prev => ({ ...prev, organizational_unit_id: value }));
                if (errors.organizational_unit_id) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.organizational_unit_id;
                    return newErrors;
                  });
                }
              }}
              placeholder="Seleccionar área/proceso"
            />
            {errors.organizational_unit_id ? (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.organizational_unit_id}
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Todos los usuarios de esta unidad podrán ver y trabajar en este objetivo
              </p>
            )}
          </div>
        )}

        {activeTab === OBJECTIVE_TYPES.ASSIGNED && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario Asignado *
              </label>
              <select
                name="assigned_to_user_id"
                value={formData.assigned_to_user_id}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 sm:px-4 sm:py-2 border rounded-lg focus:ring-2 focus:border-transparent text-base ${
                  errors.assigned_to_user_id 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-primary-500'
                }`}
                required
              >
                <option value="">Seleccionar usuario...</option>
                {users && users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              {errors.assigned_to_user_id ? (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.assigned_to_user_id}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Solo este usuario podrá ver y trabajar en este objetivo
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tarea/Actividad
              </label>
              <HierarchicalSelect
                units={units}
                value={formData.organizational_unit_id}
                onChange={(value) => setFormData(prev => ({ ...prev, organizational_unit_id: value }))}
                placeholder="Seleccionar tarea (opcional)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Opcional: Asociar a una tarea específica
              </p>
            </div>
          </>
        )}

        {activeTab === OBJECTIVE_TYPES.PERSONAL && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-sm text-blue-700">
              <strong>Nota:</strong> Los objetivos personales son privados y solo visibles para el usuario que los crea.
            </p>
          </div>
        )}

        {/* Criterios de Éxito (opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Criterios de Cumplimiento <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea
            name="success_criteria"
            value={formData.success_criteria}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
            placeholder={"Ejemplo:\n- Balance general presentado\n- Estado de resultados completo\n- Cero errores críticos"}
          />
          <p className="text-xs text-gray-500 mt-1">
            Define criterios claros y medibles (opcional)
          </p>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-6 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {objective ? 'Actualizar' : 'Crear'} Objetivo
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UnifiedObjectiveModal;
