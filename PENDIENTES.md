# 📋 TAREAS PENDIENTES Y RECOMENDACIONES

> **Actualizado:** 26 de marzo de 2026

---

## ✅ COMPLETADO

### Dashboard
- ✅ Alertas inteligentes integradas
- ✅ Gráfico de tendencia semanal
- ✅ Seguimiento de objetivos
- ✅ Mapa de calor de actividad
- ✅ Componentes funcionando en Dashboard.jsx

### Componentes Creados
- ✅ 13 componentes nuevos
- ✅ 4 utilidades completas
- ✅ 5 documentos técnicos

---

## 🔧 PENDIENTES INMEDIATOS

### 1. Instalar Dependencias Faltantes ⚠️

```bash
cd frontend
npm install recharts xlsx jspdf jspdf-autotable
```

**Estado:** Necesario para que funcionen:
- Gráficos (recharts)
- Exportación Excel (xlsx)
- Exportación PDF (jspdf)

---

### 2. Archivo DashboardImproved.jsx

**Ubicación:** `frontend/src/pages/DashboardImproved.jsx`

**Opciones:**

**A) Mantenerlo como referencia:**
- Es útil para ver cómo se integran todos los componentes juntos
- Sirve de backup si quieres revertir cambios
- **Recomendación:** Dejarlo

**B) Eliminarlo:**
```bash
rm frontend/src/pages/DashboardImproved.jsx
```
- Solo si estás 100% seguro que el Dashboard.jsx actual funciona bien

**Decisión:** ⏳ **Esperar a confirmar que todo funciona**

---

### 3. Integrar Componentes en Reportes

**Archivo:** `frontend/src/pages/Reports.jsx`

**Agregar:**
```jsx
import { ComparativeAnalysis } from '../components/reports/ComparativeAnalysis';
import { ProductivityAnalysis } from '../components/reports/ProductivityAnalysis';
import { exportToExcel } from '../utils/exportToExcel';
import { exportToPDF } from '../utils/exportToPDF';

// En el JSX, agregar nuevas secciones o tabs
```

**Estado:** ⏳ Pendiente de integración

---

### 4. Sistema de Plantillas en TimeEntries

**Archivo:** `frontend/src/pages/TimeEntries.jsx` o `BulkTimeEntry.jsx`

**Agregar:**
```jsx
import { TemplateSelector } from '../components/timeEntry/TemplateSelector';

// Dentro del formulario
<TemplateSelector
  units={units}
  currentTasks={tasks}
  onSelect={(loadedTasks) => setTasks(loadedTasks)}
/>
```

**Estado:** ⏳ Pendiente de integración

---

## 🚀 MEJORAS FUTURAS (No Urgentes)

### Backend para Plantillas
**Prioridad:** Media

Actualmente las plantillas se guardan en `localStorage`. Para compartir entre dispositivos:

1. Crear tabla en DB:
```sql
CREATE TABLE time_entry_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  tasks JSONB NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

2. Crear endpoints:
```javascript
POST   /api/templates
GET    /api/templates
PUT    /api/templates/:id
DELETE /api/templates/:id
```

---

### Persistencia de Objetivos
**Prioridad:** Media

Agregar campo en tabla `users`:
```sql
ALTER TABLE users ADD COLUMN weekly_goal INTEGER DEFAULT 40;
ALTER TABLE users ADD COLUMN monthly_goal INTEGER DEFAULT 160;
```

---

### Notificaciones Push
**Prioridad:** Baja

- Recordatorios diarios
- Alertas de objetivos
- Aprobaciones (si se implementa sistema de aprobación)

**Tecnología:** Service Workers + Web Push API

---

### Sistema de Aprobación
**Prioridad:** Media-Alta (según necesidad del negocio)

1. Agregar campo `status` en `time_entries`:
```sql
ALTER TABLE time_entries 
ADD COLUMN status VARCHAR(20) DEFAULT 'pending_approval';
-- Valores: pending_approval, approved, rejected
```

2. Crear flujo de aprobación
3. Dashboard para supervisores

---

### Reportes Predictivos
**Prioridad:** Baja

- Usar datos históricos
- Proyecciones con ML básico
- Recomendaciones automáticas

---

### Geolocalización
**Prioridad:** Baja (según necesidad)

- Verificar ubicación al registrar
- Configurar zonas permitidas
- Prevenir fraude

---

## 🐛 ISSUES CONOCIDOS

### 1. Vulnerabilidades npm
```
22 vulnerabilities (17 moderate, 5 high) en frontend
2 vulnerabilities (1 moderate, 1 high) en backend
```

**Solución:**
```bash
# Frontend
cd frontend
npm audit fix

# Backend
cd backend
npm audit fix
```

**Estado:** ⚠️ Revisar y aplicar

---

### 2. Lint Errors en TemplateSelector
- Uso de `window.confirm` (funcional pero no ideal)
- Mejor: crear modal de confirmación custom

**Estado:** ⚠️ Funcional, mejorar después

---

## 📊 TESTING PENDIENTE

### Componentes a Probar

- [ ] **WeeklyTrendChart** - Con diferentes cantidades de datos
- [ ] **GoalTracker** - Diferentes estados (alcanzado, cerca, lejos)
- [ ] **SmartAlerts** - Todas las reglas de alertas
- [ ] **ActivityHeatmap** - Con 30 días completos y parciales
- [ ] **ComparativeAnalysis** - Con múltiples períodos
- [ ] **ProductivityAnalysis** - Con datos variados
- [ ] **TemplateSelector** - Guardar, cargar, eliminar

### Testing Manual
1. Crear registros de prueba
2. Verificar que gráficos se actualicen
3. Probar alertas en diferentes horarios
4. Verificar exportación Excel/PDF
5. Probar plantillas

---

## 📝 DOCUMENTACIÓN PENDIENTE

### Para Usuarios Finales
- [ ] Manual de uso del nuevo Dashboard
- [ ] Guía de plantillas
- [ ] Cómo interpretar alertas
- [ ] Cómo usar análisis de productividad

### Para Desarrolladores
- ✅ MAPA_COMPLETO_SISTEMA.md (actualizado)
- ✅ README_MEJORAS.md (completo)
- ✅ IMPLEMENTACION_COMPLETADA.md (completo)
- [ ] Guía de contribución
- [ ] Estándares de código

---

## 🎯 PRIORIZACIÓN RECOMENDADA

### Semana 1 (Ahora)
1. ✅ Instalar dependencias faltantes
2. ✅ Verificar que Dashboard funciona
3. ⏳ Integrar análisis en Reportes
4. ⏳ Agregar plantillas a TimeEntries
5. ⏳ Corregir vulnerabilidades npm

### Semana 2
6. Backend para plantillas
7. Testing completo
8. Documentación de usuario

### Semana 3-4
9. Sistema de aprobación (si se necesita)
10. Persistencia de objetivos
11. Mejoras UX basadas en feedback

---

## 📞 NOTAS IMPORTANTES

### Archivos que NO se deben eliminar
- ✅ `DashboardImproved.jsx` - Mantener como referencia
- ✅ Todos los archivos en `components/dashboard/`
- ✅ Todos los archivos en `components/reports/`
- ✅ Todas las utilidades en `utils/`
- ✅ Documentación en raíz del proyecto

### Archivos Seguros para Limpiar
- Ninguno por ahora (todo es útil)

### Backup Recomendado
Antes de hacer cambios grandes:
```bash
git branch backup-dashboard-$(date +%Y%m%d)
git push origin backup-dashboard-$(date +%Y%m%d)
```

---

## ✨ RESUMEN

### Lo que Funciona Ahora
- ✅ Dashboard con alertas, tendencia, objetivo y mapa de calor
- ✅ Todos los componentes creados y disponibles
- ✅ Documentación completa

### Lo que Falta
- ⏳ Instalar 4 dependencias npm
- ⏳ Integrar en Reportes y TimeEntries
- ⏳ Testing completo
- ⏳ Backend para plantillas (futuro)

### Tiempo Estimado
- **Inmediato (hoy):** 30 minutos (instalar deps + verificar)
- **Esta semana:** 2-4 horas (integrar reportes + plantillas)
- **Próximas semanas:** 8-12 horas (backend + testing + docs)

---

**Última actualización:** 26 de marzo de 2026  
**Próxima revisión:** Después de instalar dependencias y verificar funcionamiento

---

**¿Dudas?** Consulta `README_MEJORAS.md` o `IMPLEMENTACION_COMPLETADA.md`
