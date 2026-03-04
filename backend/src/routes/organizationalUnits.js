import express from 'express';
import { supabase } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';
import { validateCreateOrgUnit, validateUpdateOrgUnit, validateUUID } from '../middleware/validators.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/organizational-units - Obtener todas las unidades
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('organizational_units')
      .select('*')
      .eq('is_active', true)
      .order('path');

    if (error) throw error;

    res.json({ organizationalUnits: data });
  } catch (error) {
    console.error('Error obteniendo unidades:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/organizational-units/:id - Obtener una unidad
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('organizational_units')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Unidad no encontrada' });
    }

    res.json({ organizationalUnit: data });
  } catch (error) {
    console.error('Error obteniendo unidad:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/organizational-units - Crear unidad (solo admin/superadmin)
router.post('/', requireAdmin, validateCreateOrgUnit, async (req, res) => {
  try {

    const { name, type, parent_id } = req.body;

    const { data, error } = await supabase
      .from('organizational_units')
      .insert({ name, type, parent_id })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ organizationalUnit: data });
  } catch (error) {
    console.error('Error creando unidad:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /api/organizational-units/:id - Actualizar unidad (solo admin/superadmin)
router.put('/:id', requireAdmin, validateUpdateOrgUnit, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('organizational_units')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ organizationalUnit: data });
  } catch (error) {
    console.error('Error actualizando unidad:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// DELETE /api/organizational-units/:id - Eliminar unidad (solo admin/superadmin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('organizational_units')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Unidad eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando unidad:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
