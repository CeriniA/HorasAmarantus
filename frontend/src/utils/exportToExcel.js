/**
 * Exportación a Excel Mejorada
 * Genera archivo Excel con múltiples hojas y formato profesional
 * 
 * Instalación requerida:
 * npm install xlsx
 */

import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Exporta datos a Excel con múltiples hojas
 */
export const exportToExcel = (data, filename = 'reporte_horas') => {
  const wb = XLSX.utils.book_new();

  // === HOJA 1: RESUMEN EJECUTIVO ===
  const summaryData = [
    ['REPORTE DE HORAS TRABAJADAS'],
    [''],
    ['Generado:', format(new Date(), "dd/MM/yyyy HH:mm")],
    ['Período:', `${data.startDate} - ${data.endDate}`],
    [''],
    ['RESUMEN GENERAL'],
    ['Total de Horas:', data.totalHours.toFixed(2)],
    ['Total de Registros:', data.totalEntries],
    ['Promedio por Día:', data.avgPerDay?.toFixed(2) || '0'],
    ['Días Trabajados:', data.daysWorked || 0],
    [''],
    ['DISTRIBUCIÓN'],
    ['Empleados Activos:', data.byUser?.length || 0],
    ['Unidades Trabajadas:', data.byUnit?.length || 0],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Estilos para el resumen
  ws1['!cols'] = [{ wch: 25 }, { wch: 20 }];
  
  XLSX.utils.book_append_sheet(wb, ws1, 'Resumen');

  // === HOJA 2: POR EMPLEADO ===
  if (data.byUser && data.byUser.length > 0) {
    const employeeData = data.byUser.map(u => ({
      'Empleado': u.name || u.user_name,
      'Total Horas': parseFloat(u.hours.toFixed(2)),
      'Registros': u.entries,
      'Promedio/Día': data.daysWorked > 0 ? parseFloat((u.hours / data.daysWorked).toFixed(2)) : 0,
      '% del Total': parseFloat(((u.hours / data.totalHours) * 100).toFixed(1))
    }));

    const ws2 = XLSX.utils.json_to_sheet(employeeData);
    ws2['!cols'] = [
      { wch: 30 }, // Empleado
      { wch: 15 }, // Total Horas
      { wch: 12 }, // Registros
      { wch: 15 }, // Promedio/Día
      { wch: 12 }  // % del Total
    ];
    
    XLSX.utils.book_append_sheet(wb, ws2, 'Por Empleado');
  }

  // === HOJA 3: POR UNIDAD ORGANIZACIONAL ===
  if (data.byUnit && data.byUnit.length > 0) {
    const unitData = data.byUnit.map(u => ({
      'Unidad': u.name,
      'Total Horas': parseFloat(u.hours.toFixed(2)),
      'Registros': u.entries,
      '% del Total': parseFloat(((u.hours / data.totalHours) * 100).toFixed(1)),
      'Promedio por Registro': u.entries > 0 ? parseFloat((u.hours / u.entries).toFixed(2)) : 0
    }));

    const ws3 = XLSX.utils.json_to_sheet(unitData);
    ws3['!cols'] = [
      { wch: 35 }, // Unidad
      { wch: 15 }, // Total Horas
      { wch: 12 }, // Registros
      { wch: 12 }, // % del Total
      { wch: 20 }  // Promedio por Registro
    ];
    
    XLSX.utils.book_append_sheet(wb, ws3, 'Por Unidad');
  }

  // === HOJA 4: POR DÍA ===
  if (data.byDay && data.byDay.length > 0) {
    const dailyData = data.byDay.map(d => ({
      'Fecha': format(new Date(d.date), 'dd/MM/yyyy', { locale: es }),
      'Día': format(new Date(d.date), 'EEEE', { locale: es }),
      'Horas': parseFloat(d.hours.toFixed(2)),
      'Registros': d.entries || 0
    }));

    const ws4 = XLSX.utils.json_to_sheet(dailyData);
    ws4['!cols'] = [
      { wch: 15 }, // Fecha
      { wch: 15 }, // Día
      { wch: 12 }, // Horas
      { wch: 12 }  // Registros
    ];
    
    XLSX.utils.book_append_sheet(wb, ws4, 'Por Día');
  }

  // === HOJA 5: DETALLE COMPLETO ===
  if (data.entries && data.entries.length > 0) {
    const detailData = data.entries.map(e => {
      const start = new Date(e.start_time);
      const end = new Date(e.end_time);
      const hours = (end - start) / (1000 * 60 * 60);
      
      return {
        'Fecha': format(start, 'dd/MM/yyyy'),
        'Día': format(start, 'EEEE', { locale: es }),
        'Empleado': e.user_name || e.users?.name || 'N/A',
        'Unidad': e.unit_name || e.organizational_units?.name || 'N/A',
        'Hora Inicio': format(start, 'HH:mm'),
        'Hora Fin': format(end, 'HH:mm'),
        'Horas': parseFloat(hours.toFixed(2)),
        'Descripción': e.description || ''
      };
    });

    const ws5 = XLSX.utils.json_to_sheet(detailData);
    ws5['!cols'] = [
      { wch: 12 }, // Fecha
      { wch: 12 }, // Día
      { wch: 25 }, // Empleado
      { wch: 30 }, // Unidad
      { wch: 12 }, // Hora Inicio
      { wch: 12 }, // Hora Fin
      { wch: 10 }, // Horas
      { wch: 40 }  // Descripción
    ];
    
    XLSX.utils.book_append_sheet(wb, ws5, 'Detalle Completo');
  }

  // Generar y descargar archivo
  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`);
};

/**
 * Exporta solo resumen básico (versión ligera)
 */
export const exportToExcelBasic = (entries, filename = 'horas') => {
  const data = entries.map(e => {
    const start = new Date(e.start_time);
    const end = new Date(e.end_time);
    const hours = (end - start) / (1000 * 60 * 60);
    
    return {
      'Fecha': format(start, 'dd/MM/yyyy'),
      'Empleado': e.user_name || e.users?.name || 'N/A',
      'Unidad': e.unit_name || e.organizational_units?.name || 'N/A',
      'Inicio': format(start, 'HH:mm'),
      'Fin': format(end, 'HH:mm'),
      'Horas': parseFloat(hours.toFixed(2)),
      'Descripción': e.description || ''
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Registros');

  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`);
};

export default exportToExcel;
