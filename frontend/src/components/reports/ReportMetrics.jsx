/**
 * Componente de métricas principales del reporte
 * Muestra total de horas y promedio por día
 */

import Card from '../common/Card';

export const ReportMetrics = ({ reportData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500">Total de Horas</p>
          <p className="text-4xl font-bold text-primary-600 mt-2">
            {reportData.totalHours.toFixed(1)}h
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {reportData.totalEntries} registros
          </p>
        </div>
      </Card>

      <Card>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500">Promedio por Día</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">
            {reportData.byDay.length > 0 
              ? (reportData.totalHours / reportData.byDay.length).toFixed(1)
              : '0.0'
            }h
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {reportData.byDay.length} días trabajados
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ReportMetrics;
