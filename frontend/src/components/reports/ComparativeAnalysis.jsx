/**
 * Análisis Comparativo de Períodos
 * Permite comparar múltiples períodos lado a lado
 */

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import Card from '../common/Card';
import Button from '../common/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export const ComparativeAnalysis = ({ timeEntries }) => {
  const [periods, setPeriods] = useState([
    {
      id: 1,
      name: 'Período 1',
      month: format(new Date(), 'yyyy-MM'),
      color: COLORS[0]
    },
    {
      id: 2,
      name: 'Período 2',
      month: format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM'),
      color: COLORS[1]
    }
  ]);

  const [comparisonData, setComparisonData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);

  useEffect(() => {
    calculateComparison();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periods, timeEntries]);

  const calculateComparison = () => {
    const categories = ['Total Horas', 'Registros', 'Promedio/Día', 'Días Trabajados'];
    const comparison = categories.map(category => {
      const dataPoint = { category };
      
      periods.forEach(period => {
        const [year, month] = period.month.split('-');
        const start = startOfMonth(new Date(parseInt(year), parseInt(month) - 1));
        const end = endOfMonth(start);
        
        const periodEntries = timeEntries.filter(e => {
          const entryDate = new Date(e.start_time);
          return entryDate >= start && entryDate <= end;
        });
        
        const totalHours = periodEntries.reduce((sum, entry) => {
          const start = new Date(entry.start_time);
          const end = new Date(entry.end_time);
          return sum + (end - start) / (1000 * 60 * 60);
        }, 0);
        
        const daysWorked = new Set(
          periodEntries.map(e => new Date(e.start_time).toDateString())
        ).size;
        
        let value = 0;
        switch (category) {
          case 'Total Horas':
            value = parseFloat(totalHours.toFixed(1));
            break;
          case 'Registros':
            value = periodEntries.length;
            break;
          case 'Promedio/Día':
            value = daysWorked > 0 ? parseFloat((totalHours / daysWorked).toFixed(1)) : 0;
            break;
          case 'Días Trabajados':
            value = daysWorked;
            break;
          default:
            value = 0;
        }
        
        dataPoint[`period${period.id}`] = value;
      });
      
      return dataPoint;
    });
    
    setComparisonData(comparison);
    
    // Calcular resumen con cambios
    const summary = periods.map((period, index) => {
      const [year, month] = period.month.split('-');
      const start = startOfMonth(new Date(parseInt(year), parseInt(month) - 1));
      const end = endOfMonth(start);
      
      const periodEntries = timeEntries.filter(e => {
        const entryDate = new Date(e.start_time);
        return entryDate >= start && entryDate <= end;
      });
      
      const totalHours = periodEntries.reduce((sum, entry) => {
        const start = new Date(entry.start_time);
        const end = new Date(entry.end_time);
        return sum + (end - start) / (1000 * 60 * 60);
      }, 0);
      
      // Calcular cambio vs período anterior
      let change = null;
      if (index > 0) {
        const prevPeriod = summary[index - 1];
        if (prevPeriod && prevPeriod.totalHours > 0) {
          change = ((totalHours - prevPeriod.totalHours) / prevPeriod.totalHours) * 100;
        }
      }
      
      return {
        ...period,
        totalHours,
        entries: periodEntries.length,
        change
      };
    });
    
    setSummaryData(summary);
  };

  const addPeriod = () => {
    if (periods.length >= 5) return; // Máximo 5 períodos
    
    const newId = Math.max(...periods.map(p => p.id)) + 1;
    setPeriods([...periods, {
      id: newId,
      name: `Período ${newId}`,
      month: format(new Date(new Date().setMonth(new Date().getMonth() - newId)), 'yyyy-MM'),
      color: COLORS[newId - 1] || COLORS[0]
    }]);
  };

  const removePeriod = (id) => {
    if (periods.length <= 2) return; // Mínimo 2 períodos
    setPeriods(periods.filter(p => p.id !== id));
  };

  const updatePeriod = (id, month) => {
    setPeriods(periods.map(p => 
      p.id === id ? { ...p, month } : p
    ));
  };

  return (
    <Card title="Análisis Comparativo de Períodos">
      {/* Selector de períodos */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">Períodos a Comparar</h4>
          <Button
            size="sm"
            onClick={addPeriod}
            disabled={periods.length >= 5}
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar Período
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {periods.map(period => (
            <div key={period.id} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: period.color }}
              />
              <input
                type="month"
                value={period.month}
                onChange={(e) => updatePeriod(period.id, e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              {periods.length > 2 && (
                <button
                  onClick={() => removePeriod(period.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Resumen de cambios */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryData.map(period => (
          <div key={period.id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {format(new Date(period.month + '-01'), 'MMMM yyyy', { locale: es })}
              </span>
              {period.change !== null && (
                <div className={`flex items-center text-sm font-semibold ${
                  period.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {period.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(period.change).toFixed(1)}%
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {period.totalHours.toFixed(0)}h
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {period.entries} registros
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico comparativo */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">Comparación Visual</h4>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            {periods.map(period => (
              <Bar
                key={period.id}
                dataKey={`period${period.id}`}
                name={format(new Date(period.month + '-01'), 'MMM yyyy', { locale: es })}
                fill={period.color}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla de diferencias */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Tabla Comparativa</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Métrica
                </th>
                {periods.map(period => (
                  <th key={period.id} className="text-right py-3 px-4 font-semibold text-gray-700">
                    {format(new Date(period.month + '-01'), 'MMM yyyy', { locale: es })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {row.category}
                  </td>
                  {periods.map(period => (
                    <td key={period.id} className="text-right py-3 px-4 text-gray-700">
                      {row[`period${period.id}`]}
                      {row.category === 'Total Horas' && 'h'}
                      {row.category === 'Promedio/Día' && 'h'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

export default ComparativeAnalysis;
