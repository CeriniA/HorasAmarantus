/**
 * Componente de gráficos del reporte
 */

import Card from '../common/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { safeDate } from '../../utils/dateHelpers';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ReportCharts = ({ reportData, user }) => {
  return (
    <>
      {/* Gráfico de horas por día */}
      <Card title="Horas por Día">
        {reportData.byDay.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            No hay datos para el rango seleccionado
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.byDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(safeDate(date), 'dd/MM')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => format(safeDate(date), "dd 'de' MMMM", { locale: es })}
                formatter={(value) => [`${value.toFixed(2)} horas`, 'Horas']}
              />
              <Legend />
              <Bar dataKey="hours" fill="#10b981" name="Horas" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top usuarios - Solo para admins */}
        {user?.role !== 'operario' && (
          <Card title="Top Usuarios" subtitle="Por horas trabajadas">
            {reportData.byUser.length === 0 ? (
              <p className="text-center text-gray-500 py-12">
                No hay datos
              </p>
            ) : (
              <div className="space-y-4">
                {reportData.byUser.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary-600">
                        {index + 1}
                      </span>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.entries} registros</p>
                    </div>
                    <div className="ml-4">
                      <span className="text-lg font-semibold text-gray-900">
                        {item.hours.toFixed(1)}h
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Distribución por unidad */}
        <Card title="Distribución por Unidad" className={user?.role === 'operario' ? 'lg:col-span-2' : ''}>
          {reportData.byUnit.length === 0 ? (
            <p className="text-center text-gray-500 py-12">
              No hay datos
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.byUnit}
                  dataKey="hours"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.hours.toFixed(1)}h`}
                >
                  {reportData.byUnit.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(2)} horas`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </>
  );
};

export default ReportCharts;
