/**
 * Reporte de Comparativa Mejorado
 * Soporta comparativas por: Usuarios, Áreas, Procesos, Top 10
 * Vista adaptativa según cantidad de elementos
 */

import { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Card from '../common/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, TrendingUp, Clock, Target, AlertCircle, Award } from 'lucide-react';
import { safeDate } from '../../utils/dateHelpers';
import { REPORT_CONSTANTS } from '../../constants';
import {
  getUsersComparison,
  getAreasComparison,
  getProcessesComparison,
  getTopUsersComparison
} from '../../utils/comparisonHelpers';

export const UserComparisonReport = ({ 
  timeEntries, 
  users, 
  selectedUsers, 
  selectedAreas,
  selectedProcesses,
  comparisonType,
  units 
}) => {

  // Calcular estadísticas según tipo de comparativa
  const comparisonData = useMemo(() => {
    if (!timeEntries.length) return [];

    switch (comparisonType) {
      case 'users':
        return getUsersComparison(users, selectedUsers, timeEntries);
      
      case 'areas':
        return getAreasComparison(units, selectedAreas, timeEntries);
      
      case 'processes':
        return getProcessesComparison(units, selectedProcesses, timeEntries);
      
      case 'top10':
        return getTopUsersComparison(users, timeEntries);
      
      default:
        return [];
    }
  }, [comparisonType, timeEntries, users, selectedUsers, selectedAreas, selectedProcesses, units]);

  // Determinar tipo de vista según cantidad
  const viewType = useMemo(() => {
    const count = comparisonData.length;
    if (count <= 5) return 'detailed'; // Gráficos completos
    if (count <= 10) return 'simple'; // Solo barras
    return 'table'; // Solo tabla
  }, [comparisonData]);

  // Datos para gráficos
  const barChartData = comparisonData.map(stat => ({
    name: stat.name.length > 15 ? stat.name.substring(0, 15) + '...' : stat.name,
    'Total Horas': stat.totalHours,
    'Promedio/Día': stat.avgPerDay,
    'Horas Extra': stat.overtimeHours
  }));

  // Evolución diaria (solo para vista detallada)
  const dailyEvolution = useMemo(() => {
    if (viewType !== 'detailed' || comparisonType !== 'users') return [];
    
    const allDays = new Set();
    const dataByEntity = {};

    comparisonData.forEach(entity => {
      const entityEntries = comparisonType === 'users'
        ? timeEntries.filter(e => e.user_id === entity.id)
        : timeEntries; // Para otros tipos necesitaríamos filtrar diferente
      
      dataByEntity[entity.name] = {};
      entityEntries.forEach(entry => {
        const day = format(safeDate(entry.start_time), 'yyyy-MM-dd');
        allDays.add(day);
        dataByEntity[entity.name][day] = (dataByEntity[entity.name][day] || 0) + (entry.total_hours || 0);
      });
    });

    const sortedDays = Array.from(allDays).sort();
    return sortedDays.map(day => {
      const dataPoint = {
        date: format(new Date(day), 'dd/MM', { locale: es }),
        fullDate: day
      };
      comparisonData.forEach(entity => {
        dataPoint[entity.name] = dataByEntity[entity.name][day] || 0;
      });
      return dataPoint;
    });
  }, [comparisonData, comparisonType, timeEntries, viewType]);

  // Validaciones
  if (comparisonType === 'users' && selectedUsers.length === 0) {
    return (
      <Card title="Comparativa">
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Selecciona al menos un usuario para comparar</p>
        </div>
      </Card>
    );
  }

  if (comparisonData.length === 0) {
    return (
      <Card title="Comparativa">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No hay datos para el tipo de comparativa seleccionado</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerta si hay más de 5 usuarios seleccionados */}
      {comparisonType === 'users' && selectedUsers.length > REPORT_CONSTANTS.MAX_USERS_COMPARISON && (
        <Card>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
              <p className="text-sm text-yellow-700">
                Mostrando solo los primeros {REPORT_CONSTANTS.MAX_USERS_COMPARISON} usuarios de {selectedUsers.length} seleccionados
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Métricas Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {comparisonType === 'top10' ? (
                <Award className="h-8 w-8 text-primary-600" />
              ) : (
                <Users className="h-8 w-8 text-primary-600" />
              )}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {comparisonType === 'areas' ? 'Áreas' : comparisonType === 'processes' ? 'Procesos' : 'Usuarios'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{comparisonData.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Horas</p>
              <p className="text-2xl font-bold text-gray-900">
                {comparisonData.reduce((sum, s) => sum + s.totalHours, 0).toFixed(1)}h
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Promedio General</p>
              <p className="text-2xl font-bold text-gray-900">
                {(comparisonData.reduce((sum, s) => sum + s.avgPerDay, 0) / comparisonData.length || 0).toFixed(1)}h/día
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cumplimiento Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                {(comparisonData.reduce((sum, s) => sum + s.goalCompliance, 0) / comparisonData.length || 0).toFixed(0)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabla Comparativa (siempre visible) */}
      <Card title="Comparativa Detallada">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {comparisonType === 'areas' ? 'Área' : comparisonType === 'processes' ? 'Proceso' : 'Usuario'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Horas</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Días Trabajados</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Promedio/Día</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Horas Extra</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cumplimiento Meta</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Registros</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {comparisonData.map((stat, index) => (
                <tr key={stat.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full mr-3" style={{ backgroundColor: REPORT_CONSTANTS.COMPARISON_COLORS[index % REPORT_CONSTANTS.COMPARISON_COLORS.length] }}></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{stat.name}</div>
                        {stat.email && <div className="text-xs text-gray-500">{stat.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-semibold text-gray-900">{stat.totalHours}h</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-900">{stat.daysWorked}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-medium ${stat.avgPerDay >= REPORT_CONSTANTS.DAILY_GOAL_HOURS ? 'text-green-600' : 'text-yellow-600'}`}>
                      {stat.avgPerDay}h
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-900">{stat.overtimeHours}h</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end">
                      <span className={`text-sm font-medium ${stat.goalCompliance >= 80 ? 'text-green-600' : stat.goalCompliance >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {stat.goalCompliance}%
                      </span>
                      {stat.goalCompliance >= 80 ? (
                        <span className="ml-2">✅</span>
                      ) : stat.goalCompliance >= 50 ? (
                        <span className="ml-2">⚠️</span>
                      ) : (
                        <AlertCircle className="ml-2 h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-500">{stat.entries}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Gráfico de Barras (vista simple y detallada) */}
      {(viewType === 'detailed' || viewType === 'simple') && (
        <Card title="Comparación de Horas">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Total Horas" fill="#10b981" />
              <Bar dataKey="Promedio/Día" fill="#3b82f6" />
              <Bar dataKey="Horas Extra" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Evolución Diaria (solo vista detallada) */}
      {viewType === 'detailed' && dailyEvolution.length > 0 && (
        <Card title="Evolución Diaria Comparada">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyEvolution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {comparisonData.map((entity, index) => (
                <Line
                  key={entity.id || index}
                  type="monotone"
                  dataKey={entity.name}
                  stroke={REPORT_CONSTANTS.COMPARISON_COLORS[index % REPORT_CONSTANTS.COMPARISON_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
};

export default UserComparisonReport;
