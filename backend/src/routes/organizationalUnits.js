/**
 * Organizational Units Routes
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';
import { validateCreateOrgUnit, validateUpdateOrgUnit } from '../middleware/validators.js';
import organizationalUnitsController from '../controllers/organizationalUnits.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', organizationalUnitsController.getAll);
router.get('/:id', organizationalUnitsController.getById);
router.post('/', requireAdmin, validateCreateOrgUnit, organizationalUnitsController.create);
router.post('/bulk', requireAdmin, organizationalUnitsController.createBulk);
router.put('/:id', requireAdmin, validateUpdateOrgUnit, organizationalUnitsController.update);
router.delete('/:id', requireAdmin, organizationalUnitsController.deleteUnit);

export default router;
