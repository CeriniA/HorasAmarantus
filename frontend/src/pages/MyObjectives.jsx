/**
 * Página: Mis Objetivos Personales
 * Permite a los usuarios (operarios) gestionar sus objetivos personales
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Plus, Edit2, Trash2, Target, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { safeDate } from '../utils/dateHelpers';
import * as objectivesService from '../services/objectives.service';
import UnifiedObjectiveModal from '../components/objectives/UnifiedObjectiveModal';
import ObjectiveProgress from '../components/objectives/ObjectiveProgress';
import ObjectiveStatusBadge from '../components/objectives/ObjectiveStatusBadge';
import ObjectiveUrgencyIndicator from '../components/objectives/ObjectiveUrgencyIndicator';
import Alert from '../components/common/Alert';
import { OBJECTIVE_TYPES } from '../constants';
import { MESSAGES } from '../constants/messages';
import logger from '../utils/logger';

export const MyObjectives = () => {
  const { user } = useAuthContext();
  
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [alert, setAlert] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, objective: null });

  const loadObjectives = useCallback(async () => {
    try {
      setLoading(true);
      const objectivesData = await objectivesService.getAllObjectives();
      // Filtrar solo objetivos personales del usuario actual
      const myPersonalObjectives = (objectivesData || []).filter(
        obj => obj.objective_type === OBJECTIVE_TYPES.PERSONAL && 
               obj.assigned_to_user_id === user.id
      );
      setObjectives(myPersonalObjectives);
      logger.info('Mis objetivos personales cargados:', myPersonalObjectives.length);
    } catch (error) {
      logger.error('Error al cargar objetivos personales:', error);
      setAlert({ type: 'error', message: MESSAGES.ERROR_LOADING_DATA });
      setObjectives([]);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadObjectives();
  }, [loadObjectives]);

  const handleCreate = useCallback(() => {
    setSelectedObjective(null);
    setIsFormModalOpen(true);
  }, []);

  const handleEdit = useCallback((objective) => {
    setSelectedObjective(objective);
    setIsFormModalOpen(true);
  }, []);

  const handleDelete = useCallback((objective) => {
    setConfirmDialog({ isOpen: true, objective });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    const objective = confirmDialog.objective;
    setConfirmDialog({ isOpen: false, objective: null });

    try {
      await objectivesService.deleteObjective(objective.id);
      setAlert({ type: 'success', message: 'Objetivo eliminado correctamente' });
      logger.info('Objetivo personal eliminado:', objective.id);
      loadObjectives();
    } catch (error) {
      logger.error('Error al eliminar objetivo:', error);
      setAlert({ type: 'error', message: 'Error al eliminar el objetivo' });
    }
  }, [confirmDialog.objective, loadObjectives]);

  const handleFormSubmit = useCallback(async (objectiveData) => {
    try {
      // Asegurar que sea objetivo personal y asignado al usuario actual
      const personalObjectiveData = {
        ...objectiveData,
        objective_type: OBJECTIVE_TYPES.PERSONAL,
        assigned_to_user_id: user.id,
        organizational_unit_id: null // Objetivos personales no tienen unidad organizacional
      };

      if (selectedObjective) {
        await objectivesService.updateObjective(selectedObjective.id, personalObjectiveData);
        logger.info('Objetivo personal actualizado:', selectedObjective.id);
      } else {
        await objectivesService.createObjective(personalObjectiveData);
        logger.info('Objetivo personal creado');
      }
      setAlert({ 
        type: 'success', 
        message: selectedObjective ? 'Objetivo actualizado correctamente' : 'Objetivo creado correctamente'
      });
      setIsFormModalOpen(false);
      loadObjectives();
    } catch (error) {
      logger.error('Error al guardar objetivo personal:', error);
      setAlert({ type: 'error', message: 'Error al guardar el objetivo' });
    }
  }, [selectedObjective, loadObjectives, user.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando objetivos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mis Objetivos Personales</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Crea y gestiona tus objetivos personales de trabajo
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus className="h-5 w-5" />
          Nuevo Objetivo Personal
        </Button>
      </div>

      {/* Información */}
      <Card>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Target className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                ¿Qué son los objetivos personales?
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Los objetivos personales te permiten definir metas específicas de trabajo con fechas y horas objetivo.
                  Son visibles solo para ti y te ayudan a organizar tu tiempo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Lista de Objetivos */}
      {objectives.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes objetivos personales</h3>
            <p className="text-gray-600 mb-4">
              Comienza creando tu primer objetivo personal para organizar tu trabajo
            </p>
            <Button onClick={handleCreate}>Crear Objetivo Personal</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {objectives.map((objective) => (
            <Card key={objective.id}>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Título */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    {objective.name}
                  </h3>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <ObjectiveStatusBadge status={objective.status} size="md" />
                    {objective.end_date && (
                      <ObjectiveUrgencyIndicator endDate={objective.end_date} size="md" />
                    )}
                    {objective.is_completed !== null && (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        objective.is_completed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {objective.is_completed ? (
                          <><CheckCircle className="h-3.5 w-3.5" /> Cumplido</>
                        ) : (
                          <><XCircle className="h-3.5 w-3.5" /> No Cumplido</>
                        )}
                      </span>
                    )}
                  </div>
                  
                  {objective.description && (
                    <p className="text-gray-600 mb-3">{objective.description}</p>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Período</p>
                      <p className="font-semibold text-gray-900">
                        {objective.start_date && objective.end_date ? (
                          <>
                            {format(safeDate(objective.start_date), 'dd/MM/yyyy', { locale: es })} - {' '}
                            {format(safeDate(objective.end_date), 'dd/MM/yyyy', { locale: es })}
                          </>
                        ) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Horas Objetivo</p>
                      <p className="font-semibold text-gray-900">{objective.target_hours}h</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Progreso</p>
                      <p className="font-semibold text-gray-900">
                        {objective.completed_hours || 0}h / {objective.target_hours}h
                      </p>
                    </div>
                  </div>

                  {objective.success_criteria && (
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Criterios de Cumplimiento:</p>
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans">{objective.success_criteria}</pre>
                    </div>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex sm:flex-col gap-2 sm:ml-4 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(objective)}
                    title="Editar"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(objective)}
                    className="text-red-600 hover:text-red-700"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Progreso Visual */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <ObjectiveProgress objective={objective} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Formulario */}
      {isFormModalOpen && (
        <UnifiedObjectiveModal
          objective={selectedObjective}
          units={[]} // No se usan unidades en objetivos personales
          users={[]} // No se usan usuarios en objetivos personales
          defaultType={OBJECTIVE_TYPES.PERSONAL}
          allowedTypes={[OBJECTIVE_TYPES.PERSONAL]} // Solo permite objetivos personales
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, objective: null })}
        onConfirm={handleConfirmDelete}
        title="Eliminar Objetivo Personal"
        message={confirmDialog.objective ? `¿Estás seguro de que deseas eliminar "${confirmDialog.objective.name}"?` : ''}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default MyObjectives;
