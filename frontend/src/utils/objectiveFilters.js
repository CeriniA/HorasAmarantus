/**
 * Utilidades de Filtrado de Objetivos
 * Lógica de filtrado avanzado para objetivos
 */

import { differenceInDays } from 'date-fns';
import { safeDate } from './dateHelpers';
import { OBJECTIVE_VALIDATION } from '../constants/validation';

/**
 * Aplica todos los filtros a la lista de objetivos
 * @param {Array} objectives - Lista de objetivos
 * @param {Object} filters - Objeto de filtros
 * @returns {Array} Objetivos filtrados
 */
export const applyObjectiveFilters = (objectives, filters) => {
  if (!objectives || objectives.length === 0) return [];

  return objectives.filter(objective => {
    // Filtro de búsqueda por texto
    if (filters.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      const matchesName = objective.name?.toLowerCase().includes(searchLower);
      const matchesDescription = objective.description?.toLowerCase().includes(searchLower);
      
      if (!matchesName && !matchesDescription) {
        return false;
      }
    }

    // Filtro por estado
    if (filters.status && filters.status !== 'all') {
      if (objective.status !== filters.status) {
        return false;
      }
    }

    // Filtro por tipo
    if (filters.type && filters.type !== 'all') {
      if (objective.objective_type !== filters.type) {
        return false;
      }
    }

    // Filtro por unidad organizacional
    if (filters.unit && filters.unit !== 'all') {
      if (objective.organizational_unit_id !== parseInt(filters.unit)) {
        return false;
      }
    }

    // Filtro por urgencia (días restantes)
    if (filters.urgency && filters.urgency !== 'all' && objective.end_date) {
      const today = new Date(); // OK: fecha actual
      const endDate = safeDate(objective.end_date);
      const daysRemaining = differenceInDays(endDate, today);

      switch (filters.urgency) {
        case 'overdue':
          if (daysRemaining >= OBJECTIVE_VALIDATION.URGENCY_OVERDUE) return false;
          break;
        case 'urgent':
          if (daysRemaining < OBJECTIVE_VALIDATION.URGENCY_OVERDUE || daysRemaining > OBJECTIVE_VALIDATION.URGENCY_CRITICAL) return false;
          break;
        case 'soon':
          if (daysRemaining < OBJECTIVE_VALIDATION.URGENCY_OVERDUE || daysRemaining > OBJECTIVE_VALIDATION.URGENCY_HIGH) return false;
          break;
        case 'normal':
          if (daysRemaining <= OBJECTIVE_VALIDATION.URGENCY_HIGH) return false;
          break;
        default:
          break;
      }
    }

    // Filtro por progreso mínimo
    if (filters.progressMin !== '' && filters.progressMin !== null) {
      const progressPercentage = objective.target_hours > 0 
        ? ((objective.completed_hours || 0) / objective.target_hours) * 100 
        : 0;
      
      if (progressPercentage < parseFloat(filters.progressMin)) {
        return false;
      }
    }

    // Filtro por progreso máximo
    if (filters.progressMax !== '' && filters.progressMax !== null) {
      const progressPercentage = objective.target_hours > 0 
        ? ((objective.completed_hours || 0) / objective.target_hours) * 100 
        : 0;
      
      if (progressPercentage > parseFloat(filters.progressMax)) {
        return false;
      }
    }

    // Filtro por fecha de inicio desde
    if (filters.dateFrom) {
      const startDate = safeDate(objective.start_date);
      const filterDate = safeDate(filters.dateFrom);
      
      if (startDate < filterDate) {
        return false;
      }
    }

    // Filtro por fecha de fin hasta
    if (filters.dateTo) {
      const endDate = safeDate(objective.end_date);
      const filterDate = safeDate(filters.dateTo);
      
      if (endDate > filterDate) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Ordena objetivos según criterio
 * @param {Array} objectives - Lista de objetivos
 * @param {string} sortBy - Criterio de ordenamiento
 * @param {string} sortOrder - Orden (asc/desc)
 * @returns {Array} Objetivos ordenados
 */
export const sortObjectives = (objectives, sortBy = 'created_at', sortOrder = 'desc') => {
  if (!objectives || objectives.length === 0) return [];

  const sorted = [...objectives].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = (a.name || '').localeCompare(b.name || '');
        break;
      
      case 'start_date':
        comparison = safeDate(a.start_date) - safeDate(b.start_date);
        break;
      
      case 'end_date':
        comparison = safeDate(a.end_date) - safeDate(b.end_date);
        break;
      
      case 'progress': {
        const progressA = a.target_hours > 0 ? (a.completed_hours || 0) / a.target_hours : 0;
        const progressB = b.target_hours > 0 ? (b.completed_hours || 0) / b.target_hours : 0;
        comparison = progressA - progressB;
        break;
      }
      
      case 'urgency': {
        const today = new Date(); // OK: fecha actual
        const daysA = differenceInDays(safeDate(a.end_date), today);
        const daysB = differenceInDays(safeDate(b.end_date), today);
        comparison = daysA - daysB;
        break;
      }
      
      case 'created_at':
      default:
        comparison = safeDate(a.created_at || '1970-01-01') - safeDate(b.created_at || '1970-01-01');
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
};

export default {
  applyObjectiveFilters,
  sortObjectives
};
