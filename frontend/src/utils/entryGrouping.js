/**
 * Utilidades para agrupar registros de tiempo
 * Funciones para agrupar por día, usuario, unidad, etc.
 */

import { extractDate, parseLocalTime } from './dateHelpers';
import { format } from 'date-fns';

/**
 * Agrupa registros por día
 * @param {Array} entries - Array de time entries
 * @returns {Array} Array de objetos { date, totalHours, workdayStart, workdayEnd, entries: [...] }
 */
export const groupByDay = (entries) => {
  const grouped = {};

  entries.forEach(entry => {
    const date = extractDate(entry.start_time);
    
    if (!grouped[date]) {
      grouped[date] = {
        date,
        totalHours: 0,
        workdayStart: null,
        workdayEnd: null,
        entries: []
      };
    }

    grouped[date].totalHours += entry.total_hours || 0;
    grouped[date].entries.push(entry);
    
    // Calcular rango horario real del día (primera entrada - última salida)
    try {
      const startTime = parseLocalTime(entry.start_time);
      const endTime = parseLocalTime(entry.end_time);
      
      const startHour = format(startTime, 'HH:mm');
      const endHour = format(endTime, 'HH:mm');
      
      // Actualizar hora de inicio (la más temprana)
      if (!grouped[date].workdayStart || startHour < grouped[date].workdayStart) {
        grouped[date].workdayStart = startHour;
      }
      
      // Actualizar hora de fin (la más tardía)
      if (!grouped[date].workdayEnd || endHour > grouped[date].workdayEnd) {
        grouped[date].workdayEnd = endHour;
      }
    } catch (error) {
      // Si hay error parseando fechas, ignorar este entry para el rango horario
    }
  });

  // Convertir a array y ordenar por fecha descendente
  return Object.values(grouped)
    .sort((a, b) => b.date.localeCompare(a.date));
};

/**
 * Agrupa registros por día y usuario
 * @param {Array} entries - Array de time entries
 * @returns {Array} Array de objetos { date, userId, userName, totalHours, entries: [...] }
 */
export const groupByDayAndUser = (entries) => {
  const grouped = {};

  entries.forEach(entry => {
    const date = extractDate(entry.start_time);
    const userId = entry.user_id;
    const key = `${date}_${userId}`;
    
    if (!grouped[key]) {
      grouped[key] = {
        date,
        userId,
        userName: entry.users?.name || 'Desconocido',
        totalHours: 0,
        entries: []
      };
    }

    grouped[key].totalHours += entry.total_hours || 0;
    grouped[key].entries.push(entry);
  });

  // Convertir a array y ordenar por fecha descendente, luego por usuario
  return Object.values(grouped)
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return a.userName.localeCompare(b.userName);
    });
};

/**
 * Agrupa registros por usuario y día
 * @param {Array} entries - Array de time entries
 * @returns {Object} Objeto con userId como key, y array de días como value
 */
export const groupByUserAndDay = (entries) => {
  const grouped = {};

  entries.forEach(entry => {
    const userId = entry.user_id;
    const date = extractDate(entry.start_time);
    
    if (!grouped[userId]) {
      grouped[userId] = {
        userId,
        userName: entry.users?.name || 'Desconocido',
        days: {}
      };
    }

    if (!grouped[userId].days[date]) {
      grouped[userId].days[date] = {
        date,
        totalHours: 0,
        entries: []
      };
    }

    grouped[userId].days[date].totalHours += entry.total_hours || 0;
    grouped[userId].days[date].entries.push(entry);
  });

  // Convertir days a array
  Object.keys(grouped).forEach(userId => {
    grouped[userId].days = Object.values(grouped[userId].days)
      .sort((a, b) => b.date.localeCompare(a.date));
  });

  return grouped;
};
