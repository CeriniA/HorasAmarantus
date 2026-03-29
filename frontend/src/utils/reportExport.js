/**
 * Utilidades para exportación de reportes
 * Funciones de exportación extraídas de Reports.jsx
 */

import { format } from 'date-fns';
import { safeDate, calculateHours } from './dateHelpers';

/**
 * Exporta registros a CSV
 * @param {Array} entries - Array de time entries filtrados
 * @param {string} startDate - Fecha de inicio
 * @param {string} endDate - Fecha de fin
 */
export const exportToCSV = (entries, startDate, endDate) => {
  // Verificar que estamos en el navegador
  if (typeof window === 'undefined') return;
  
  // Crear CSV con TODOS los registros individuales
  const headers = ['Fecha', 'Usuario', 'Unidad', 'Tipo Unidad', 'Descripción', 'Hora Inicio', 'Hora Fin', 'Total Horas'];
  
  const rows = entries.map(entry => {
    const startTime = safeDate(entry.start_time);
    const endTime = entry.end_time ? safeDate(entry.end_time) : null;
    
    return [
      format(startTime, 'yyyy-MM-dd'),
      entry.users?.name || 'Desconocido',
      entry.organizational_units?.name || 'Sin unidad',
      entry.organizational_units?.type || '',
      (entry.description || '').replace(/,/g, ';'), // Reemplazar comas para no romper el CSV
      format(startTime, 'HH:mm:ss'),
      endTime ? format(endTime, 'HH:mm:ss') : '',
      entry.total_hours?.toFixed(2) || '0.00'
    ];
  });

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')) // Encerrar en comillas
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte-horas-detallado-${startDate}-${endDate}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};
