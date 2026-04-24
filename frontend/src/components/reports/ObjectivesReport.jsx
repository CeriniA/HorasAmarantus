/**
 * Reporte de Objetivos del Sistema
 * Muestra objetivos de empresa, asignados y personales con sub-pestañas
 * Usa servicio de objetivos existente (DRY)
 */

import { useState, useEffect } from 'react';
import { Target, Building2, UserCheck, User, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import Card from '../common/Card';
import { OBJECTIVE_TYPES, OBJECTIVE_STATUS, OBJECTIVE_STATUS_LABELS, OBJECTIVE_STATUS_COLORS } from '../../constants';
import { isAdminOrSuperadmin } from '../../utils/roleHelpers';
import * as objectivesService from '../../services/objectives.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { safeDate } from '../../utils/dateHelpers';
import logger from '../../utils/logger';

export const ObjectivesReport = ({ user }) => {
  const [activeSubTab, setActiveSubTab] = useState('company');
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadObjectives();
  }, []);

  const loadObjectives = async () => {
    try {
      setLoading(true);
      const data = await objectivesService.getAllObjectives();
      setObjectives(data || []);
    } catch (error) {
      logger.error('Error al cargar objetivos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar objetivos según sub-pestaña
  const filteredObjectives = objectives.filter(obj => {
    if (activeSubTab === 'company') {
      return obj.objective_type === OBJECTIVE_TYPES.COMPANY;
    } else if (activeSubTab === 'assigned') {
      return obj.objective_type === OBJECTIVE_TYPES.ASSIGNED;
    } else if (activeSubTab === 'personal') {
      return obj.objective_type === OBJECTIVE_TYPES.PERSONAL;
    }
    return false;
  });

  // Calcular estadísticas
  const stats = {
    total: filteredObjectives.length,
    completed: filteredObjectives.filter(o => o.status === OBJECTIVE_STATUS.COMPLETED).length,
    inProgress: filteredObjectives.filter(o => o.status === OBJECTIVE_STATUS.IN_PROGRESS).length,
    planned: filteredObjectives.filter(o => o.status === OBJECTIVE_STATUS.PLANNED).length,
    cancelled: filteredObjectives.filter(o => o.status === OBJECTIVE_STATUS.CANCELLED).length,
  };

  // Calcular % de cumplimiento promedio
  const objectivesWithProgress = filteredObjectives.filter(o => o.target_hours > 0);
  const avgCompletion = objectivesWithProgress.length > 0
    ? objectivesWithProgress.reduce((sum, o) => {
        const progress = Math.min((o.completed_hours || 0) / o.target_hours * 100, 100);
        return sum + progress;
      }, 0) / objectivesWithProgress.length
    : 0;

  if (loading) {
    return (
      <Card title="Objetivos">
        <div className="text-center py-8 text-gray-500">
          Cargando objetivos...
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub-pestañas */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveSubTab('company')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeSubTab === 'company'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Objetivos de Empresa
            </button>
            <button
              onClick={() => setActiveSubTab('assigned')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeSubTab === 'assigned'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Objetivos Asignados
            </button>
            {isAdminOrSuperadmin(user) && (
              <button
                onClick={() => setActiveSubTab('personal')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeSubTab === 'personal'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <User className="h-4 w-4 mr-2" />
                Objetivos Personales
                <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded">Supervisión</span>
              </button>
            )}
          </nav>
        </div>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <div className="text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="text-sm font-medium text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-sm font-medium text-gray-500">Completados</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <p className="text-sm font-medium text-gray-500">En Progreso</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <p className="text-sm font-medium text-gray-500">Planificados</p>
            <p className="text-2xl font-bold text-gray-600">{stats.planned}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="h-8 w-8 mx-auto mb-2 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-sm font-medium text-gray-500">% Promedio</p>
            <p className="text-2xl font-bold text-blue-600">{avgCompletion.toFixed(0)}%</p>
          </div>
        </Card>
      </div>

      {/* Descripción de la pestaña */}
      <Card>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="ml-3">
              {activeSubTab === 'company' && (
                <>
                  <h3 className="text-sm font-medium text-blue-800">Objetivos de Empresa</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Objetivos estratégicos de la organización. Visibles para todos los empleados.
                    Se miden por área o unidad organizacional.
                  </p>
                </>
              )}
              {activeSubTab === 'assigned' && (
                <>
                  <h3 className="text-sm font-medium text-blue-800">Objetivos Asignados</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Objetivos asignados por administradores a empleados específicos.
                    Incluyen distribución semanal de horas.
                  </p>
                </>
              )}
              {activeSubTab === 'personal' && (
                <>
                  <h3 className="text-sm font-medium text-blue-800">Objetivos Personales (Supervisión)</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Objetivos creados por los empleados para su desarrollo personal.
                    Esta vista es solo para supervisión administrativa.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabla de objetivos */}
      <Card title={`Lista de Objetivos (${filteredObjectives.length})`}>
        {filteredObjectives.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No hay objetivos {activeSubTab === 'company' ? 'de empresa' : activeSubTab === 'assigned' ? 'asignados' : 'personales'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Objetivo
                  </th>
                  {activeSubTab !== 'company' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Asignado a
                    </th>
                  )}
                  {activeSubTab === 'company' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Área/Unidad
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Período
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Horas Objetivo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Horas Completadas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    % Cumplimiento
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredObjectives.map((objective) => {
                  const progress = objective.target_hours > 0
                    ? Math.min((objective.completed_hours || 0) / objective.target_hours * 100, 100)
                    : 0;

                  return (
                    <tr key={objective.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{objective.name}</div>
                        {objective.description && (
                          <div className="text-sm text-gray-500 mt-1">{objective.description}</div>
                        )}
                      </td>
                      {activeSubTab !== 'company' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {objective.users?.name || 'Sin asignar'}
                        </td>
                      )}
                      {activeSubTab === 'company' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {objective.organizational_units?.name || 'General'}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {objective.start_date && format(safeDate(objective.start_date), 'dd/MM/yyyy', { locale: es })}
                        {' - '}
                        {objective.end_date && format(safeDate(objective.end_date), 'dd/MM/yyyy', { locale: es })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {objective.target_hours}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                        {(objective.completed_hours || 0).toFixed(1)}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${
                                progress >= 100 ? 'bg-green-500' :
                                progress >= 75 ? 'bg-blue-500' :
                                progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${OBJECTIVE_STATUS_COLORS[objective.status]}`}>
                          {OBJECTIVE_STATUS_LABELS[objective.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ObjectivesReport;
