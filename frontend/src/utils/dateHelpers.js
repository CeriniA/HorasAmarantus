/**
 * Helpers para manejar fechas sin problemas de zona horaria
 * 
 * El problema: PostgreSQL guarda timestamps sin zona horaria (TIMESTAMP WITHOUT TIME ZONE)
 * pero JavaScript los interpreta como UTC, causando cambios de día en zonas UTC negativas.
 * 
 * Solución: Siempre agregar una hora del día (mediodía) para evitar cambios de fecha.
 */

/**
 * División segura que evita NaN
 * @param {number} numerator - Numerador
 * @param {number} denominator - Denominador
 * @param {number} decimals - Decimales a redondear (default: 1)
 * @returns {number} - Resultado o 0 si el denominador es 0
 */
export const safeDivide = (numerator, denominator, decimals = 1) => {
  if (!denominator || denominator === 0 || !isFinite(numerator)) {
    return 0;
  }
  const result = numerator / denominator;
  return isFinite(result) ? parseFloat(result.toFixed(decimals)) : 0;
};

/**
 * Formatear número con fallback a 0
 * @param {number} value - Valor a formatear
 * @param {number} decimals - Decimales (default: 1)
 * @returns {number} - Valor formateado o 0
 */
export const safeNumber = (value, decimals = 1) => {
  if (!isFinite(value) || value === null || value === undefined) {
    return 0;
  }
  return parseFloat(value.toFixed(decimals));
};

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

/**
 * Crear timestamp con zona horaria local
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {string} time - Hora en formato HH:MM
 * @returns {string} - Timestamp en formato ISO con zona horaria (YYYY-MM-DDTHH:MM:SS±HH:MM)
 */
export const createTimestampWithTimezone = (date, time) => {
  // Obtener offset de zona horaria en minutos
  const offset = -new Date().getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
  const minutes = String(Math.abs(offset) % 60).padStart(2, '0');
  
  return `${date}T${time}:00${sign}${hours}:${minutes}`;
};

/**
 * Parsear timestamp de la DB como hora local (sin conversión de zona horaria)
 * Útil cuando necesitas la hora exacta que se guardó, no la fecha
 * @param {string} timestamp - Timestamp en formato "YYYY-MM-DD HH:MM:SS" o "YYYY-MM-DDTHH:MM:SS"
 * @returns {Date} - Date object interpretado como hora local
 */
export const parseLocalTime = (timestamp) => {
  if (!timestamp) return null;
  
  // Normalizar formato (convertir espacio a T si es necesario)
  const normalized = timestamp.replace(' ', 'T');
  
  // Si ya tiene zona horaria, usarlo directamente
  if (normalized.includes('+') || normalized.includes('Z') || /[+-]\d{2}:\d{2}$/.test(normalized)) {
    return new Date(normalized);
  }
  
  // Si no tiene zona horaria, parsearlo como hora local
  // Extraer componentes
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
  if (!match) return null;
  
  const [, year, month, day, hour, minute, second] = match;
  
  // Crear Date usando el constructor local (no UTC)
  return new Date(
    parseInt(year),
    parseInt(month) - 1, // Los meses en JS son 0-indexed
    parseInt(day),
    parseInt(hour),
    parseInt(minute),
    parseInt(second)
  );
};
