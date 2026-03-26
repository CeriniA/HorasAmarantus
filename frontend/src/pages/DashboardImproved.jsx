/**
 * Dashboard Mejorado
 * Versión actualizada con todos los componentes nuevos integrados
 */

import { useMemo } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { useOrganizationalUnits } from '../hooks/useOrganizationalUnits';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { format, startOfWeek, startOfMonth, endOfWeek, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { USER_ROLES } from '../constants';
import { Clock, TrendingUp, Briefcase, Users } from 'lucide-react';

// Componentes nuevos
import { WeeklyTrendChart } from '../components/dashboard/WeeklyTrendChart';
import { MetricCardWithComparison } from '../components/dashboard/MetricCardWithComparison';
import { SmartAlerts } from '../components/dashboard/SmartAlerts';
import { ActivityHeatmap } from '../components/dashboard/ActivityHeatmap';
import { GoalTracker } from '../components/dashboard/GoalTracker';

// Utilidades
import { calculateMetricsWithComparison } from '../utils/periodComparison';
import { evaluateAlerts } from '../utils/alertRules';

export const DashboardImproved = () => {
  const { user } = useAuthContext();
  const { timeEntries, getTotalHours, getEntriesByDateRange } = useTimeEntries(user?.id);
  const { units } = useOrganizationalUnits();

  // Calcular métricas
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const todayEntries = timeEntries.filter(e => {
    const entryDate = new Date(e.start_time);
    return entryDate.toDateString() === today.toDateString();
  });

  const weekEntries = getEntriesByDateRange(weekStart, weekEnd);
  const monthEntries = getEntriesByDateRange(monthStart, monthEnd);

  const todayHours = getTotalHours(todayEntries);
  const weekHours = getTotalHours(weekEntries);
  const monthHours = getTotalHours(monthEntries);

  // Calcular comparaciones con períodos anteriores
  const weekComparison = useMemo(() => 
    calculateMetricsWithComparison(timeEntries, weekStart, weekEnd),
    [timeEntries, weekStart, weekEnd]
  );

  const monthComparison = useMemo(() => 
    calculateMetricsWithComparison(timeEntries, monthStart, monthEnd),
    [timeEntries, monthStart, monthEnd]
  );

  // Evaluar alertas inteligentes
  const alerts = useMemo(() => 
    evaluateAlerts(timeEntries, user),
    [timeEntries, user]
  );

  // Últimas entradas
  const recentEntries = timeEntries.slice(0, 5);

  // Horas por unidad organizacional (top 5)
  const hoursByUnit = useMemo(() => {
    const byUnit = {};
    timeEntries.forEach(entry => {
      if (entry.organizational_unit_id) {
        const unitId = entry.organizational_unit_id;
        if (!byUnit[unitId]) {
          byUnit[unitId] = {
            hours: 0,
            count: 0,
            unit: units.find(u => u.id === unitId)
          };
        }
        const start = new Date(entry.start_time);
        const end = new Date(entry.end_time);
        const hours = (end - start) / (1000 * 60 * 60);
        byUnit[unitId].hours += hours;
        byUnit[unitId].count += 1;
      }
    });
    return byUnit;
  }, [timeEntries, units]);

  const topUnits = Object.values(hoursByUnit)
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {format(today, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {/* Alertas Inteligentes */}
      {alerts.length > 0 && (
        <SmartAlerts alerts={alerts} />
      )}

      {/* Métricas principales con comparación */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCardWithComparison
          title={user?.role === USER_ROLES.OPERARIO ? 'Tus Horas Hoy' : 'Horas Hoy'}
          value={`${todayHours.toFixed(1)}h`}
          icon={Clock}
          color="blue"
          subtitle={`${todayEntries.length} registros`}
        />

        <MetricCardWithComparison
          title={user?.role === USER_ROLES.OPERARIO ? 'Tu Semana' : 'Esta Semana'}
          value={`${weekHours.toFixed(1)}h`}
          icon={TrendingUp}
          color="green"
          subtitle={`${weekEntries.length} registros`}
          comparison={{
            ...weekComparison.comparison,
            periodLabel: 'semana anterior'
          }}
        />

        <MetricCardWithComparison
          title={user?.role === USER_ROLES.OPERARIO ? 'Tu Mes' : 'Este Mes'}
          value={`${monthHours.toFixed(1)}h`}
          icon={Briefcase}
          color="purple"
          subtitle={`${monthEntries.length} registros`}
          comparison={{
            ...monthComparison.comparison,
            periodLabel: 'mes anterior'
          }}
        />
      </div>

      {/* Gráfico de Tendencia y Objetivo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeeklyTrendChart timeEntries={timeEntries} />
        </div>
        <div>
          <GoalTracker 
            timeEntries={timeEntries} 
            goalType="weekly"
            customGoal={user?.weeklyGoal || 40}
          />
        </div>
      </div>

      {/* Mapa de Calor */}
      <ActivityHeatmap timeEntries={timeEntries} />

      {/* Últimas entradas y Top áreas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas entradas */}
        <Card 
          title={user?.role === USER_ROLES.OPERARIO ? 'Tus Últimas Entradas' : 'Últimos Registros'} 
          subtitle={user?.role === USER_ROLES.OPERARIO ? 'Tus registros más recientes' : 'Registros más recientes del sistema'}
        >
          <div className="space-y-4">
            {recentEntries.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No hay registros aún
              </p>
            ) : (
              recentEntries.map((entry) => {
                const start = new Date(entry.start_time);
                const end = new Date(entry.end_time);
                const hours = (end - start) / (1000 * 60 * 60);
                
                return (
                  <div
                    key={entry.id || entry.client_id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {entry.organizational_units?.name || 'Sin unidad'}
                      </p>
                      {entry.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {entry.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {format(start, "d MMM, HH:mm", { locale: es })}
                        {' - '}
                        {format(end, "HH:mm")}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <span className="text-lg font-semibold text-gray-900">
                        {hours.toFixed(1)}h
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Top áreas */}
        <Card 
          title={user?.role === USER_ROLES.OPERARIO ? 'Tus Áreas Más Trabajadas' : 'Áreas Más Trabajadas'} 
          subtitle="Top 5 este mes"
        >
          <div className="space-y-4">
            {topUnits.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No hay datos suficientes
              </p>
            ) : (
              topUnits.map((item, index) => (
                <div key={item.unit?.id || index} className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-600">
                      {index + 1}
                    </span>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="font-medium text-gray-900">
                      {item.unit?.name || 'Sin nombre'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.count} registros
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <span className="text-lg font-semibold text-gray-900">
                      {item.hours.toFixed(1)}h
                    </span>
                    <p className="text-xs text-gray-500">
                      {((item.hours / monthHours) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Acceso rápido */}
      <Card title="Acceso Rápido">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            fullWidth
            onClick={() => window.location.href = '/time-entries'}
          >
            <Clock className="h-5 w-5 mr-2" />
            Registrar Horas
          </Button>
          
          {(user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPERADMIN) && (
            <>
              <Button
                variant="outline"
                fullWidth
                onClick={() => window.location.href = '/reports'}
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                Ver Reportes
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                onClick={() => window.location.href = '/organizational-units'}
              >
                <Briefcase className="h-5 w-5 mr-2" />
                Estructura
              </Button>
            </>
          )}
          
          {user?.role === USER_ROLES.ADMIN && (
            <Button
              variant="outline"
              fullWidth
              onClick={() => window.location.href = '/users'}
            >
              <Users className="h-5 w-5 mr-2" />
              Usuarios
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DashboardImproved;
