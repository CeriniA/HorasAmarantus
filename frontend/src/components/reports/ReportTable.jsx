/**
 * Componente de tabla jerárquica del reporte
 */

import Card from '../common/Card';
import { getUnitStyle } from '../../constants';

export const ReportTable = ({ reportData, units, selectedUnit }) => {
  return (
    <Card title={
      selectedUnit !== 'all' 
        ? `Detalle Jerárquico - ${units.find(u => u.id === selectedUnit)?.name || 'Unidad'} (incluye procesos internos)`
        : "Detalle por Unidad Organizacional"
    }>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Unidad / Proceso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tipo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Registros
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Total Horas
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Promedio
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                % del Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.byUnit.map((item, index) => {
              const indentLevel = item.level || 0;
              const indentPx = indentLevel * 24;
              const percentage = reportData.totalHours > 0 
                ? (item.hours / reportData.totalHours * 100).toFixed(1)
                : 0;
              
              return (
                <tr key={index} className={`hover:bg-gray-50 ${indentLevel > 0 ? 'bg-gray-25' : ''}`}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div style={{ paddingLeft: `${indentPx}px` }} className="flex items-center">
                      {indentLevel > 0 && (
                        <span className="text-gray-400 mr-2">
                          {'└─ '.repeat(1)}
                        </span>
                      )}
                      <span className={indentLevel === 0 ? 'font-bold' : ''}>
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUnitStyle(item.type, 'badge')}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {item.entries}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                    {item.hours.toFixed(2)}h
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-right">
                    {(item.hours / item.entries).toFixed(2)}h
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-right">
                    <span className={`font-medium ${indentLevel === 0 ? 'text-primary-600' : ''}`}>
                      {percentage}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50 font-semibold">
            <tr>
              <td colSpan="2" className="px-6 py-4 text-sm text-gray-900">
                TOTAL
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 text-right">
                {reportData.totalEntries}
              </td>
              <td className="px-6 py-4 text-sm text-primary-600 text-right">
                {reportData.totalHours.toFixed(2)}h
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 text-right">
                {reportData.totalEntries > 0 
                  ? (reportData.totalHours / reportData.totalEntries).toFixed(2)
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
    </Card>
  );
};

export default ReportTable;
