/**
 * Utilidades para cálculos de reportes
 * Funciones puras extraídas de Reports.jsx
 */

import { format } from 'date-fns';

/**
 * Obtiene una unidad y todas sus sub-unidades (recursivo)
 * @param {string} unitId - ID de la unidad padre
 * @param {Array} units - Array de todas las unidades
 * @returns {Array} Array de IDs (unidad + todos sus hijos)
 */
export const getUnitAndChildren = (unitId, units) => {
  const result = [unitId];
  
  const findChildren = (parentId) => {
    units.forEach(unit => {
      if (unit.parent_id === parentId && !result.includes(unit.id)) {
        result.push(unit.id);
        findChildren(unit.id); // Recursivo
      }
    });
  };
  
  findChildren(unitId);
  return result;
};

/**
 * Agrupa registros por usuario
 * @param {Array} entries - Array de time entries
 * @returns {Array} Array de objetos { name, hours, entries }
 */
export const groupByUser = (entries) => {
  const byUserMap = {};
  
  entries.forEach(entry => {
    const userId = entry.user_id;
    if (!byUserMap[userId]) {
      byUserMap[userId] = {
        name: entry.users?.name || 'Desconocido',
        hours: 0,
        entries: 0
      };
    }
    byUserMap[userId].hours += entry.total_hours || 0;
    byUserMap[userId].entries += 1;
  });

  return Object.values(byUserMap)
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 10);
};

/**
 * Agrupa registros por unidad organizacional
 * @param {Array} entries - Array de time entries
 * @param {Array} units - Array de todas las unidades
 * @returns {Array} Array de objetos con datos de unidad
 */
export const groupByUnit = (entries, units) => {
  const byUnitMap = {};
  
  entries.forEach(entry => {
    const unitId = entry.organizational_unit_id;
    if (!byUnitMap[unitId]) {
      const unitData = units.find(u => u.id === unitId);
      byUnitMap[unitId] = {
        id: unitId,
        name: entry.organizational_units?.name || 'Sin unidad',
        type: entry.organizational_units?.type || '',
        level: unitData?.level || 0,
        parent_id: unitData?.parent_id || null,
        hours: 0,
        entries: 0
      };
    }
    byUnitMap[unitId].hours += entry.total_hours || 0;
    byUnitMap[unitId].entries += 1;
  });

  // Ordenar por jerarquía (nivel) y luego por horas
  return Object.values(byUnitMap)
    .sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return b.hours - a.hours;
    });
};

/**
 * Agrupa registros por día
 * @param {Array} entries - Array de time entries
 * @returns {Array} Array de objetos { date, hours, entries }
 */
export const groupByDay = (entries) => {
  const byDayMap = {};
  
  entries.forEach(entry => {
    const day = format(new Date(entry.start_time), 'yyyy-MM-dd');
    if (!byDayMap[day]) {
      byDayMap[day] = {
        date: day,
        hours: 0,
        entries: 0
      };
    }
    byDayMap[day].hours += entry.total_hours || 0;
    byDayMap[day].entries += 1;
  });

  return Object.values(byDayMap)
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Calcula métricas totales
 * @param {Array} entries - Array de time entries
 * @param {Array} units - Array de todas las unidades
 * @returns {Object} Objeto con todas las métricas calculadas
 */
export const calculateReportMetrics = (entries, units) => {
  const totalHours = entries.reduce((sum, e) => sum + (e.total_hours || 0), 0);
  const totalEntries = entries.length;
  
  const byUser = groupByUser(entries);
  const byUnit = groupByUnit(entries, units);
  const byDay = groupByDay(entries);

  return {
    totalHours,
    totalEntries,
    byUser,
    byUnit,
    byDay
  };
};
