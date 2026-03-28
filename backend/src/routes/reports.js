/**
 * Rutas para Reportes Optimizados
 * Endpoints especializados para generar reportes con cálculos en DB
 */

import express from 'express';
import { supabase } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { USER_ROLES } from '../constants.js';

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/reports/summary
 * Obtiene un resumen agregado de time entries con filtros
 * Query params:
 *   - start_date: fecha inicio (YYYY-MM-DD)
 *   - end_date: fecha fin (YYYY-MM-DD)
 *   - user_id: filtrar por usuario (opcional)
 *   - unit_id: filtrar por unidad organizacional (opcional)
 *   - group_by: agrupar por (user, unit, day, week, month)
 */
router.get('/summary', async (req, res) => {
  try {
    const { role, id: currentUserId } = req.user;
    const { start_date, end_date, user_id, unit_id, group_by = 'user' } = req.query;

    // Validar fechas
    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date y end_date son requeridos' });
    }

    // Base query
    let query = supabase
      .from('time_entries')
      .select(`
        *,
        organizational_units (id, name, type),
        users (id, name, email, weekly_goal, monthly_goal, standard_daily_hours)
      `)
      .gte('start_time', `${start_date} 00:00:00`)
      .lte('start_time', `${end_date} 23:59:59`)
      .not('end_time', 'is', null);

    // Filtrar por rol
    if (role === USER_ROLES.OPERARIO) {
      query = query.eq('user_id', currentUserId);
    } else {
      // Admin/SuperAdmin pueden filtrar por usuario específico
      if (user_id) {
        query = query.eq('user_id', user_id);
      }
    }

    // Filtrar por unidad organizacional
    if (unit_id) {
      query = query.eq('organizational_unit_id', unit_id);
    }

    const { data: entries, error } = await query;

    if (error) throw error;

    // Calcular resumen general
    const summary = {
      total_hours: 0,
      total_entries: entries.length,
      avg_daily_hours: 0,
      users_count: 0,
      units_count: 0,
      date_range: { start_date, end_date }
    };

    // Agrupar datos según group_by
    const grouped = {};
    const uniqueUsers = new Set();
    const uniqueUnits = new Set();

    entries.forEach(entry => {
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      const hours = (end - start) / (1000 * 60 * 60);

      summary.total_hours += hours;
      uniqueUsers.add(entry.user_id);
      uniqueUnits.add(entry.organizational_unit_id);

      let groupKey;
      switch (group_by) {
        case 'user':
          groupKey = entry.user_id;
          break;
        case 'unit':
          groupKey = entry.organizational_unit_id;
          break;
        case 'day':
          groupKey = start.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(start);
          weekStart.setDate(start.getDate() - start.getDay() + 1); // Lunes
          groupKey = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          groupKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          groupKey = entry.user_id;
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          key: groupKey,
          hours: 0,
          entries: 0,
          details: group_by === 'user' ? {
            user_id: entry.user_id,
            user_name: entry.users?.name,
            weekly_goal: entry.users?.weekly_goal,
            monthly_goal: entry.users?.monthly_goal,
            standard_daily_hours: entry.users?.standard_daily_hours
          } : group_by === 'unit' ? {
            unit_id: entry.organizational_unit_id,
            unit_name: entry.organizational_units?.name,
            unit_type: entry.organizational_units?.type
          } : {}
        };
      }

      grouped[groupKey].hours += hours;
      grouped[groupKey].entries++;
    });

    summary.users_count = uniqueUsers.size;
    summary.units_count = uniqueUnits.size;
    
    // Calcular promedio diario
    const daysDiff = Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24)) + 1;
    summary.avg_daily_hours = summary.total_hours / daysDiff;

    // Formatear datos agrupados
    const groupedArray = Object.values(grouped).map(item => ({
      ...item,
      hours: parseFloat(item.hours.toFixed(2)),
      avg_hours_per_entry: parseFloat((item.hours / item.entries).toFixed(2))
    }));

    res.json({
      summary: {
        ...summary,
        total_hours: parseFloat(summary.total_hours.toFixed(2)),
        avg_daily_hours: parseFloat(summary.avg_daily_hours.toFixed(2))
      },
      grouped: groupedArray,
      group_by
    });

  } catch (error) {
    console.error('Error generando resumen de reportes:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

/**
 * GET /api/reports/overtime
 * Detecta horas extras y trabajo en fines de semana
 */
router.get('/overtime', async (req, res) => {
  try {
    const { role, id: currentUserId } = req.user;
    const { start_date, end_date, user_id } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date y end_date son requeridos' });
    }

    let query = supabase
      .from('time_entries')
      .select(`
        *,
        users (id, name, standard_daily_hours, weekly_goal)
      `)
      .gte('start_time', `${start_date} 00:00:00`)
      .lte('start_time', `${end_date} 23:59:59`)
      .not('end_time', 'is', null);

    if (role === USER_ROLES.OPERARIO) {
      query = query.eq('user_id', currentUserId);
    } else if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const { data: entries, error } = await query;
    if (error) throw error;

    // Agrupar por día y usuario
    const dailyHours = {};
    
    entries.forEach(entry => {
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      const hours = (end - start) / (1000 * 60 * 60);
      const dateKey = start.toISOString().split('T')[0];
      const dayKey = `${dateKey}_${entry.user_id}`;
      const isWeekend = start.getDay() === 0 || start.getDay() === 6;

      if (!dailyHours[dayKey]) {
        dailyHours[dayKey] = {
          date: dateKey,
          user_id: entry.user_id,
          user_name: entry.users?.name,
          standard_hours: entry.users?.standard_daily_hours || 8,
          hours: 0,
          is_weekend: isWeekend,
          entries_count: 0
        };
      }

      dailyHours[dayKey].hours += hours;
      dailyHours[dayKey].entries_count++;
    });

    // Detectar overtime
    const overtime = [];
    const weekendWork = [];

    Object.values(dailyHours).forEach(day => {
      const dayData = {
        ...day,
        hours: parseFloat(day.hours.toFixed(2))
      };

      if (day.hours > day.standard_hours) {
        overtime.push({
          ...dayData,
          overtime_hours: parseFloat((day.hours - day.standard_hours).toFixed(2))
        });
      }

      if (day.is_weekend && day.hours > 0) {
        weekendWork.push(dayData);
      }
    });

    res.json({
      overtime: overtime.sort((a, b) => b.overtime_hours - a.overtime_hours),
      weekend_work: weekendWork.sort((a, b) => b.hours - a.hours),
      summary: {
        total_overtime_days: overtime.length,
        total_overtime_hours: parseFloat(overtime.reduce((sum, d) => sum + d.overtime_hours, 0).toFixed(2)),
        total_weekend_days: weekendWork.length,
        total_weekend_hours: parseFloat(weekendWork.reduce((sum, d) => sum + d.hours, 0).toFixed(2))
      }
    });

  } catch (error) {
    console.error('Error generando reporte de overtime:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
