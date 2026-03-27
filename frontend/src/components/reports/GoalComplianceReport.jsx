/**
 * Reporte de Cumplimiento de Objetivos
 * Muestra el progreso de cada usuario hacia sus objetivos semanales/mensuales
 */

import { useMemo, useState } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import Card from '../common/Card';
import { Target, TrendingUp, Award, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const DEFAULT_WEEKLY_GOAL = 40;
const DEFAULT_MONTHLY_GOAL = 160;

export const GoalComplianceReport = ({ timeEntries }) => {
  const [period, setPeriod] = useState('weekly'); // 'weekly' o 'monthly'

  const complianceData = useMemo(() => {
    if (!timeEntries.length) return null;

    const now = new Date();
    const periodStart = period === 'weekly' 
      ? startOfWeek(now, { weekStartsOn: 1 })
      : startOfMonth(now);
    const periodEnd = period === 'weekly'
      ? endOfWeek(now, { weekStartsOn: 1 })
      : endOfMonth(now);

    // Agrupar por usuario
    const userStats = {};

    timeEntries.forEach(entry => {
      const entryDate = new Date(entry.start_time);
      
      // Solo contar entradas del período actual
      if (entryDate >= periodStart && entryDate <= periodEnd) {
        const userId = entry.user_id;
        const userName = entry.users?.name || 'Usuario Desconocido';
        
        if (!userStats[userId]) {
          userStats[userId] = {
            userId,
            userName,
            hours: 0,
            entries: 0
          };
        }

        const start = new Date(entry.start_time);
        const end = new Date(entry.end_time);
        const hours = (end - start) / (1000 * 60 * 60);
        
        userStats[userId].hours += hours;
        userStats[userId].entries++;
      }
    });

    // Calcular cumplimiento
    const compliance = Object.values(userStats).map(user => {
      // Buscar objetivo del usuario (cuando esté en DB)
      const userGoal = period === 'weekly' 
        ? (user.weekly_goal || DEFAULT_WEEKLY_GOAL)
        : (user.monthly_goal || DEFAULT_MONTHLY_GOAL);

      const actualHours = parseFloat(user.hours.toFixed(1));
      const percentage = (actualHours / userGoal) * 100;
      const difference = actualHours - userGoal;

      // Determinar estado (semáforo)
      let status = 'green';
      if (percentage < 80) status = 'red';
      else if (percentage < 95) status = 'yellow';

      return {
        ...user,
        goal: userGoal,
        actualHours,
        percentage: parseFloat(percentage.toFixed(1)),
        difference: parseFloat(difference.toFixed(1)),
        status
      };
    });

    // Ordenar por porcentaje descendente
    compliance.sort((a, b) => b.percentage - a.percentage);

    // Calcular estadísticas generales
    const totalUsers = compliance.length;
    const usersOnTrack = compliance.filter(u => u.status === 'green').length;
    const usersAtRisk = compliance.filter(u => u.status === 'yellow').length;
    const usersBehind = compliance.filter(u => u.status === 'red').length;
    const avgCompliance = compliance.reduce((sum, u) => sum + u.percentage, 0) / totalUsers;

    return {
      compliance,
      totalUsers,
      usersOnTrack,
      usersAtRisk,
      usersBehind,
      avgCompliance: parseFloat(avgCompliance.toFixed(1)),
      periodStart,
      periodEnd
    };
  }, [timeEntries, period]);

  if (!complianceData) {
    return (
      <Card title="Cumplimiento de Objetivos">
        <div className="text-center py-8 text-gray-500">
          No hay datos para el período seleccionado
        </div>
      </Card>
    );
  }

  const chartData = complianceData.compliance.slice(0, 15).map(user => ({
    name: user.userName.length > 15 ? user.userName.substring(0, 15) + '...' : user.userName,
    objetivo: user.goal,
    real: user.actualHours,
    porcentaje: user.percentage
  }));

  const getStatusColor = (status) => {
    switch (status) {
      case 'green': return '#10b981';
      case 'yellow': return '#f59e0b';
      case 'red': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector de Período */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Período: {period === 'weekly' ? 'Semanal' : 'Mensual'}
            </h3>
            <p className="text-sm text-gray-500">
              {format(complianceData.periodStart, "d 'de' MMMM", { locale: es })} - {' '}
              {format(complianceData.periodEnd, "d 'de' MMMM yyyy", { locale: es })}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-4 py-2 rounded-lg font-medium ${
                period === 'weekly'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-2 rounded-lg font-medium ${
                period === 'monthly'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Mensual
            </button>
          </div>
        </div>
      </Card>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">En Objetivo</p>
              <p className="text-2xl font-bold text-gray-900">{complianceData.usersOnTrack}</p>
              <p className="text-xs text-gray-500">
                {((complianceData.usersOnTrack / complianceData.totalUsers) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">En Riesgo</p>
              <p className="text-2xl font-bold text-gray-900">{complianceData.usersAtRisk}</p>
              <p className="text-xs text-gray-500">80-95% del objetivo</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rezagados</p>
              <p className="text-2xl font-bold text-gray-900">{complianceData.usersBehind}</p>
              <p className="text-xs text-gray-500">&lt;80% del objetivo</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                {complianceData.avgCompliance.toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500">De cumplimiento</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráfico de Barras */}
      <Card title="Top 15 Usuarios - Objetivo vs Real">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="objetivo" fill="#94a3b8" name="Objetivo" />
            <Bar dataKey="real" name="Real">
              {chartData.map((entry, index) => {
                const user = complianceData.compliance[index];
                return <Cell key={`cell-${index}`} fill={getStatusColor(user.status)} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Ranking Completo */}
      <Card title="Ranking de Cumplimiento">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuario</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Objetivo</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Real</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Diferencia</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">% Cumplimiento</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody>
              {complianceData.compliance.map((user, index) => (
                <tr key={user.userId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{user.userName}</td>
                  <td className="text-right py-3 px-4 text-gray-700">{user.goal}h</td>
                  <td className="text-right py-3 px-4 font-semibold text-gray-900">
                    {user.actualHours}h
                  </td>
                  <td className={`text-right py-3 px-4 font-semibold ${
                    user.difference >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {user.difference >= 0 ? '+' : ''}{user.difference}h
                  </td>
                  <td className="text-right py-3 px-4 font-bold text-gray-900">
                    {user.percentage}%
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'green' 
                        ? 'bg-green-100 text-green-800'
                        : user.status === 'yellow'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'green' && '✓ En objetivo'}
                      {user.status === 'yellow' && '⚠ En riesgo'}
                      {user.status === 'red' && '✗ Rezagado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="🏆 Top 5 Mejores">
          <div className="space-y-3">
            {complianceData.compliance.slice(0, 5).map((user, index) => (
              <div key={user.userId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{user.userName}</p>
                    <p className="text-sm text-gray-600">{user.actualHours}h de {user.goal}h</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{user.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="⚠️ Necesitan Atención">
          <div className="space-y-3">
            {complianceData.compliance
              .filter(u => u.status === 'red' || u.status === 'yellow')
              .slice(0, 5)
              .map((user, index) => (
                <div key={user.userId} className={`flex items-center justify-between p-3 rounded-lg ${
                  user.status === 'red' ? 'bg-red-50' : 'bg-yellow-50'
                }`}>
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 w-8 h-8 text-white rounded-full flex items-center justify-center font-bold ${
                      user.status === 'red' ? 'bg-red-600' : 'bg-yellow-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{user.userName}</p>
                      <p className="text-sm text-gray-600">{user.actualHours}h de {user.goal}h</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      user.status === 'red' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {user.percentage}%
                    </p>
                  </div>
                </div>
              ))}
            {complianceData.compliance.filter(u => u.status === 'red' || u.status === 'yellow').length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <Award className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>¡Todos están en objetivo! 🎉</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GoalComplianceReport;
