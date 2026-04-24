/**
 * Tabla de Horas por Usuario
 * Muestra TODOS los usuarios con sus horas trabajadas en el rango seleccionado
 * Ideal para cálculos de nómina/pagos
 */

import { Users, Download } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { safeDate } from '../../utils/dateHelpers';

export const UserHoursTable = ({ usersData, totalHours, startDate, endDate, onExport }) => {
  if (!usersData || usersData.length === 0) {
    return (
      <Card title="Horas por Usuario">
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>No hay datos para mostrar en el rango seleccionado</p>
        </div>
      </Card>
    );
  }

  const formattedStartDate = startDate ? format(safeDate(startDate), 'dd/MM/yyyy', { locale: es }) : '';
  const formattedEndDate = endDate ? format(safeDate(endDate), 'dd/MM/yyyy', { locale: es }) : '';

  return (
    <Card>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Horas por Usuario</h3>
          <p className="text-sm text-gray-500 mt-1">
            Período: {formattedStartDate} - {formattedEndDate}
          </p>
        </div>
        {onExport && (
          <Button onClick={onExport} variant="primary" size="sm" className="flex-shrink-0">
            <Download className="h-4 w-4 mr-2" />
            Exportar para Nómina
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registros
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Horas
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Promedio/Registro
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                % del Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usersData.map((user, index) => {
              const percentage = totalHours > 0 
                ? (user.hours / totalHours * 100).toFixed(1)
                : 0;
              const avgPerEntry = user.entries > 0
                ? (user.hours / user.entries).toFixed(2)
                : '0.00';

              return (
                <tr key={user.userId || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {user.entries}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                    {user.hours.toFixed(2)}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {avgPerEntry}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    <span className="font-medium text-primary-600">
                      {percentage}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr className="font-semibold">
              <td colSpan="3" className="px-6 py-4 text-sm text-gray-900">
                TOTAL ({usersData.length} {usersData.length === 1 ? 'usuario' : 'usuarios'})
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 text-right">
                {usersData.reduce((sum, u) => sum + u.entries, 0)}
              </td>
              <td className="px-6 py-4 text-sm text-primary-600 text-right">
                {totalHours.toFixed(2)}h
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 text-right">
                {usersData.length > 0
                  ? (totalHours / usersData.reduce((sum, u) => sum + u.entries, 0)).toFixed(2)
                  : '0.00'
                }h
              </td>
              <td className="px-6 py-4 text-sm text-primary-600 text-right">
                100%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Resumen adicional */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-blue-600 font-medium">Total Usuarios</p>
          <p className="text-2xl font-bold text-blue-900">{usersData.length}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-blue-600 font-medium">Total Horas</p>
          <p className="text-2xl font-bold text-blue-900">{totalHours.toFixed(2)}h</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-blue-600 font-medium">Promedio por Usuario</p>
          <p className="text-2xl font-bold text-blue-900">
            {usersData.length > 0 ? (totalHours / usersData.length).toFixed(2) : '0.00'}h
          </p>
        </div>
      </div>
    </Card>
  );
};

export default UserHoursTable;
