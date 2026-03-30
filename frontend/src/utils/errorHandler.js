import logger from './logger';

// Manejador centralizado de errores
export const handleApiError = (error) => {
  logger.error('API Error:', error);

  // Errores de red
  if (!error.response && error.message === 'Failed to fetch') {
    return 'No se pudo conectar con el servidor. Verifica tu conexión.';
  }

  // Errores HTTP
  const status = error.status || error.response?.status;
  const message = error.message || error.data?.error || 'Error desconocido';

  switch (status) {
    case 400:
      return `Datos inválidos: ${message}`;
    case 401:
      return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return 'Recurso no encontrado.';
    case 409:
      return 'Este registro ya existe.';
    case 422:
      return 'Los datos no cumplen con las validaciones requeridas.';
    case 429:
      return 'Demasiadas solicitudes. Intenta de nuevo más tarde.';
    case 500:
      return 'Error en el servidor. Intenta de nuevo más tarde.';
    default:
      return message;
  }
};

// Formatear errores de validación
export const formatValidationErrors = (errors) => {
  if (!Array.isArray(errors)) return [];
  
  return errors.map(err => ({
    field: err.param || err.path,
    message: err.msg || err.message
  }));
};

// Toast de error (si usas una librería de notificaciones)
export const showError = (error, toastFn) => {
  const message = handleApiError(error);
  if (toastFn) {
    toastFn.error(message);
  }
  return message;
};

export default { handleApiError, formatValidationErrors, showError };
