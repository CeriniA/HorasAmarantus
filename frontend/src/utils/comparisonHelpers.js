/**
 * Helpers para Comparativas de Reportes
 * Lógica de negocio para cálculos de comparativas entre usuarios, áreas y procesos
 */

import { format } from 'date-fns';
import { safeDate } from './dateHelpers';
import { REPORT_CONSTANTS } from '../constants';

/**
 * Calcula estadísticas para una entidad (usuario, área, proceso)
 * @param {string} name - Nombre de la entidad
 * @param {Array} entries - Array de time entries
 * @param {string|null} id - ID de la entidad
 * @param {string|null} email - Email (solo para usuarios)
 * @returns {Object} Estadísticas calculadas
 */
export const calculateEntityStats = (name, entries, id = null, email = null) => {
  const totalHours = entries.reduce((sum, e) => sum + (e.total_hours || 0), 0);
  
  // Días únicos trabajados
  const uniqueDays = new Set(
    entries.map(e => format(safeDate(e.start_time), 'yyyy-MM-dd'))
  );
  const daysWorked = uniqueDays.size;
  
  // Promedio por día
  const avgPerDay = daysWorked > 0 ? totalHours / daysWorked : 0;
  
  // Calcular horas por día
  const dailyHours = {};
  entries.forEach(entry => {
    const day = format(safeDate(entry.start_time), 'yyyy-MM-dd');
    dailyHours[day] = (dailyHours[day] || 0) + (entry.total_hours || 0);
  });
  
  // Horas extra (días con más de la meta diaria)
  const overtimeHours = Object.values(dailyHours)
    .filter(h => h > REPORT_CONSTANTS.DAILY_GOAL_HOURS)
    .reduce((sum, h) => sum + (h - REPORT_CONSTANTS.DAILY_GOAL_HOURS), 0);
  
  // Cumplimiento de meta (% de días con meta cumplida)
  const daysWithGoal = Object.values(dailyHours)
    .filter(h => h >= REPORT_CONSTANTS.DAILY_GOAL_HOURS).length;
  const goalCompliance = daysWorked > 0 ? (daysWithGoal / daysWorked) * 100 : 0;
  
  return {
    id,
    name,
    email,
    totalHours: parseFloat(totalHours.toFixed(1)),
    daysWorked,
    avgPerDay: parseFloat(avgPerDay.toFixed(1)),
    overtimeHours: parseFloat(overtimeHours.toFixed(1)),
    goalCompliance: parseFloat(goalCompliance.toFixed(1)),
    entries: entries.length
  };
};

/**
 * Filtra y mapea usuarios para comparativa
 * @param {Array} users - Array de usuarios
 * @param {Array} selectedUserIds - IDs de usuarios seleccionados
 * @param {Array} timeEntries - Array de time entries
 * @param {number} maxUsers - Máximo de usuarios a comparar
 * @returns {Array} Estadísticas de usuarios
 */
export const getUsersComparison = (users, selectedUserIds, timeEntries, maxUsers = REPORT_CONSTANTS.MAX_USERS_COMPARISON) => {
  const usersToCompare = users
    .filter(u => selectedUserIds.includes(u.id))
    .slice(0, maxUsers);
  
  return usersToCompare.map(user => {
    const userEntries = timeEntries.filter(e => e.user_id === user.id);
    return calculateEntityStats(user.name, userEntries, user.id, user.email);
  });
};

/**
 * Obtiene todos los IDs de una unidad y sus descendientes
 * @param {string} unitId - ID de la unidad padre
 * @param {Array} units - Array de todas las unidades
 * @returns {Array} Array de IDs incluyendo la unidad y sus hijos
 */
const getUnitAndChildrenIds = (unitId, units) => {
  const ids = [unitId];
  const children = units.filter(u => u.parent_id === unitId);
  children.forEach(child => {
    ids.push(...getUnitAndChildrenIds(child.id, units));
  });
  return ids;
};

/**
 * Filtra y mapea áreas para comparativa
 * @param {Array} units - Array de unidades organizacionales
 * @param {Array} selectedAreaIds - IDs de áreas seleccionadas
 * @param {Array} timeEntries - Array de time entries
 * @returns {Array} Estadísticas de áreas
 */
export const getAreasComparison = (units, selectedAreaIds, timeEntries) => {
  const areasToCompare = selectedAreaIds.length > 0
    ? units.filter(u => selectedAreaIds.includes(u.id))
    : units.filter(u => u.type === 'area');
  
  return areasToCompare
    .map(area => {
      // Obtener IDs del área y todos sus descendientes
      const areaAndChildrenIds = getUnitAndChildrenIds(area.id, units);
      // Filtrar registros que pertenezcan al área o cualquiera de sus hijos
      const areaEntries = timeEntries.filter(e => areaAndChildrenIds.includes(e.organizational_unit_id));
      return calculateEntityStats(area.name, areaEntries, area.id);
    })
    .filter(stat => stat.entries > 0); // Solo áreas con datos
};

/**
 * Filtra y mapea procesos para comparativa
 * @param {Array} units - Array de unidades organizacionales
 * @param {Array} selectedProcessIds - IDs de procesos seleccionados
 * @param {Array} timeEntries - Array de time entries
 * @returns {Array} Estadísticas de procesos
 */
export const getProcessesComparison = (units, selectedProcessIds, timeEntries) => {
  const processesToCompare = selectedProcessIds.length > 0
    ? units.filter(u => selectedProcessIds.includes(u.id))
    : units.filter(u => u.type === 'proceso');
  
  return processesToCompare
    .map(process => {
      // Obtener IDs del proceso y todos sus descendientes (subprocesos, tareas)
      const processAndChildrenIds = getUnitAndChildrenIds(process.id, units);
      // Filtrar registros que pertenezcan al proceso o cualquiera de sus hijos
      const processEntries = timeEntries.filter(e => processAndChildrenIds.includes(e.organizational_unit_id));
      return calculateEntityStats(process.name, processEntries, process.id);
    })
    .filter(stat => stat.entries > 0); // Solo procesos con datos
};

/**
 * Obtiene top N usuarios por total de horas
 * @param {Array} users - Array de usuarios
 * @param {Array} timeEntries - Array de time entries
 * @param {number} topN - Cantidad de usuarios a retornar
 * @returns {Array} Top N usuarios ordenados por horas
 */
export const getTopUsersComparison = (users, timeEntries, topN = 10) => {
  const userStats = users.map(user => {
    const userEntries = timeEntries.filter(e => e.user_id === user.id);
    return calculateEntityStats(user.name, userEntries, user.id, user.email);
  });
  
  return userStats
    .filter(stat => stat.totalHours > 0) // Solo usuarios con horas
    .sort((a, b) => b.totalHours - a.totalHours)
    .slice(0, topN);
};

/**
 * Filtra unidades por tipo
 * @param {Array} units - Array de unidades organizacionales
 * @param {string} type - Tipo de unidad ('area', 'proceso', etc.)
 * @returns {Array} Unidades filtradas
 */
export const filterUnitsByType = (units, type) => {
  return units.filter(u => u.type === type);
};

export default {
  calculateEntityStats,
  getUsersComparison,
  getAreasComparison,
  getProcessesComparison,
  getTopUsersComparison,
  filterUnitsByType
};
