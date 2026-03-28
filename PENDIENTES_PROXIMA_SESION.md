# 📋 PENDIENTES - PRÓXIMA SESIÓN

**Fecha:** 27 de marzo de 2026  
**Última actualización:** 26 de marzo de 2026 - 22:48

---

## 🔴 ALTA PRIORIDAD

### 1. Endpoint para Guardar Objetivo de Horas ⭐ CRÍTICO
**Estado:** Pendiente  
**Descripción:** Crear endpoint en backend para persistir `weekly_goal` del usuario en la DB.

**Backend:**
```javascript
// routes/users.js
router.put('/me/goal', async (req, res) => {
  const { weekly_goal } = req.body;
  
  // Validar
  if (!weekly_goal || weekly_goal < 1 || weekly_goal > 168) {
    return res.status(400).json({ error: 'Objetivo inválido' });
  }
  
  // Actualizar en DB
  const { data, error } = await supabase
    .from('users')
    .update({ weekly_goal })
    .eq('id', req.user.id)
    .select()
    .single();
    
  if (error) throw error;
  
  res.json({ user: data });
});
```

**Frontend:**
```javascript
// services/api.js
export const authService = {
  // ... otros métodos
  updateWeeklyGoal: (weekly_goal) => api.put('/auth/me/goal', { weekly_goal }),
};

// pages/Settings.jsx - reemplazar línea 240
const response = await authService.updateWeeklyGoal(goalData.weekly_goal);
setUser(response.user);
```

**Archivos a modificar:**
- `backend/src/routes/users.js` o `auth.js`
- `frontend/src/services/api.js`
- `frontend/src/pages/Settings.jsx`

---

### 2. Reinicio Semanal de Objetivos
**Estado:** Pendiente  
**Descripción:** Verificar si los objetivos se reinician correctamente cada semana (lunes).

**Verificar:**
- ✅ `GoalTracker.jsx` ya usa `startOfWeek` y `endOfWeek` con `weekStartsOn: 1` (lunes)
- ✅ El cálculo de progreso se hace sobre la semana actual
- ⚠️ **FALTA:** Verificar que el lunes se resetee correctamente el progreso visual

**Posible mejora:**
```javascript
// Agregar indicador visual cuando empieza nueva semana
const isNewWeek = isSameDay(today, startOfWeek(today, { weekStartsOn: 1 }));

{isNewWeek && (
  <div className="bg-blue-50 p-3 rounded-lg mb-4">
    <p className="text-sm text-blue-800">
      🎯 ¡Nueva semana! Tu objetivo es {targetHours}h
    </p>
  </div>
)}
```

**Archivos a revisar:**
- `frontend/src/components/dashboard/GoalTracker.jsx`

---

## 🟡 MEDIA PRIORIDAD

### 3. Nuevas Funcionalidades a Evaluar

#### 3.1 Historial de Objetivos Cumplidos
**Descripción:** Ver un historial de semanas/meses con % de cumplimiento.

**Mockup:**
```
Semana del 18-24 Mar: ✅ 42/40h (105%)
Semana del 11-17 Mar: ⚠️ 35/40h (87%)
Semana del 04-10 Mar: ✅ 41/40h (102%)
```

**Implementación:**
- Nueva tabla `goal_history` en DB
- Endpoint para obtener historial
- Componente `GoalHistory.jsx`

---

#### 3.2 Notificaciones de Progreso
**Descripción:** Alertas inteligentes sobre el progreso del objetivo.

**Ejemplos:**
- 🔴 "Llevas 20h y quedan 2 días. Necesitas 10h/día para cumplir"
- 🟡 "Vas bien! 30h en 3 días, mantén el ritmo"
- 🟢 "¡Objetivo cumplido! Ya trabajaste 40h esta semana"

**Implementación:**
- Agregar lógica en `utils/alertRules.js`
- Integrar con `SmartAlerts.jsx`

---

#### 3.3 Comparación con Semanas Anteriores
**Descripción:** Gráfico comparativo de rendimiento semanal.

**Mockup:**
```
Semana Actual:  ████████░░ 32h
Semana Pasada:  ██████████ 40h
Promedio 4 sem: ████████░░ 38h
```

**Implementación:**
- Componente `WeeklyComparison.jsx`
- Usar datos de `timeEntries` agrupados por semana

---

#### 3.4 Exportar Reportes Personalizados
**Descripción:** Permitir exportar reportes con filtros personalizados.

**Funcionalidades:**
- Filtrar por rango de fechas
- Filtrar por área/proceso
- Exportar a PDF/Excel/CSV
- Incluir gráficos en PDF

**Implementación:**
- Mejorar `utils/exportToPDF.js`
- Agregar opciones de filtro en `Reports.jsx`

---

#### 3.5 Dashboard Móvil Optimizado
**Descripción:** Versión mobile-first del dashboard.

**Mejoras:**
- Cards más compactas
- Gráficos responsive
- Navegación por tabs en móvil
- Acciones rápidas (FAB)

**Implementación:**
- Refactorizar `Dashboard.jsx`
- Usar breakpoints de Tailwind
- Componentes específicos para móvil

---

#### 3.6 Modo Oscuro
**Descripción:** Tema oscuro para la aplicación.

**Implementación:**
- Context `ThemeContext`
- Toggle en Settings
- Clases dark: de Tailwind
- Persistir preferencia en localStorage

---

#### 3.7 Plantillas de Jornada
**Descripción:** Guardar plantillas de distribución de horas.

**Ejemplo:**
```
Plantilla "Día Normal":
- Deshierbe: 4h
- Siembra: 2h
- Riego: 2h
Total: 8h
```

**Implementación:**
- Tabla `time_templates` en DB
- CRUD de plantillas
- Botón "Aplicar plantilla" en `BulkTimeEntry.jsx`

---

#### 3.8 Recordatorios de Carga
**Descripción:** Recordar al usuario cargar horas si no lo hizo.

**Funcionalidades:**
- Notificación si no cargó horas hoy (después de las 18hs)
- Email recordatorio (opcional)
- Configurar en Settings

**Implementación:**
- Cron job en backend
- Sistema de notificaciones
- Configuración en Settings

---

## 🟢 BAJA PRIORIDAD

### 4. Mejoras de UX

- [ ] Animaciones de transición entre páginas
- [ ] Skeleton loaders mientras carga
- [ ] Tooltips informativos
- [ ] Onboarding para nuevos usuarios
- [ ] Atajos de teclado
- [ ] Búsqueda global (Cmd+K)

---

### 5. Optimizaciones de Performance

- [ ] Lazy loading de componentes
- [ ] Virtualización de listas largas
- [ ] Caché de queries frecuentes
- [ ] Service Worker para PWA
- [ ] Optimización de imágenes

---

### 6. Testing

- [ ] Tests unitarios (Vitest)
- [ ] Tests de integración
- [ ] Tests E2E (Playwright)
- [ ] Coverage > 80%

---

## 📊 MÉTRICAS DE PROGRESO

**Completado esta sesión:**
- ✅ Sistema de alertas con snooze
- ✅ Navbar responsive arreglado
- ✅ Helpers de fechas implementados
- ✅ TimeEntries con fechas correctas
- ✅ Reports con fechas correctas
- ✅ Días laborables sin domingo
- ✅ UI para cambiar objetivo de horas
- ✅ Filtro de tareas con 0 horas
- ✅ Eliminación bulk optimizada

**Pendiente:**
- ⏳ Endpoint para guardar objetivo
- ⏳ Verificar reinicio semanal
- ⏳ Evaluar nuevas funcionalidades

---

## 🎯 PLAN PARA MAÑANA

### Sesión 1 (30 min)
1. Crear endpoint `PUT /auth/me/goal`
2. Conectar Settings con el endpoint
3. Probar guardado y persistencia

### Sesión 2 (30 min)
4. Verificar reinicio semanal de objetivos
5. Agregar indicador visual de nueva semana
6. Probar con diferentes fechas

### Sesión 3 (1 hora)
7. Evaluar funcionalidades prioritarias
8. Decidir cuál implementar primero
9. Planificar implementación

---

## 📝 NOTAS

- El sistema de fechas ya está arreglado con helpers
- Las alertas ahora tienen snooze persistente
- El navbar es responsive
- Falta arreglar otros archivos con helpers de fechas (ver `ARREGLO_FECHAS_PENDIENTE.md`)

---

**Próxima sesión:** 27 de marzo de 2026  
**Prioridad #1:** Endpoint para objetivo de horas  
**Prioridad #2:** Verificar reinicio semanal
