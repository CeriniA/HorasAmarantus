/**
 * Página de Gestión de Objetivos
 * CRUD completo de objetivos (solo para admins)
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useOrganizationalUnits } from '../hooks/useOrganizationalUnits';
import { isAdminOrSuperadmin } from '../utils/roleHelpers';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Plus, Edit2, Trash2, Target, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { safeDate } from '../utils/dateHelpers';
import * as objectivesService from '../services/objectives.service';
import { usersService } from '../services/api';
import UnifiedObjectiveModal from '../components/objectives/UnifiedObjectiveModal';
import ObjectiveProgress from '../components/objectives/ObjectiveProgress';
import ObjectiveCompletionModal from '../components/objectives/ObjectiveCompletionModal';
import ObjectiveStatusBadge from '../components/objectives/ObjectiveStatusBadge';
import ObjectiveTypeBadge from '../components/objectives/ObjectiveTypeBadge';
import ObjectiveUrgencyIndicator from '../components/objectives/ObjectiveUrgencyIndicator';
import ObjectiveFilters from '../components/objectives/ObjectiveFilters';
import Alert from '../components/common/Alert';
import { applyObjectiveFilters, sortObjectives } from '../utils/objectiveFilters';
import { OBJECTIVE_TYPES, OBJECTIVE_STATUS } from '../constants';
import { MESSAGES } from '../constants/messages';
import logger from '../utils/logger';

export const Objectives = () => {
  // 1. Hooks primero
  const { user } = useAuthContext();
  const { units } = useOrganizationalUnits();
  
  // 2. Estados
  const [objectives, setObjectives] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [modalType, setModalType] = useState(OBJECTIVE_TYPES.COMPANY);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all',
    unit: 'all',
    dateFrom: '',
    dateTo: '',
    progressMin: '',
    progressMax: '',
    urgency: 'all'
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [alert, setAlert] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, objective: null });

  // 3. Callbacks (ANTES de useEffect)
  const loadObjectives = useCallback(async () => {
    try {
      setLoading(true);
      const objectivesData = await objectivesService.getAllObjectives();
      setObjectives(objectivesData || []);
      logger.info('Objetivos cargados:', objectivesData?.length || 0);
    } catch (error) {
      logger.error('Error al cargar objetivos:', error);
      setAlert({ type: 'error', message: MESSAGES.ERROR_LOADING_DATA });
      setObjectives([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedObjective(null);
    setModalType(OBJECTIVE_TYPES.COMPANY);
    setIsFormModalOpen(true);
  }, []);

  const handleAssign = useCallback(() => {
    setSelectedObjective(null);
    setModalType(OBJECTIVE_TYPES.ASSIGNED);
    setIsFormModalOpen(true);
  }, []);

  const handleEdit = useCallback((objective) => {
    setSelectedObjective(objective);
    setIsFormModalOpen(true);
  }, []);

  const handleMarkCompletion = useCallback((objective) => {
    setSelectedObjective(objective);
    setIsCompletionModalOpen(true);
  }, []);

  const handleDelete = useCallback((objective) => {
    setConfirmDialog({ isOpen: true, objective });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    const objective = confirmDialog.objective;
    setConfirmDialog({ isOpen: false, objective: null });

    try {
      await objectivesService.deleteObjective(objective.id);
      setAlert({ type: 'success', message: MESSAGES.OBJECTIVE_DELETED_SUCCESS });
      logger.info('Objetivo eliminado:', objective.id);
      loadObjectives();
    } catch (error) {
      logger.error('Error al eliminar objetivo:', error);
      setAlert({ type: 'error', message: MESSAGES.OBJECTIVE_DELETE_ERROR });
    }
  }, [confirmDialog.objective, loadObjectives]);

  const handleFormSubmit = useCallback(async (objectiveData) => {
    try {
      if (selectedObjective) {
        await objectivesService.updateObjective(selectedObjective.id, objectiveData);
        logger.info('Objetivo actualizado:', selectedObjective.id);
      } else {
        await objectivesService.createObjective(objectiveData);
        logger.info('Objetivo creado');
      }
      setAlert({ 
        type: 'success', 
        message: selectedObjective ? MESSAGES.OBJECTIVE_UPDATED_SUCCESS : MESSAGES.OBJECTIVE_CREATED_SUCCESS 
      });
      setIsFormModalOpen(false);
      loadObjectives();
    } catch (error) {
      logger.error('Error al guardar objetivo:', error);
      setAlert({ type: 'error', message: MESSAGES.OBJECTIVE_SAVE_ERROR });
    }
  }, [selectedObjective, loadObjectives]);

  const handleCompletionSubmit = useCallback(async (completionData) => {
    try {
      await objectivesService.markObjectiveCompletion(selectedObjective.id, completionData);
      setAlert({ type: 'success', message: MESSAGES.OBJECTIVE_COMPLETION_SUCCESS });
      logger.info('Cumplimiento registrado:', selectedObjective.id);
      setIsCompletionModalOpen(false);
      loadObjectives();
    } catch (error) {
      logger.error('Error al registrar cumplimiento:', error);
      setAlert({ type: 'error', message: MESSAGES.OBJECTIVE_COMPLETION_ERROR });
    }
  }, [selectedObjective, loadObjectives]);

  const loadUsers = useCallback(async () => {
    try {
      const { users: usersData } = await usersService.getAll();
      setUsers(usersData || []);
      logger.info('Usuarios cargados:', usersData?.length || 0);
    } catch (error) {
      logger.error('Error al cargar usuarios:', error);
      setUsers([]);
    }
  }, []);

  // 4. Effects (DESPUÉS de definir callbacks)
  useEffect(() => {
    if (isAdminOrSuperadmin(user)) {
      loadObjectives();
      loadUsers();
    }
  }, [user, loadObjectives, loadUsers]);

  // Verificar permisos
  if (!isAdminOrSuperadmin(user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <div className="text-center py-8">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
            <p className="text-gray-600">Solo los administradores pueden acceder a esta página.</p>
          </div>
        </Card>
      </div>
    );
  }

  // Callbacks ya definidos arriba

  // Filtrar y ordenar objetivos
  const filteredObjectives = sortObjectives(
    applyObjectiveFilters(objectives, filters),
    sortBy,
    sortOrder
  );

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Objetivos</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Define y monitorea objetivos por área/proceso</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button onClick={handleAssign} variant="secondary" className="flex items-center justify-center gap-2 w-full sm:w-auto">
            <Target className="h-5 w-5" />
            <span className="hidden sm:inline">Asignar a Usuario</span>
            <span className="sm:hidden">Asignar</span>
          </Button>
          <Button onClick={handleCreate} className="flex items-center justify-center gap-2 w-full sm:w-auto">
            <Plus className="h-5 w-5" />
            Nuevo Objetivo
          </Button>
        </div>
      </div>

      {/* Filtros Avanzados */}
      <ObjectiveFilters
        onFilterChange={handleFilterChange}
        totalCount={objectives.length}
        filteredCount={filteredObjectives.length}
        units={units}
      />

      {/* Lista de Objetivos */}
      {filteredObjectives.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay objetivos</h3>
            <p className="text-gray-600 mb-4">
              {objectives.length === 0
                ? 'Comienza creando tu primer objetivo'
                : 'No hay objetivos que coincidan con los filtros seleccionados'}
            </p>
            {objectives.length === 0 && (
              <Button onClick={handleCreate}>Crear Objetivo</Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredObjectives.map((objective) => (
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
                    <ObjectiveTypeBadge type={objective.objective_type} size="md" />
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

                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Área/Proceso</p>
                      <p className="font-semibold text-gray-900">{objective.organizational_units?.name || 'N/A'}</p>
                    </div>
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
                      <p className="text-sm text-gray-500">Creado por</p>
                      <p className="font-semibold text-gray-900">{objective.users?.name || 'N/A'}</p>
                    </div>
                  </div>

                  {objective.success_criteria && (
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Criterios de Cumplimiento:</p>
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans">{objective.success_criteria}</pre>
                    </div>
                  )}

                  {objective.completion_notes && (
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-3">
                      <p className="text-sm font-medium text-blue-900 mb-2">Notas de Cumplimiento:</p>
                      <p className="text-sm text-blue-700">{objective.completion_notes}</p>
                    </div>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex sm:flex-col gap-2 sm:ml-4 flex-shrink-0">
                  {objective.status !== OBJECTIVE_STATUS.COMPLETED && objective.status !== OBJECTIVE_STATUS.CANCELLED && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkCompletion(objective)}
                      title="Marcar cumplimiento"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
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

              {/* Progreso Visual - Full Width */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <ObjectiveProgress objective={objective} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modales */}
      {isFormModalOpen && (
        <UnifiedObjectiveModal
          objective={selectedObjective}
          units={units}
          users={users}
          defaultType={modalType}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      {isCompletionModalOpen && (
        <ObjectiveCompletionModal
          objective={selectedObjective}
          onClose={() => setIsCompletionModalOpen(false)}
          onSubmit={handleCompletionSubmit}
        />
      )}

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, objective: null })}
        onConfirm={handleConfirmDelete}
        title="Eliminar Objetivo"
        message={confirmDialog.objective ? MESSAGES.CONFIRM_DELETE_OBJECTIVE(confirmDialog.objective.name) : ''}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default Objectives;
