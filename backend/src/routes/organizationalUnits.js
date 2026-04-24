/**
 * Organizational Units Routes
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permissions.js';
import { validateCreateOrgUnit, validateUpdateOrgUnit } from '../middleware/validators.js';
import organizationalUnitsController from '../controllers/organizationalUnits.controller.js';

const router = express.Router();

router.use(authenticate);

// GET - Todos pueden ver
router.get('/', organizationalUnitsController.getAll);
router.get('/:id', organizationalUnitsController.getById);

// POST - Solo con permiso de crear
router.post('/', 
  checkPermission('organizational_units', 'create', 'all'),
  validateCreateOrgUnit, 
  organizationalUnitsController.create
);

router.post('/bulk', 
  checkPermission('organizational_units', 'create', 'all'),
  organizationalUnitsController.createBulk
);

// PUT - Solo con permiso de actualizar
router.put('/:id', 
  checkPermission('organizational_units', 'update', 'all'),
  validateUpdateOrgUnit, 
  organizationalUnitsController.update
);

// DELETE - Solo con permiso de eliminar
router.delete('/:id', 
  checkPermission('organizational_units', 'delete', 'all'),
  organizationalUnitsController.deleteUnit
);

export default router;
