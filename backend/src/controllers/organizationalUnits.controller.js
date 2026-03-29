/**
 * Organizational Units Controller
 */

import organizationalUnitsService from '../services/organizationalUnits.service.js';
import logger from '../utils/logger.js';

const getAll = async (req, res) => {
  try {
    const units = await organizationalUnitsService.getAll();
    res.json({ organizationalUnits: units });
  } catch (error) {
    logger.error('Error en getAll orgUnits controller:', error);
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await organizationalUnitsService.getById(id);
    res.json({ organizationalUnit: unit });
  } catch (error) {
    logger.error('Error en getById orgUnits controller:', error);
    
    if (error.message === 'Unidad no encontrada') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const create = async (req, res) => {
  try {
    const unit = await organizationalUnitsService.create(req.body);
    res.status(201).json({ organizationalUnit: unit });
  } catch (error) {
    logger.error('Error en create orgUnits controller:', error);
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await organizationalUnitsService.update(id, req.body);
    res.json({ organizationalUnit: unit });
  } catch (error) {
    logger.error('Error en update orgUnits controller:', error);
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
};

const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;
    await organizationalUnitsService.deleteUnit(id);
    res.json({ message: 'Unidad eliminada exitosamente' });
  } catch (error) {
    logger.error('Error en delete orgUnits controller:', error);
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  deleteUnit
};
