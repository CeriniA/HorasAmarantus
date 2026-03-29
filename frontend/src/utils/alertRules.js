/**
 * Sistema de Reglas para Alertas Inteligentes
 * Evalúa patrones y genera alertas contextuales
 */

import { isSameDay, isWeekend, getHours, differenceInDays, startOfWeek, endOfWeek } from 'date-fns';
import { safeDate, calculateHours, extractDate } from './dateHelpers';

/**
 * Evalúa todas las reglas y genera alertas
 */
export const evaluateAlerts = (timeEntries, user) => {
  const alerts = [];
  const today = new Date(); // OK: fecha actual del sistema
  const weeklyGoal = user?.weekly_goal || 40;

  // Regla 1: Sin registros hoy (después de las 6 PM)
  if (getHours(today) >= 18) {
    const todayEntries = timeEntries.filter(e => 
      isSameDay(safeDate(e.start_time), today)
    );
    
    if (todayEntries.length === 0 && !isWeekend(today)) {
      alerts.push({
        id: 'no-entries-today',
        type: 'warning',
        title: 'Sin registros hoy',
        message: 'No has registrado horas hoy. ¿Olvidaste cargarlas?',
        action: { 
          label: 'Registrar ahora', 
          route: '/time-entries' 
        },
        priority: 'high'
      });
    }
  }

  // Regla 2: Días consecutivos sin registrar
  const daysWithoutEntries = getDaysWithoutEntries(timeEntries);
  if (daysWithoutEntries >= 3) {
    alerts.push({
      id: 'consecutive-days-missing',
      type: 'danger',
      title: `${daysWithoutEntries} días sin registros`,
      message: 'Llevas varios días sin registrar horas. Esto puede afectar tus reportes.',
      action: { 
        label: 'Ver historial', 
        route: '/time-entries' 
      },
      priority: 'high'
    });
  }

  // Regla 3: Récord personal de la semana
  const weekHours = getWeekHours(timeEntries);
  const avgWeekHours = getAvgWeekHours(timeEntries);
  
  if (weekHours > avgWeekHours * 1.2 && weekHours > 0) {
    alerts.push({
      id: 'week-record',
      type: 'success',
      title: '🎉 ¡Excelente semana!',
      message: `${weekHours.toFixed(1)}h - Tu mejor semana del mes`,
      data: {
        'Esta semana': `${weekHours.toFixed(1)}h`,
        'Promedio': `${avgWeekHours.toFixed(1)}h`,
        'Mejora': `+${((weekHours / avgWeekHours - 1) * 100).toFixed(0)}%`
      },
      priority: 'low'
    });
  }

  // Regla 4: Objetivo semanal - Progreso y alertas
  const progress = (weekHours / weeklyGoal) * 100;
  const remaining = weeklyGoal - weekHours;
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const daysRemaining = differenceInDays(weekEnd, today);
  
  // Calcular días laborables restantes (sin domingo)
  let workDaysRemaining = 0;
  for (let i = 1; i <= daysRemaining; i++) {
    const checkDate = new Date(today); // OK: fecha actual del sistema
    checkDate.setDate(checkDate.getDate() + i);
    if (checkDate.getDay() !== 0) workDaysRemaining++;
  }
  
  const requiredPerDay = workDaysRemaining > 0 ? remaining / workDaysRemaining : 0;
  
  // 4a. Objetivo cumplido
  if (progress >= 100) {
    alerts.push({
      id: 'goal-achieved',
      type: 'success',
      title: '🎯 ¡Meta alcanzada!',
      message: `Completaste tu objetivo semanal de ${weeklyGoal}h`,
      data: {
        'Objetivo': `${weeklyGoal}h`,
        'Logrado': `${weekHours.toFixed(1)}h`,
        'Progreso': `${progress.toFixed(0)}%`
      },
      priority: 'medium'
    });
  }
  // 4b. Cerca del objetivo (80-99%)
  else if (progress >= 80 && progress < 100) {
    alerts.push({
      id: 'goal-near',
      type: 'info',
      title: '🎯 Cerca del objetivo',
      message: `${progress.toFixed(0)}% completado - Faltan ${remaining.toFixed(1)}h para tu meta semanal`,
      action: {
        label: 'Registrar horas',
        route: '/time-entries'
      },
      priority: 'medium'
    });
  }
  // 4c. Ritmo insuficiente (quedan pocos días y mucho por hacer)
  else if (workDaysRemaining <= 2 && progress < 70) {
    alerts.push({
      id: 'goal-behind',
      type: 'warning',
      title: '⚠️ Necesitas acelerar',
      message: `Solo quedan ${workDaysRemaining} días y llevas ${progress.toFixed(0)}% del objetivo`,
      data: {
        'Faltan': `${remaining.toFixed(1)}h`,
        'Necesitas': `${requiredPerDay.toFixed(1)}h/día`
      },
      action: {
        label: 'Registrar horas',
        route: '/time-entries'
      },
      priority: 'high'
    });
  }
  // 4d. Buen ritmo (mitad de semana, buen progreso)
  else if (today.getDay() >= 3 && progress >= 50) {
    alerts.push({
      id: 'goal-on-track',
      type: 'success',
      title: '✅ Vas bien encaminado',
      message: `Llevas ${progress.toFixed(0)}% del objetivo. Mantén el ritmo!`,
      data: {
        'Progreso': `${weekHours.toFixed(1)}h / ${weeklyGoal}h`,
        'Promedio necesario': `${requiredPerDay.toFixed(1)}h/día`
      },
      priority: 'low'
    });
  }
  // 4e. Alerta temprana (mitad de semana, poco progreso)
  else if (today.getDay() >= 3 && progress < 40) {
    alerts.push({
      id: 'goal-early-warning',
      type: 'warning',
      title: '📊 Progreso bajo',
      message: `Llevas ${progress.toFixed(0)}% del objetivo y ya es ${today.getDay() === 3 ? 'miércoles' : today.getDay() === 4 ? 'jueves' : 'viernes'}`,
      data: {
        'Faltan': `${remaining.toFixed(1)}h`,
        'Necesitas': `${requiredPerDay.toFixed(1)}h/día`
      },
      action: {
        label: 'Registrar horas',
        route: '/time-entries'
      },
      priority: 'medium'
    });
  }

  // Regla 5: Patrón irregular detectado
  const irregularPattern = detectIrregularPattern(timeEntries);
  if (irregularPattern) {
    alerts.push({
      id: 'irregular-pattern',
      type: 'warning',
      title: 'Patrón irregular detectado',
      message: 'Tus horas varían mucho día a día. Considera mantener un ritmo más constante.',
      data: {
        'Variación': `${irregularPattern.variance.toFixed(1)}h`,
        'Recomendación': `${irregularPattern.recommended.toFixed(1)}h/día`
      },
      priority: 'low'
    });
  }

  // Regla 6: Horas extras frecuentes
  const overtimePattern = detectOvertimePattern(timeEntries);
  if (overtimePattern.frequent) {
    alerts.push({
      id: 'overtime-warning',
      type: 'warning',
      title: '⚠️ Muchas horas extras',
      message: `Has trabajado más de 8h/día en ${overtimePattern.days} días este mes`,
      data: {
        'Días con extras': overtimePattern.days,
        'Promedio diario': `${overtimePattern.avgDaily.toFixed(1)}h`
      },
      priority: 'medium'
    });
  }

  // Regla 7: Buen ritmo de trabajo
  const consistencyScore = calculateConsistency(timeEntries);
  if (consistencyScore > 85) {
    alerts.push({
      id: 'good-consistency',
      type: 'success',
      title: '✨ Excelente consistencia',
      message: 'Mantienes un ritmo de trabajo muy constante. ¡Sigue así!',
      data: {
        'Score de consistencia': `${consistencyScore}/100`
      },
      priority: 'low'
    });
  }

  // Ordenar por prioridad
  return alerts.sort((a, b) => {
    const priority = { high: 3, medium: 2, low: 1 };
    return priority[b.priority] - priority[a.priority];
  });
};

/**
 * Calcula días consecutivos sin registros
 */
const getDaysWithoutEntries = (timeEntries) => {
  const today = new Date(); // OK: fecha actual
  let daysWithout = 0;
  
  for (let i = 1; i <= 7; i++) {
    const checkDate = new Date(today); // OK: fecha actual
    checkDate.setDate(checkDate.getDate() - i);
    
    if (isWeekend(checkDate)) continue;
    
    const hasEntries = timeEntries.some(e => 
      isSameDay(safeDate(e.start_time), checkDate)
    );
    
    if (!hasEntries) {
      daysWithout++;
    } else {
      break; // Dejar de contar si encuentra un día con registros
    }
  }
  
  return daysWithout;
};

/**
 * Calcula horas de la semana actual
 */
const getWeekHours = (timeEntries) => {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // OK: fecha actual
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 }); // OK: fecha actual
  
  return timeEntries
    .filter(e => {
      const entryDate = safeDate(e.start_time);
      return entryDate >= weekStart && entryDate <= weekEnd;
    })
    .reduce((sum, entry) => {
      const hours = calculateHours(entry.start_time, entry.end_time);
      return sum + hours;
    }, 0);
};

/**
 * Calcula promedio de horas semanales
 */
const getAvgWeekHours = (timeEntries) => {
  if (timeEntries.length === 0) return 0;
  
  // Agrupar por semana
  const weeklyHours = {};
  
  timeEntries.forEach(entry => {
    const weekStart = startOfWeek(safeDate(entry.start_time), { weekStartsOn: 1 });
    const weekKey = weekStart.toISOString();
    
    if (!weeklyHours[weekKey]) {
      weeklyHours[weekKey] = 0;
    }
    
    const hours = calculateHours(entry.start_time, entry.end_time);
    weeklyHours[weekKey] += hours;
  });
  
  const weeks = Object.values(weeklyHours);
  return weeks.reduce((sum, h) => sum + h, 0) / weeks.length;
};

/**
 * Detecta patrón irregular en horas diarias
 */
const detectIrregularPattern = (timeEntries) => {
  const last30Days = timeEntries.filter(e => {
    const entryDate = safeDate(e.start_time);
    const daysAgo = differenceInDays(new Date(), entryDate); // OK: fecha actual
    return daysAgo <= 30;
  });
  
  // Agrupar por día
  const dailyHours = {};
  last30Days.forEach(entry => {
    const dateKey = extractDate(entry.start_time);
    if (!dailyHours[dateKey]) {
      dailyHours[dateKey] = 0;
    }
    const hours = calculateHours(entry.start_time, entry.end_time);
    dailyHours[dateKey] += hours;
  });
  
  const hours = Object.values(dailyHours);
  if (hours.length < 5) return null; // No hay suficientes datos
  
  const avg = hours.reduce((sum, h) => sum + h, 0) / hours.length;
  const variance = Math.sqrt(
    hours.reduce((sum, h) => sum + Math.pow(h - avg, 2), 0) / hours.length
  );
  
  // Si la variación es mayor a 2 horas, es irregular
  if (variance > 2) {
    return {
      variance,
      recommended: avg
    };
  }
  
  return null;
};

/**
 * Detecta patrón de horas extras frecuentes
 */
const detectOvertimePattern = (timeEntries) => {
  const last30Days = timeEntries.filter(e => {
    const entryDate = safeDate(e.start_time);
    const daysAgo = differenceInDays(new Date(), entryDate); // OK: fecha actual
    return daysAgo <= 30;
  });
  
  // Agrupar por día
  const dailyHours = {};
  last30Days.forEach(entry => {
    const dateKey = extractDate(entry.start_time);
    if (!dailyHours[dateKey]) {
      dailyHours[dateKey] = 0;
    }
    const hours = calculateHours(entry.start_time, entry.end_time);
    dailyHours[dateKey] += hours;
  });
  
  const overtimeDays = Object.values(dailyHours).filter(h => h > 8).length;
  const totalHours = Object.values(dailyHours).reduce((sum, h) => sum + h, 0);
  const avgDaily = totalHours / Object.keys(dailyHours).length;
  
  return {
    frequent: overtimeDays > 5, // Más de 5 días con extras en el mes
    days: overtimeDays,
    avgDaily
  };
};

/**
 * Calcula score de consistencia (0-100)
 */
const calculateConsistency = (timeEntries) => {
  const last30Days = timeEntries.filter(e => {
    const entryDate = safeDate(e.start_time);
    const daysAgo = differenceInDays(new Date(), entryDate); // OK: fecha actual
    return daysAgo <= 30;
  });
  
  if (last30Days.length === 0) return 0;
  
  // Agrupar por día
  const dailyHours = {};
  last30Days.forEach(entry => {
    const dateKey = extractDate(entry.start_time);
    if (!dailyHours[dateKey]) {
      dailyHours[dateKey] = 0;
    }
    const hours = calculateHours(entry.start_time, entry.end_time);
    dailyHours[dateKey] += hours;
  });
  
  const hours = Object.values(dailyHours);
  const avg = hours.reduce((sum, h) => sum + h, 0) / hours.length;
  const stdDev = Math.sqrt(
    hours.reduce((sum, h) => sum + Math.pow(h - avg, 2), 0) / hours.length
  );
  
  // Score: 100 - (desviación estándar * 10), máximo 100
  return Math.max(0, Math.min(100, 100 - (stdDev * 10)));
};

export default evaluateAlerts;
