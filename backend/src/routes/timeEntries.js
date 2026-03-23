import express from 'express';
import { supabase } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validateCreateTimeEntry, validateUpdateTimeEntry, validateUUID } from '../middleware/validators.js';
import { USER_ROLES, TIME_ENTRY_STATUS } from '../models/constants.js';

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
    if (role === USER_ROLES.OPERARIO) {
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
    
    // Solo admins y superadmins pueden crear registros para otros usuarios
    const targetUserId = user_id || req.user.id;
    if (targetUserId !== req.user.id && req.user.role !== USER_ROLES.ADMIN && req.user.role !== USER_ROLES.SUPERADMIN) {
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
        status: TIME_ENTRY_STATUS.COMPLETED
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

    if (existing.user_id !== req.user.id && req.user.role !== USER_ROLES.ADMIN && req.user.role !== USER_ROLES.SUPERADMIN) {
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

// POST /api/time-entries/bulk - Crear múltiples registros (jornada completa)
router.post('/bulk', async (req, res) => {
  try {
    const { entries, user_id } = req.body;

    // Validar que entries sea un array
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'Debe proporcionar al menos un registro' });
    }

    // Solo admins pueden crear registros para otros usuarios
    const targetUserId = user_id || req.user.id;
    if (targetUserId !== req.user.id && req.user.role !== USER_ROLES.ADMIN && req.user.role !== USER_ROLES.SUPERADMIN) {
      return res.status(403).json({ error: 'No puedes crear registros para otros usuarios' });
    }

    // Validar cada entrada
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      
      if (!entry.organizational_unit_id) {
        return res.status(400).json({ 
          error: `Entrada ${i + 1}: organizational_unit_id es requerido` 
        });
      }
      
      if (!entry.start_time || !entry.end_time) {
        return res.status(400).json({ 
          error: `Entrada ${i + 1}: start_time y end_time son requeridos` 
        });
      }

      // Validar que end_time > start_time
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      
      if (end <= start) {
        return res.status(400).json({ 
          error: `Entrada ${i + 1}: La hora de fin debe ser posterior a la de inicio` 
        });
      }
    }

    // Detectar solapamientos entre las entradas
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const entry1 = entries[i];
        const entry2 = entries[j];
        
        const start1 = new Date(entry1.start_time);
        const end1 = new Date(entry1.end_time);
        const start2 = new Date(entry2.start_time);
        const end2 = new Date(entry2.end_time);
        
        // Verificar solapamiento
        if ((start1 < end2 && end1 > start2)) {
          return res.status(400).json({ 
            error: `Las entradas ${i + 1} y ${j + 1} se solapan en tiempo` 
          });
        }
      }
    }

    // Preparar datos para inserción
    const timeEntriesToInsert = entries.map(entry => ({
      client_id: crypto.randomUUID(),
      user_id: targetUserId,
      organizational_unit_id: entry.organizational_unit_id,
      description: entry.description || null,
      start_time: entry.start_time,
      end_time: entry.end_time,
      status: 'completed'
    }));

    // Insertar todos los registros
    const { data, error } = await supabase
      .from('time_entries')
      .insert(timeEntriesToInsert)
      .select(`
        *,
        organizational_units (id, name, type),
        users (id, name, email)
      `);

    if (error) throw error;

    // Calcular total de horas
    let totalHours = 0;
    data.forEach(entry => {
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      const hours = (end - start) / (1000 * 60 * 60);
      totalHours += hours;
    });

    res.status(201).json({ 
      message: 'Jornada guardada exitosamente',
      created: data.length,
      total_hours: Math.round(totalHours * 100) / 100,
      timeEntries: data
    });
  } catch (error) {
    console.error('Error creando registros masivos:', error);
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
