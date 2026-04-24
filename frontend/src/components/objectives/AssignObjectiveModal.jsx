/**
 * Componente: AssignObjectiveModal
 * Modal para asignar un objetivo a un usuario específico con distribución semanal
 */

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import WeeklyScheduleSelector from './WeeklyScheduleSelector';
import { OBJECTIVE_STATUS } from '../../constants';
import logger from '../../utils/logger';
import { useOrganizationalUnits } from '../../hooks/useOrganizationalUnits';
import { useUsers } from '../../hooks/useUsers';

const AssignObjectiveModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const { users } = useUsers(false); // Solo usuarios activos
  const { units } = useOrganizationalUnits();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_hours: '',
    organizational_unit_id: '',
    start_date: '',
    end_date: '',
    success_criteria: '',
    status: OBJECTIVE_STATUS.PLANNED
  });

  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [errors, setErrors] = useState({});

  // Reset form cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        target_hours: '',
        organizational_unit_id: '',
        start_date: '',
        end_date: '',
        success_criteria: '',
        status: OBJECTIVE_STATUS.PLANNED
      });
      setWeeklySchedule([]);
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.assigned_to_user_id) {
      newErrors.assigned_to_user_id = 'Debes seleccionar un usuario';
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

    if (!formData.success_criteria?.trim()) {
      newErrors.success_criteria = 'Los criterios de éxito son requeridos';
    }

    // Validar distribución semanal
    const totalAllocated = weeklySchedule
      .filter(d => d.is_active)
      .reduce((sum, d) => sum + (parseFloat(d.hours_allocated) || 0), 0);

    if (totalAllocated > parseFloat(formData.target_hours)) {
      newErrors.schedule = 'La distribución semanal excede las horas objetivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      logger.error('Validación fallida:', errors);
      return;
    }

    try {
      await onSubmit({
        ...formData,
        target_hours: parseFloat(formData.target_hours),
        weeklySchedule: weeklySchedule.filter(d => d.is_active && d.hours_allocated > 0)
      });
    } catch (error) {
      logger.error('Error al asignar objetivo:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asignar Objetivo a Usuario"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Usuario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Usuario <span className="text-red-500">*</span>
          </label>
          <select
            name="assigned_to_user_id"
            value={formData.assigned_to_user_id}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.assigned_to_user_id ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Seleccionar usuario...</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          {errors.assigned_to_user_id && (
            <p className="text-red-500 text-xs mt-1">{errors.assigned_to_user_id}</p>
          )}
        </div>

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
            placeholder="Ej: Completar módulo de reportes"
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
            placeholder="Descripción detallada del objetivo..."
          />
        </div>

        {/* Unidad Organizacional (opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unidad Organizacional (Opcional)
          </label>
          <select
            name="organizational_unit_id"
            value={formData.organizational_unit_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Sin unidad específica</option>
            {units.map(unit => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
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
        </div>

        {/* Distribución Semanal */}
        {formData.target_hours > 0 && (
          <div className="border-t pt-4">
            <WeeklyScheduleSelector
              totalHours={parseFloat(formData.target_hours) || 0}
              schedule={weeklySchedule}
              onChange={setWeeklySchedule}
            />
            {errors.schedule && (
              <p className="text-sm text-red-600 mt-2">{errors.schedule}</p>
            )}
          </div>
        )}

        {/* Criterios de Éxito */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Criterios de Éxito <span className="text-red-500">*</span>
          </label>
          <textarea
            name="success_criteria"
            value={formData.success_criteria}
            onChange={handleChange}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.success_criteria ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="- Módulo de reportes completado&#10;- Todas las pruebas pasando&#10;- Documentación actualizada"
          />
          {errors.success_criteria && (
            <p className="text-sm text-red-600 mt-1">{errors.success_criteria}</p>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Asignando...' : 'Asignar Objetivo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

AssignObjectiveModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default AssignObjectiveModal;
