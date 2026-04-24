/**
 * Modal de Formulario de Objetivo
 * Crear/Editar objetivos
 */

import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { HierarchicalSelect } from '../common/HierarchicalSelect';
import { OBJECTIVE_STATUS } from '../../constants';

export const ObjectiveFormModal = ({ objective, units, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    target_hours: '',
    organizational_unit_id: '',
    success_criteria: '',
    status: OBJECTIVE_STATUS.PLANNED
  });

  useEffect(() => {
    if (objective) {
      setFormData({
        name: objective.name || '',
        description: objective.description || '',
        start_date: objective.start_date || '',
        end_date: objective.end_date || '',
        target_hours: objective.target_hours || '',
        organizational_unit_id: objective.organizational_unit_id || '',
        success_criteria: objective.success_criteria || '',
        status: objective.status || OBJECTIVE_STATUS.PLANNED
      });
    }
  }, [objective]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones básicas (las validaciones detalladas están en el backend)
    if (!formData.name.trim() || !formData.start_date || !formData.end_date || 
        !formData.target_hours || parseFloat(formData.target_hours) <= 0 || 
        !formData.organizational_unit_id || !formData.success_criteria.trim()) {
      return; // El formulario HTML5 mostrará los errores
    }

    onSubmit({
      ...formData,
      target_hours: parseFloat(formData.target_hours)
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={objective ? 'Editar Objetivo' : 'Nuevo Objetivo'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Ej: Cierre Contable Q1 2026"
            required
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Descripción opcional del objetivo"
          />
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Inicio *
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Horas Objetivo y Área */}
        <div className="grid grid-cols-2 gap-4">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ej: 1000"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área/Proceso *
            </label>
            <HierarchicalSelect
              units={units}
              value={formData.organizational_unit_id}
              onChange={(value) => setFormData(prev => ({ ...prev, organizational_unit_id: value }))}
              placeholder="Seleccionar área/proceso"
            />
          </div>
        </div>

        {/* Criterios de Cumplimiento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Criterios de Cumplimiento *
          </label>
          <textarea
            name="success_criteria"
            value={formData.success_criteria}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
            placeholder={"Ejemplo:\n- Balance general presentado a gerencia\n- Estado de resultados completo\n- Conciliaciones bancarias al 100%\n- Cero errores críticos en auditoría"}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Define criterios claros y medibles. Puedes usar formato de lista con guiones (-)
          </p>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="planned">Planeado</option>
            <option value="in_progress">En Progreso</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {objective ? 'Actualizar' : 'Crear'} Objetivo
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ObjectiveFormModal;
