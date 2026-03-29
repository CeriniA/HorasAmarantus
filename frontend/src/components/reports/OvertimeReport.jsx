/**
 * Reporte de Horas Extras
 * Detecta y analiza horas extras, trabajo en fines de semana y jornadas extendidas
 */

import { useMemo } from 'react';
import { format, isWeekend, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import Card from '../common/Card';
import { AlertTriangle, Calendar, Clock, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { safeDate, calculateHours, extractDate } from '../../utils/dateHelpers';

const STANDARD_DAILY_HOURS = 8;
const STANDARD_WEEKLY_HOURS = 40;

export const OvertimeReport = ({ timeEntries }) => {
  const overtimeAnalysis = useMemo(() => {
    if (!timeEntries.length) return null;

    // Agrupar por día y usuario
    const dailyHours = {};
    const weekendWork = [];
    const longDays = [];

    timeEntries.forEach(entry => {
      // Usar helpers para evitar problemas de zona horaria
      const hours = calculateHours(entry.start_time, entry.end_time);
      const dateKey = extractDate(entry.start_time);
      const start = safeDate(entry.start_time);
      const userId = entry.user_id;
      const userStandardHours = entry.users?.standard_daily_hours || STANDARD_DAILY_HOURS;
      const dayKey = `${dateKey}_${userId}`;

      if (!dailyHours[dayKey]) {
        dailyHours[dayKey] = {
          date: dateKey,
          userId,
          userName: entry.users?.name || 'Usuario',
          standardHours: userStandardHours,
          hours: 0,
          entries: [],
          isWeekend: isWeekend(start)
        };
      }

      dailyHours[dayKey].hours += hours;
      dailyHours[dayKey].entries.push(entry);
    });

    // Detectar días con horas extras
    Object.values(dailyHours).forEach(day => {
      if (day.hours > day.standardHours) {
        const overtime = day.hours - day.standardHours;
        longDays.push({
          ...day,
          overtime: parseFloat(overtime.toFixed(2)),
          totalHours: parseFloat(day.hours.toFixed(2))
        });
      }

      if (day.isWeekend && day.hours > 0) {
        weekendWork.push({
          ...day,
          totalHours: parseFloat(day.hours.toFixed(2))
        });
      }
    });

    // Agrupar por semana
    const weeklyHours = {};
    Object.values(dailyHours).forEach((day) => {
      // Usar safeDate para crear Date object desde fecha YYYY-MM-DD
      const date = new Date(day.date + 'T12:00:00'); // OK: construir fecha desde YYYY-MM-DD
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekKey = format(weekStart, 'yyyy-MM-dd');

      if (!weeklyHours[weekKey]) {
        weeklyHours[weekKey] = {
          weekStart: weekKey,
          hours: 0,
          days: []
        };
      }

      weeklyHours[weekKey].hours += day.hours;
      weeklyHours[weekKey].days.push(day);
    });

    // Detectar semanas con horas extras
    const overtimeWeeks = Object.values(weeklyHours)
      .filter(week => week.hours > STANDARD_WEEKLY_HOURS)
      .map(week => ({
        ...week,
        overtime: parseFloat((week.hours - STANDARD_WEEKLY_HOURS).toFixed(2)),
        totalHours: parseFloat(week.hours.toFixed(2))
      }))
      .sort((a, b) => b.overtime - a.overtime);

    // Calcular totales
    const totalOvertimeHours = longDays.reduce((sum, day) => sum + day.overtime, 0);
    const totalWeekendHours = weekendWork.reduce((sum, day) => sum + day.totalHours, 0);
    const totalWeeklyOvertime = overtimeWeeks.reduce((sum, week) => sum + week.overtime, 0);

    // Usuarios con más horas extras
    const userOvertime = {};
    longDays.forEach(day => {
      day.entries.forEach(entry => {
        const userId = entry.user_id;
        const userName = entry.users?.name || 'Usuario';
        
        if (!userOvertime[userId]) {
          userOvertime[userId] = {
            userId,
            userName,
            overtimeHours: 0,
            days: 0
          };
        }
        
        const start = new Date(entry.start_time);
        const end = new Date(entry.end_time);
        const hours = (end - start) / (1000 * 60 * 60);
        userOvertime[userId].overtimeHours += hours;
        userOvertime[userId].days++;
      });
    });

    const topOvertimeUsers = Object.values(userOvertime)
      .sort((a, b) => b.overtimeHours - a.overtimeHours)
      .slice(0, 10);

    return {
      longDays: longDays.sort((a, b) => b.overtime - a.overtime),
      weekendWork: weekendWork.sort((a, b) => new Date(b.date) - new Date(a.date)),
      overtimeWeeks,
      totalOvertimeHours: parseFloat(totalOvertimeHours.toFixed(2)),
      totalWeekendHours: parseFloat(totalWeekendHours.toFixed(2)),
      totalWeeklyOvertime: parseFloat(totalWeeklyOvertime.toFixed(2)),
      topOvertimeUsers
    };
  }, [timeEntries]);

  if (!overtimeAnalysis) {
    return (
      <Card title="Reporte de Horas Extras">
        <div className="text-center py-8 text-gray-500">
          No hay datos para analizar
        </div>
      </Card>
    );
  }

  const chartData = overtimeAnalysis.longDays.slice(0, 10).map(day => ({
    fecha: format(new Date(day.date), 'dd/MM', { locale: es }),
    normal: STANDARD_DAILY_HOURS,
    extras: parseFloat(day.overtime.toFixed(1))
  }));

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Horas Extras Diarias</p>
              <p className="text-2xl font-bold text-gray-900">
                {overtimeAnalysis.totalOvertimeHours.toFixed(0)}h
              </p>
              <p className="text-xs text-gray-500">{overtimeAnalysis.longDays.length} días</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-orange-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Trabajo Fin de Semana</p>
              <p className="text-2xl font-bold text-gray-900">
                {overtimeAnalysis.totalWeekendHours.toFixed(0)}h
              </p>
              <p className="text-xs text-gray-500">{overtimeAnalysis.weekendWork.length} días</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Semanas Sobrecargadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {overtimeAnalysis.overtimeWeeks.length}
              </p>
              <p className="text-xs text-gray-500">&gt;{STANDARD_WEEKLY_HOURS}h semanales</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Extras</p>
              <p className="text-2xl font-bold text-gray-900">
                {(overtimeAnalysis.totalOvertimeHours + overtimeAnalysis.totalWeekendHours).toFixed(0)}h
              </p>
              <p className="text-xs text-gray-500">Todas las categorías</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráfico */}
      {chartData.length > 0 && (
        <Card title="Top 10 Días con Más Horas Extras">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="normal" stackId="a" fill="#10b981" name="Horas Normales" />
              <Bar dataKey="extras" stackId="a" fill="#ef4444" name="Horas Extras" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Días con Horas Extras */}
      {overtimeAnalysis.longDays.length > 0 && (
        <Card title={`Días con más de ${STANDARD_DAILY_HOURS} horas`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Horas Totales</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Horas Extras</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Registros</th>
                </tr>
              </thead>
              <tbody>
                {overtimeAnalysis.longDays.slice(0, 15).map(day => (
                  <tr key={day.date} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {format(new Date(day.date), "EEEE, d 'de' MMMM", { locale: es })}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-700">
                      {day.totalHours}h
                    </td>
                    <td className="text-right py-3 px-4 font-semibold text-red-600">
                      +{day.overtime}h
                    </td>
                    <td className="text-right py-3 px-4 text-gray-700">
                      {day.entries.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Trabajo en Fin de Semana */}
      {overtimeAnalysis.weekendWork.length > 0 && (
        <Card title="Trabajo en Fines de Semana">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Horas</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Registros</th>
                </tr>
              </thead>
              <tbody>
                {overtimeAnalysis.weekendWork.slice(0, 10).map(day => (
                  <tr key={day.date} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {format(new Date(day.date), "EEEE, d 'de' MMMM", { locale: es })}
                    </td>
                    <td className="text-right py-3 px-4 font-semibold text-orange-600">
                      {day.totalHours}h
                    </td>
                    <td className="text-right py-3 px-4 text-gray-700">
                      {day.entries.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Top Usuarios con Horas Extras */}
      {overtimeAnalysis.topOvertimeUsers.length > 0 && (
        <Card title="Usuarios con Más Horas Extras">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuario</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Horas Extras</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Días</th>
                </tr>
              </thead>
              <tbody>
                {overtimeAnalysis.topOvertimeUsers.map((user, index) => (
                  <tr key={user.userId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{user.userName}</td>
                    <td className="text-right py-3 px-4 font-semibold text-red-600">
                      {user.overtimeHours.toFixed(1)}h
                    </td>
                    <td className="text-right py-3 px-4 text-gray-700">
                      {user.days}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default OvertimeReport;
