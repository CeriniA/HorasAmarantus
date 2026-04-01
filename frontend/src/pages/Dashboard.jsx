import { useMemo } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { safeDate, safeNumber } from '../utils/dateHelpers';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { useOrganizationalUnits } from '../hooks/useOrganizationalUnits';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { format, startOfWeek, startOfMonth, endOfWeek, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { isAdminOrSuperadmin, isAdmin, isOperario } from '../utils/roleHelpers';
import { Clock, TrendingUp, Briefcase, Users } from 'lucide-react';

// Componentes nuevos
import { WeeklyTrendChart } from '../components/dashboard/WeeklyTrendChart';
import { SmartAlerts } from '../components/dashboard/SmartAlerts';
import { ActivityHeatmap } from '../components/dashboard/ActivityHeatmap';
import { GoalTracker } from '../components/dashboard/GoalTracker';
import { WeeklyComparison } from '../components/dashboard/WeeklyComparison';
import { GoalHistory } from '../components/dashboard/GoalHistory';

// Utilidades
import { evaluateAlerts } from '../utils/alertRules';

export const Dashboard = () => {
  const { user } = useAuthContext();
  const { timeEntries: allTimeEntries, getTotalHours, getEntriesByDateRange } = useTimeEntries(user?.id);
  const { units } = useOrganizationalUnits();

  // Filtrar solo los registros del usuario actual (dashboard es personal)
  const timeEntries = useMemo(() => {
    return allTimeEntries.filter(entry => entry.user_id === user?.id);
  }, [allTimeEntries, user?.id]);

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

  const weekEntries = getEntriesByDateRange(weekStart, weekEnd).filter(e => e.user_id === user?.id);
  const monthEntries = getEntriesByDateRange(monthStart, monthEnd).filter(e => e.user_id === user?.id);

  const todayHours = getTotalHours(todayEntries);
  const weekHours = getTotalHours(weekEntries);
  const monthHours = getTotalHours(monthEntries);

  // Últimas entradas
  const recentEntries = timeEntries.slice(0, 5);

  // Horas por unidad organizacional (top 5)
  const hoursByUnit = {};
  timeEntries.forEach(entry => {
    if (entry.organizational_unit_id) {
      const unitId = entry.organizational_unit_id;
      if (!hoursByUnit[unitId]) {
        hoursByUnit[unitId] = {
          hours: 0,
          count: 0,
          unit: units.find(u => u.id === unitId)
        };
      }
      hoursByUnit[unitId].hours += entry.total_hours || 0;
      hoursByUnit[unitId].count += 1;
    }
  });

  const topUnits = Object.values(hoursByUnit)
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5);

  // Evaluar alertas inteligentes
  const alerts = useMemo(() => 
    evaluateAlerts(timeEntries, user),
    [timeEntries, user]
  );

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

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {isOperario(user) ? 'Tus Horas Hoy' : 'Horas Hoy'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {safeNumber(todayHours, 1)}h
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {todayEntries.length} registros
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {isOperario(user) ? 'Tu Semana' : 'Esta Semana'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {safeNumber(weekHours, 1)}h
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {weekEntries.length} registros
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 p-3 rounded-lg">
              <Briefcase className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {isOperario(user) ? 'Tu Mes' : 'Este Mes'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {safeNumber(monthHours, 1)}h
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {monthEntries.length} registros
              </p>
            </div>
          </div>
        </Card>
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
            customGoal={user?.weekly_goal || 40}
          />
        </div>
      </div>

      {/* Mapa de Calor */}
      <ActivityHeatmap timeEntries={timeEntries} />

      {/* Comparación Semanal e Historial */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyComparison timeEntries={timeEntries} user={user} />
        <GoalHistory timeEntries={timeEntries} weeklyGoal={user?.weekly_goal || 40} user={user} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas entradas */}
        <Card 
          title={isOperario(user) ? 'Tus Últimas Entradas' : 'Últimos Registros'} 
          subtitle={isOperario(user) ? 'Tus registros más recientes' : 'Registros más recientes del sistema'}
        >
          <div className="space-y-4">
            {recentEntries.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No hay registros aún
              </p>
            ) : (
              recentEntries.map((entry) => (
                <div
                  key={entry.id || entry.client_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
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
                      {format(safeDate(entry.start_time), "d MMM", { locale: es })}, {format(new Date(entry.start_time), "HH:mm")}
                      {entry.end_time && ` - ${format(new Date(entry.end_time), "HH:mm")}`}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <span className="text-lg font-semibold text-gray-900">
                      {entry.total_hours?.toFixed(1)}h
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Top áreas */}
        <Card 
          title={isOperario(user) ? 'Tus Áreas Más Trabajadas' : 'Áreas Más Trabajadas'} 
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
                  <div className="ml-4">
                    <span className="text-lg font-semibold text-gray-900">
                      {item.hours.toFixed(1)}h
                    </span>
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
          
          {isAdminOrSuperadmin(user) && (
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
          
          {isAdmin(user) && (
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

export default Dashboard;
