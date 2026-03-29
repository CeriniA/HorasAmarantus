/**
 * Utilidades para comparación de períodos
 * Calcula métricas y comparaciones entre diferentes rangos de fechas
 */

import { differenceInDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from 'date-fns';
import { safeDate, calculateHours } from './dateHelpers';

/**
 * Calcula total de horas de un array de time entries
 */
export const getTotalHours = (entries) => {
  return entries.reduce((sum, entry) => {
    return sum + calculateHours(entry.start_time, entry.end_time);
  }, 0);
};

/**
 * Compara dos períodos y retorna métricas de cambio
 */
export const comparePeriods = (currentEntries, previousEntries) => {
  const currentHours = getTotalHours(currentEntries);
  const previousHours = getTotalHours(previousEntries);
  
  const change = currentHours - previousHours;
  const percentChange = previousHours > 0 
    ? parseFloat(((change / previousHours) * 100).toFixed(1))
    : 0;
  
  return {
    current: currentHours,
    previous: previousHours,
    change,
    percentChange,
    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
    isPositive: change >= 0
  };
};

/**
 * Obtiene el período anterior basado en un rango de fechas
 */
export const getPreviousPeriod = (startDate, endDate) => {
  const duration = differenceInDays(endDate, startDate) + 1;
  return {
    start: subDays(startDate, duration),
    end: subDays(endDate, duration)
  };
};

/**
 * Obtiene el rango de fechas de la semana anterior
 */
export const getPreviousWeek = (date = new Date()) => {
  const currentWeekStart = startOfWeek(date, { weekStartsOn: 1 });
  const previousWeekStart = subDays(currentWeekStart, 7);
  
  return {
    start: previousWeekStart,
    end: endOfWeek(previousWeekStart, { weekStartsOn: 1 })
  };
};

/**
 * Obtiene el rango de fechas del mes anterior
 */
export const getPreviousMonth = (date = new Date()) => {
  const currentMonthStart = startOfMonth(date);
  const previousMonthDate = subDays(currentMonthStart, 1);
  
  return {
    start: startOfMonth(previousMonthDate),
    end: endOfMonth(previousMonthDate)
  };
};

/**
 * Filtra entries por rango de fechas
 */
export const filterByDateRange = (entries, startDate, endDate) => {
  return entries.filter(entry => {
    const entryDate = safeDate(entry.start_time);
    return entryDate >= startDate && entryDate <= endDate;
  });
};

/**
 * Calcula métricas completas con comparación
 */
export const calculateMetricsWithComparison = (allEntries, currentStart, currentEnd) => {
  const currentEntries = filterByDateRange(allEntries, currentStart, currentEnd);
  const previousPeriod = getPreviousPeriod(currentStart, currentEnd);
  const previousEntries = filterByDateRange(allEntries, previousPeriod.start, previousPeriod.end);
  
  const comparison = comparePeriods(currentEntries, previousEntries);
  
  return {
    current: {
      entries: currentEntries,
      totalHours: comparison.current,
      count: currentEntries.length
    },
    previous: {
      entries: previousEntries,
      totalHours: comparison.previous,
      count: previousEntries.length
    },
    comparison
  };
};

export default {
  getTotalHours,
  comparePeriods,
  getPreviousPeriod,
  getPreviousWeek,
  getPreviousMonth,
  filterByDateRange,
  calculateMetricsWithComparison
};
