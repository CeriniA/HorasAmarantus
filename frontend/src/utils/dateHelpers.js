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
 * @param {string} timestamp - Timestamp en formato ISO
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export const extractDate = (timestamp) => {
  if (!timestamp) return '';
  return timestamp.split('T')[0];
};

/**
 * Formatear fecha para mostrar, evitando problemas de zona horaria
 * @param {string} timestamp - Timestamp de la DB
 * @returns {Date} - Date object seguro para formatear
 */
export const safeDate = (timestamp) => {
  const dateStr = extractDate(timestamp);
  return new Date(dateStr + 'T12:00:00');
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
