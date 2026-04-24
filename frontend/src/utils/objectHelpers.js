/**
 * Utilidades para manipulación de objetos
 * Helpers reutilizables para limpiar, validar y transformar objetos
 */

/**
 * Elimina propiedades con valores vacíos de un objeto
 * @param {Object} obj - Objeto a limpiar
 * @param {Object} options - Opciones de limpieza
 * @param {boolean} options.removeNull - Eliminar valores null (default: false)
 * @param {boolean} options.removeUndefined - Eliminar valores undefined (default: true)
 * @param {boolean} options.removeEmptyStrings - Eliminar strings vacíos (default: true)
 * @param {boolean} options.trimStrings - Hacer trim a strings (default: true)
 * @returns {Object} Objeto limpio
 * 
 * @example
 * const data = { name: 'Juan', email: '', age: null, city: '  Madrid  ' };
 * const clean = removeEmptyFields(data);
 * // { name: 'Juan', city: 'Madrid' }
 */
export const removeEmptyFields = (obj, options = {}) => {
  const {
    removeNull = false,
    removeUndefined = true,
    removeEmptyStrings = true,
    trimStrings = true
  } = options;

  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip undefined si está habilitado
    if (removeUndefined && value === undefined) {
      continue;
    }

    // Skip null si está habilitado
    if (removeNull && value === null) {
      continue;
    }

    // Procesar strings
    if (typeof value === 'string') {
      const trimmed = trimStrings ? value.trim() : value;
      
      // Skip empty strings si está habilitado
      if (removeEmptyStrings && trimmed === '') {
        continue;
      }

      result[key] = trimmed;
      continue;
    }

    // Incluir el resto de valores
    result[key] = value;
  }

  return result;
};

/**
 * Convierte strings vacíos a null
 * Útil para enviar datos a la base de datos
 * @param {Object} obj - Objeto a convertir
 * @returns {Object} Objeto con strings vacíos convertidos a null
 * 
 * @example
 * const data = { name: 'Juan', email: '', age: 25 };
 * const converted = emptyStringsToNull(data);
 * // { name: 'Juan', email: null, age: 25 }
 */
export const emptyStringsToNull = (obj) => {
  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && value.trim() === '') {
      result[key] = null;
    } else if (typeof value === 'string') {
      result[key] = value.trim();
    } else {
      result[key] = value;
    }
  }

  return result;
};

/**
 * Selecciona solo las propiedades especificadas de un objeto
 * @param {Object} obj - Objeto fuente
 * @param {Array<string>} keys - Claves a seleccionar
 * @returns {Object} Objeto con solo las claves especificadas
 * 
 * @example
 * const user = { id: 1, name: 'Juan', email: 'juan@example.com', password: '123' };
 * const safe = pick(user, ['id', 'name', 'email']);
 * // { id: 1, name: 'Juan', email: 'juan@example.com' }
 */
export const pick = (obj, keys) => {
  const result = {};

  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }

  return result;
};

/**
 * Omite las propiedades especificadas de un objeto
 * @param {Object} obj - Objeto fuente
 * @param {Array<string>} keys - Claves a omitir
 * @returns {Object} Objeto sin las claves especificadas
 * 
 * @example
 * const user = { id: 1, name: 'Juan', email: 'juan@example.com', password: '123' };
 * const safe = omit(user, ['password']);
 * // { id: 1, name: 'Juan', email: 'juan@example.com' }
 */
export const omit = (obj, keys) => {
  const result = { ...obj };

  for (const key of keys) {
    delete result[key];
  }

  return result;
};

/**
 * Valida que un objeto tenga todas las propiedades requeridas
 * @param {Object} obj - Objeto a validar
 * @param {Array<string>} requiredKeys - Claves requeridas
 * @returns {Object} { valid: boolean, missing: Array<string> }
 * 
 * @example
 * const data = { name: 'Juan', email: 'juan@example.com' };
 * const validation = validateRequired(data, ['name', 'email', 'phone']);
 * // { valid: false, missing: ['phone'] }
 */
export const validateRequired = (obj, requiredKeys) => {
  const missing = [];

  for (const key of requiredKeys) {
    if (!(key in obj) || obj[key] === null || obj[key] === undefined || obj[key] === '') {
      missing.push(key);
    }
  }

  return {
    valid: missing.length === 0,
    missing
  };
};

export default {
  removeEmptyFields,
  emptyStringsToNull,
  pick,
  omit,
  validateRequired
};
