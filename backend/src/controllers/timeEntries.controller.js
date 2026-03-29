/**
 * Time Entries Controller
 * 
 * Responsabilidades:
 * - Recibir requests HTTP
 * - Validar datos de entrada
 * - Llamar a services
 * - Formatear respuestas
 * - Manejo de errores HTTP
 */

import timeEntriesService from '../services/timeEntries.service.js';
import logger from '../utils/logger.js';

/**
 * GET /api/time-entries
 * Obtener todos los time entries según el rol del usuario
 */
const getAll = async (req, res) => {
  try {
    const timeEntries = await timeEntriesService.getAll(req.user);
    res.json({ timeEntries });
  } catch (error) {
    logger.error('Error en getAll controller:', error);
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
};

/**
 * POST /api/time-entries
 * Crear un time entry
 */
const create = async (req, res) => {
  try {
    const timeEntry = await timeEntriesService.create(req.body, req.user);
    res.status(201).json({ timeEntry });
  } catch (error) {
    logger.error('Error en create controller:', error);
    
    // Errores de validación/permisos
    if (error.message.includes('No puedes') || 
        error.message.includes('no encontrado') ||
        error.message.includes('requerido')) {
      return res.status(error.message.includes('no encontrado') ? 404 : 403)
        .json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
};

/**
 * PUT /api/time-entries/:id
 * Actualizar un time entry
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const timeEntry = await timeEntriesService.update(id, req.body, req.user);
    res.json({ timeEntry });
  } catch (error) {
    logger.error('Error en update controller:', error);
    
    // Errores de validación/permisos
    if (error.message.includes('No puedes')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
};

/**
 * POST /api/time-entries/bulk
 * Crear múltiples time entries
 */
const createBulk = async (req, res) => {
  try {
    const { entries, user_id } = req.body;
    const result = await timeEntriesService.createBulk(entries, req.user, user_id);
    
    res.status(201).json({ 
      message: 'Jornada guardada exitosamente',
      ...result
    });
  } catch (error) {
    logger.error('Error en createBulk controller:', error);
    
    // Errores de validación
    if (error.message.includes('Debe proporcionar') ||
        error.message.includes('requerido') ||
        error.message.includes('solapan') ||
        error.message.includes('posterior')) {
      return res.status(400).json({ error: error.message });
    }
    
    // Errores de permisos
    if (error.message.includes('No puedes')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
};

/**
 * DELETE /api/time-entries/bulk
 * Eliminar múltiples time entries
 */
const deleteBulk = async (req, res) => {
  try {
    const { ids } = req.body;
    const result = await timeEntriesService.deleteBulk(ids, req.user);
    
    res.json({ 
      message: `${result.deleted} registros eliminados exitosamente` 
    });
  } catch (error) {
    logger.error('Error en deleteBulk controller:', error);
    
    // Errores de validación
    if (error.message.includes('Se requiere')) {
      return res.status(400).json({ error: error.message });
    }
    
    // Errores de permisos
    if (error.message.includes('No puedes')) {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
};

/**
 * DELETE /api/time-entries/:id
 * Eliminar un time entry
 */
const deleteOne = async (req, res) => {
  try {
    const { id } = req.params;
    await timeEntriesService.deleteOne(id, req.user);
    
    res.json({ message: 'Registro eliminado exitosamente' });
  } catch (error) {
    logger.error('Error en deleteOne controller:', error);
    
    // Errores de permisos
    if (error.message.includes('No puedes')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
};

export default {
  getAll,
  create,
  update,
  createBulk,
  deleteBulk,
  deleteOne
};
