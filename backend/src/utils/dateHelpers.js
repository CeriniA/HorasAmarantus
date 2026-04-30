/**
 * Date Helpers para Backend
 * Utilidades para manejo seguro de fechas sin problemas de zona horaria
 */

/**
 * Parsea una fecha de forma segura (solo fecha, sin hora)
 * Evita problemas de zona horaria usando mediodía como referencia
 * 
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {Date|null} Objeto Date o null si es inválido
 * 
 * @example
 * parseDate('2026-04-26') // Date con 12:00:00 local
 */
const parseDate = (dateString) => {
  if (!dateString) return null;
  
  // Extraer solo la parte de fecha (YYYY-MM-DD)
  const dateOnly = dateString.split('T')[0];
  
  // Crear Date con mediodía para evitar cambios de día por zona horaria
  const date = new Date(dateOnly + 'T12:00:00');
  
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Compara dos fechas (solo día, ignorando hora)
 * 
 * @param {string} date1 - Primera fecha
 * @param {string} date2 - Segunda fecha
 * @returns {number} -1 si date1 < date2, 0 si iguales, 1 si date1 > date2
 */
const compareDates = (date1, date2) => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  
  if (!d1 || !d2) return 0;
  
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
};

/**
 * Verifica si date1 es posterior a date2
 * 
 * @param {string} date1 - Primera fecha
 * @param {string} date2 - Segunda fecha
 * @returns {boolean} true si date1 > date2
 */
const isAfter = (date1, date2) => {
  return compareDates(date1, date2) > 0;
};

/**
 * Verifica si date1 es anterior a date2
 * 
 * @param {string} date1 - Primera fecha
 * @param {string} date2 - Segunda fecha
 * @returns {boolean} true si date1 < date2
 */
const isBefore = (date1, date2) => {
  return compareDates(date1, date2) < 0;
};

/**
 * Verifica si dos fechas son el mismo día
 * 
 * @param {string} date1 - Primera fecha
 * @param {string} date2 - Segunda fecha
 * @returns {boolean} true si son el mismo día
 */
const isSameDay = (date1, date2) => {
  return compareDates(date1, date2) === 0;
};

/**
 * Calcula la diferencia en días entre dos fechas
 * 
 * @param {string} startDate - Fecha inicial
 * @param {string} endDate - Fecha final
 * @returns {number} Número de días de diferencia
 */
const diffInDays = (startDate, endDate) => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  if (!start || !end) return 0;
  
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Valida que una fecha esté en formato correcto
 * 
 * @param {string} dateString - Fecha a validar
 * @returns {boolean} true si es válida
 */
const isValidDate = (dateString) => {
  const date = parseDate(dateString);
  return date !== null;
};

export {
  parseDate,
  compareDates,
  isAfter,
  isBefore,
  isSameDay,
  diffInDays,
  isValidDate
};
