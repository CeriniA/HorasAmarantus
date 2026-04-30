/**
 * Utilidades para exportación de reportes
 * Funciones de exportación extraídas de Reports.jsx
 */

import { format } from 'date-fns';
import { safeDate, calculateHours, parseLocalTime } from './dateHelpers';

/**
 * Sanitiza valor para prevenir CSV Injection
 * Previene ejecución de fórmulas maliciosas en Excel/Sheets
 * @param {string} value - Valor a sanitizar
 * @returns {string} - Valor sanitizado
 */
const sanitizeCSV = (value) => {
  if (!value) return '';
  
  const str = String(value);
  
  // Si empieza con caracteres peligrosos (=, +, -, @, tab, return), agregar comilla simple
  // Esto previene que Excel/Sheets interpreten el valor como fórmula
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  
  return str;
};

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
    const startDate = safeDate(entry.start_time);
    const startTime = parseLocalTime(entry.start_time);
    const endTime = entry.end_time ? parseLocalTime(entry.end_time) : null;
    
    return [
      format(startDate, 'yyyy-MM-dd'),
      sanitizeCSV(entry.users?.name || 'Desconocido'),
      sanitizeCSV(entry.organizational_units?.name || 'Sin unidad'),
      sanitizeCSV(entry.organizational_units?.type || ''),
      sanitizeCSV(entry.description || ''), // CRÍTICO: Previene CSV Injection
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
