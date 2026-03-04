import express from 'express';
import { supabase } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validateCreateTimeEntry, validateUpdateTimeEntry, validateUUID } from '../middleware/validators.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/time-entries - Obtener registros según rol
router.get('/', async (req, res) => {
  try {
    const { role, id } = req.user;
    let query = supabase
      .from('time_entries')
      .select(`
        *,
        organizational_units (id, name, type),
        users (id, name, email)
      `)
      .order('start_time', { ascending: false });

    // Filtrar según rol
    if (role === 'operario') {
      query = query.eq('user_id', id);
    }
    // Superadmin y Admin ven todo (no se filtra)

    const { data, error } = await query;

    if (error) throw error;

    res.json({ timeEntries: data });
  } catch (error) {
    console.error('Error obteniendo registros:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/time-entries - Crear registro
router.post('/', validateCreateTimeEntry, async (req, res) => {
  try {

    const { organizational_unit_id, description, start_time, end_time, user_id } = req.body;
    
    // Solo admins pueden crear registros para otros usuarios
    const targetUserId = user_id || req.user.id;
    if (targetUserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No puedes crear registros para otros usuarios' });
    }

    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        client_id: crypto.randomUUID(),
        user_id: targetUserId,
        organizational_unit_id,
        description,
        start_time,
        end_time,
        status: 'completed'
      })
      .select(`
        *,
        organizational_units (id, name, type),
        users (id, name, email)
      `)
      .single();

    if (error) throw error;

    res.status(201).json({ timeEntry: data });
  } catch (error) {
    console.error('Error creando registro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /api/time-entries/:id - Actualizar registro
router.put('/:id', validateUpdateTimeEntry, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el registro existe y pertenece al usuario (o es admin)
    const { data: existing, error: fetchError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No puedes editar registros de otros usuarios' });
    }

    const { data, error } = await supabase
      .from('time_entries')
      .update(req.body)
      .eq('id', id)
      .select(`
        *,
        organizational_units (id, name, type),
        users (id, name, email)
      `)
      .single();

    if (error) throw error;

    res.json({ timeEntry: data });
  } catch (error) {
    console.error('Error actualizando registro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// DELETE /api/time-entries/:id - Eliminar registro
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el registro existe y pertenece al usuario (o es admin)
    const { data: existing, error: fetchError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No puedes eliminar registros de otros usuarios' });
    }

    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Registro eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando registro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
