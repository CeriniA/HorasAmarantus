/**
 * Helpers para manejar fechas sin problemas de zona horaria
 * 
 * El problema: PostgreSQL guarda timestamps sin zona horaria (TIMESTAMP WITHOUT TIME ZONE)
 * pero JavaScript los interpreta como UTC, causando cambios de día en zonas UTC negativas.
 * 
 * Solución: Siempre agregar una hora del día (mediodía) para evitar cambios de fecha.
 */

/**
 * Parsear un timestamp de la DB como fecha local
 * @param {string} timestamp - Timestamp en formato ISO (YYYY-MM-DDTHH:MM:SS)
 * @returns {Date} - Objeto Date en hora local
 */
export const parseDBTimestamp = (timestamp) => {
  if (!timestamp) return null;
  
  // Si ya tiene hora, usarlo directamente
  if (timestamp.includes('T')) {
    return new Date(timestamp);
  }
  
  // Si es solo fecha (YYYY-MM-DD), agregar mediodía para evitar cambios de día
  return new Date(timestamp + 'T12:00:00');
};

/**
 * Extraer solo la fecha de un timestamp (YYYY-MM-DD)
 * @param {string|Date} timestamp - Timestamp en formato ISO o Date object
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export const extractDate = (timestamp) => {
  if (!timestamp) return '';
  
  // Si es un Date object, convertir a string ISO
  if (timestamp instanceof Date) {
    return timestamp.toISOString().split('T')[0];
  }
  
  // Si es string, extraer la parte de fecha
  if (typeof timestamp === 'string') {
    return timestamp.split('T')[0];
  }
  
  return '';
};

/**
 * Formatear fecha para mostrar, evitando problemas de zona horaria
 * @param {string|Date} timestamp - Timestamp de la DB o Date object
 * @returns {Date|null} - Date object seguro para formatear, o null si timestamp es inválido
 */
export const safeDate = (timestamp) => {
  if (!timestamp) return null;
  
  // Si ya es un Date object, validar que sea válido
  if (timestamp instanceof Date) {
    return isNaN(timestamp.getTime()) ? null : timestamp;
  }
  
  // Si es string, extraer fecha y crear Date con mediodía
  const dateStr = extractDate(timestamp);
  if (!dateStr) return null;
  
  const date = new Date(dateStr + 'T12:00:00');
  // Validar que el Date creado sea válido
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Calcular horas entre dos timestamps
 * @param {string} startTime - Timestamp de inicio
 * @param {string} endTime - Timestamp de fin
 * @returns {number} - Horas transcurridas
 */
export const calculateHours = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return (end - start) / (1000 * 60 * 60);
};

/**
 * Crear timestamp para guardar en DB (sin zona horaria)
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {string} time - Hora en formato HH:MM
 * @returns {string} - Timestamp en formato YYYY-MM-DD HH:MM:SS
 */
export const createDBTimestamp = (date, time) => {
  return `${date} ${time}:00`;
};

/**
 * Verificar si una fecha está dentro de un rango
 * @param {string} timestamp - Timestamp a verificar
 * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha de fin (YYYY-MM-DD)
 * @returns {boolean} - true si está en el rango
 */
export const isDateInRange = (timestamp, startDate, endDate) => {
  if (!timestamp || !startDate || !endDate) return false;
  
  const entryDate = safeDate(timestamp);
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T23:59:59`);
  
  return entryDate >= start && entryDate <= end;
};

/**
 * Validar si una fecha es válida
 * @param {string|Date} date - Fecha a validar
 * @returns {boolean} - true si es válida
 */
export const isValidDate = (date) => {
  if (!date) return false;
  const d = date instanceof Date ? date : new Date(date);
  return d instanceof Date && !isNaN(d);
};
