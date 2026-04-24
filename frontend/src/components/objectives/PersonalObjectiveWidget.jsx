/**
 * Componente: PersonalObjectiveWidget
 * Widget para que el usuario cree y gestione su objetivo personal
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import { Target, Plus } from 'lucide-react';
import { OBJECTIVE_TYPES, OBJECTIVE_STATUS } from '../../constants';
import { useOrganizationalUnits } from '../../hooks/useOrganizationalUnits';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import logger from '../../utils/logger';

const PersonalObjectiveWidget = ({ onCreatePersonal, canCreate, loading }) => {
  const { units } = useOrganizationalUnits();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_hours: '',
    start_date: '',
    end_date: '',
    success_criteria: '',
    organizational_unit_id: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.target_hours || formData.target_hours <= 0) {
      newErrors.target_hours = 'Las horas objetivo deben ser mayores a 0';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'La fecha de inicio es requerida';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'La fecha de fin es requerida';
    }

    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
      newErrors.end_date = 'La fecha de fin debe ser posterior a la de inicio';
    }

    if (!formData.organizational_unit_id) {
      newErrors.organizational_unit_id = 'La unidad organizacional es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await onCreatePersonal({
        ...formData,
        objective_type: OBJECTIVE_TYPES.PERSONAL,
        target_hours: parseFloat(formData.target_hours),
        status: OBJECTIVE_STATUS.PLANNED
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        target_hours: '',
        start_date: '',
        end_date: '',
        success_criteria: '',
        organizational_unit_id: ''
      });
      setShowForm(false);
    } catch (error) {
      logger.error('Error al crear objetivo personal:', error);
    }
  };

  if (!canCreate) {
    return (
      <Card className="bg-gray-50 border-gray-200">
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Tienes un Objetivo Asignado
          </h3>
          <p className="text-sm text-gray-600">
            No puedes crear objetivos personales mientras tengas un objetivo asignado por tu jefe.
          </p>
        </div>
      </Card>
    );
  }

  if (!showForm) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Crea tu Objetivo Personal
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Define tus propias metas y lleva un control personal de tus horas.
          </p>
          <Button
            onClick={() => setShowForm(true)}
            variant="primary"
            className="inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Crear Objetivo Personal
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-blue-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Target className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Nuevo Objetivo Personal
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Objetivo <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Ej: Mejorar productividad semanal"
          />
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Descripción de tu objetivo..."
          />
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              error={errors.start_date}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              error={errors.end_date}
            />
          </div>
        </div>

        {/* Unidad Organizacional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unidad Organizacional <span className="text-red-500">*</span>
          </label>
          <select
            name="organizational_unit_id"
            value={formData.organizational_unit_id}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.organizational_unit_id ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecciona una unidad</option>
            {units.map(unit => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
          {errors.organizational_unit_id && (
            <p className="text-red-500 text-xs mt-1">{errors.organizational_unit_id}</p>
          )}
        </div>

        {/* Horas Objetivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Horas Objetivo Totales <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            name="target_hours"
            value={formData.target_hours}
            onChange={handleChange}
            error={errors.target_hours}
            min="0"
            step="0.5"
            placeholder="Ej: 40"
          />
          <p className="text-xs text-gray-500 mt-1">
            Total de horas para todo el período del objetivo
          </p>
        </div>

        {/* Criterios de Éxito (opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Criterios de Éxito (Opcional)
          </label>
          <textarea
            name="success_criteria"
            value={formData.success_criteria}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="- Completar 40 horas semanales&#10;- Mantener productividad constante"
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setShowForm(false);
              setFormData({
                name: '',
                description: '',
                target_hours: '',
                start_date: '',
                end_date: '',
                success_criteria: '',
                organizational_unit_id: ''
              });
              setErrors({});
            }}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear Objetivo'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

PersonalObjectiveWidget.propTypes = {
  onCreatePersonal: PropTypes.func.isRequired,
  canCreate: PropTypes.bool.isRequired,
  loading: PropTypes.bool
};

export default PersonalObjectiveWidget;
