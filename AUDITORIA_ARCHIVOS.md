# 🔍 AUDITORÍA DE ARCHIVOS DEL SISTEMA

> **Fecha:** 26 de marzo de 2026  
> **Propósito:** Identificar archivos en uso, obsoletos y duplicados

---

## 📊 RESUMEN EJECUTIVO

### Archivos a ELIMINAR: 2
- ❌ `frontend/src/pages/BulkTimeEntry.jsx` (OBSOLETO - no se usa)
- ❌ `frontend/src/pages/DashboardImproved.jsx` (DUPLICADO - no se usa)

### Archivos en USO: 7 páginas + 1 componente
- ✅ Todos los demás archivos están activos

---

## 📁 PÁGINAS (frontend/src/pages/)

### ✅ EN USO (7 archivos)

#### 1. **Login.jsx**
- **Ruta:** `/login`
- **Uso:** Autenticación de usuarios
- **Estado:** ✅ ACTIVO
- **Importado en:** `App.jsx`

#### 2. **Dashboard.jsx**
- **Ruta:** `/`
- **Uso:** Dashboard principal con métricas y gráficos
- **Estado:** ✅ ACTIVO
- **Importado en:** `App.jsx`
- **Componentes usados:**
  - WeeklyTrendChart
  - SmartAlerts
  - ActivityHeatmap
  - GoalTracker

#### 3. **TimeEntries.jsx**
- **Ruta:** `/time-entries`
- **Uso:** Lista de registros de horas + modal de carga
- **Estado:** ✅ ACTIVO
- **Importado en:** `App.jsx`
- **Componentes usados:**
  - BulkTimeEntry (componente modal)

#### 4. **Reports.jsx**
- **Ruta:** `/reports`
- **Uso:** Reportes con tabs (General, Eficiencia, Horas Extras, etc.)
- **Estado:** ✅ ACTIVO
- **Importado en:** `App.jsx`
- **Componentes usados:**
  - ReportFilters, ReportMetrics, ReportCharts, ReportTable
  - ComparativeAnalysis, ProductivityAnalysis
  - AreaEfficiencyReport, OvertimeReport
  - MonthlyTrendsReport, GoalComplianceReport
  - TimeDistributionReport

#### 5. **OrganizationalUnits.jsx**
- **Ruta:** `/organizational-units`
- **Uso:** Gestión de áreas/procesos
- **Estado:** ✅ ACTIVO
- **Importado en:** `App.jsx`

#### 6. **UserManagement.jsx**
- **Ruta:** `/users`
- **Uso:** Administración de usuarios
- **Estado:** ✅ ACTIVO
- **Importado en:** `App.jsx`

#### 7. **Settings.jsx**
- **Ruta:** `/settings`
- **Uso:** Configuración del sistema
- **Estado:** ✅ ACTIVO
- **Importado en:** `App.jsx`

---

### ❌ OBSOLETOS (2 archivos)

#### 1. **BulkTimeEntry.jsx** ❌ ELIMINAR
- **Ruta definida:** `/time-entries/bulk`
- **Problema:** Es una PÁGINA completa que NO se usa
- **Confusión:** Existe un COMPONENTE con el mismo nombre que SÍ se usa
- **Ubicación del componente activo:** `frontend/src/components/timeEntry/BulkTimeEntry.jsx`
- **Razón:** Duplicado obsoleto, la funcionalidad está en el componente modal
- **Acción:** ELIMINAR archivo y ruta de App.jsx

#### 2. **DashboardImproved.jsx** ❌ ELIMINAR
- **Ruta:** NO tiene (nunca se registró)
- **Problema:** Dashboard "mejorado" que nunca se usó
- **Razón:** Se hicieron las mejoras directamente en Dashboard.jsx
- **Acción:** ELIMINAR archivo

---

## 🧩 COMPONENTES (frontend/src/components/)

### ✅ EN USO

#### timeEntry/
- ✅ **BulkTimeEntry.jsx** - Modal de carga múltiple (usado en TimeEntries.jsx)
- ✅ **TemplateSelector.jsx** - Selector de plantillas

#### dashboard/
- ✅ **WeeklyTrendChart.jsx** - Gráfico de tendencia semanal
- ✅ **SmartAlerts.jsx** - Alertas inteligentes
- ✅ **ActivityHeatmap.jsx** - Mapa de calor de actividad
- ✅ **GoalTracker.jsx** - Seguimiento de objetivos
- ✅ **MetricCardWithComparison.jsx** - Card de métrica con comparación

#### reports/
- ✅ **ReportFilters.jsx** - Filtros de reportes
- ✅ **ReportMetrics.jsx** - Métricas de reportes
- ✅ **ReportCharts.jsx** - Gráficos de reportes
- ✅ **ReportTable.jsx** - Tabla de reportes
- ✅ **ComparativeAnalysis.jsx** - Análisis comparativo
- ✅ **ProductivityAnalysis.jsx** - Análisis de productividad
- ✅ **AreaEfficiencyReport.jsx** - Reporte de eficiencia por área
- ✅ **OvertimeReport.jsx** - Reporte de horas extras
- ✅ **MonthlyTrendsReport.jsx** - Tendencias mensuales
- ✅ **GoalComplianceReport.jsx** - Cumplimiento de objetivos
- ✅ **TimeDistributionReport.jsx** - Distribución horaria

#### common/
- ✅ **Card.jsx** - Componente de tarjeta
- ✅ **Button.jsx** - Componente de botón
- ✅ **Input.jsx** - Componente de input
- ✅ **Modal.jsx** - Componente de modal
- ✅ **Alert.jsx** - Componente de alerta

#### layout/
- ✅ **Layout.jsx** - Layout principal
- ✅ **Sidebar.jsx** - Barra lateral
- ✅ **Header.jsx** - Encabezado

---

## 🗺️ RUTAS ACTIVAS (App.jsx)

```javascript
✅ /                          → Dashboard.jsx
✅ /login                     → Login.jsx
✅ /time-entries              → TimeEntries.jsx
❌ /time-entries/bulk         → BulkTimeEntry.jsx (ELIMINAR)
✅ /reports                   → Reports.jsx
✅ /organizational-units      → OrganizationalUnits.jsx
✅ /users                     → UserManagement.jsx
✅ /settings                  → Settings.jsx
```

---

## 🔧 ACCIONES A REALIZAR

### 1. Eliminar Archivos Obsoletos

```bash
# Eliminar página obsoleta BulkTimeEntry
rm frontend/src/pages/BulkTimeEntry.jsx

# Eliminar dashboard duplicado
rm frontend/src/pages/DashboardImproved.jsx
```

### 2. Limpiar App.jsx

**Remover imports:**
```javascript
// ELIMINAR esta línea:
import BulkTimeEntry from './pages/BulkTimeEntry';
```

**Remover ruta:**
```javascript
// ELIMINAR este bloque:
<Route
  path="/time-entries/bulk"
  element={
    <ProtectedRoute>
      <Layout>
        <BulkTimeEntry />
      </Layout>
    </ProtectedRoute>
  }
/>
```

### 3. Verificar que no rompa nada

**Componente BulkTimeEntry (modal) sigue funcionando:**
- ✅ Está en `frontend/src/components/timeEntry/BulkTimeEntry.jsx`
- ✅ Se usa en `TimeEntries.jsx`
- ✅ NO se ve afectado por eliminar la página

---

## 📋 ESTRUCTURA CORRECTA FINAL

```
frontend/src/
├── pages/                          (7 archivos)
│   ├── Login.jsx                   ✅
│   ├── Dashboard.jsx               ✅
│   ├── TimeEntries.jsx             ✅
│   ├── Reports.jsx                 ✅
│   ├── OrganizationalUnits.jsx     ✅
│   ├── UserManagement.jsx          ✅
│   └── Settings.jsx                ✅
│
├── components/
│   ├── timeEntry/
│   │   ├── BulkTimeEntry.jsx       ✅ (modal)
│   │   └── TemplateSelector.jsx    ✅
│   │
│   ├── dashboard/                  (6 componentes)
│   ├── reports/                    (11 componentes)
│   ├── common/                     (5 componentes)
│   └── layout/                     (3 componentes)
│
├── hooks/                          ✅
├── context/                        ✅
├── services/                       ✅
├── utils/                          ✅
└── offline/                        ✅
```

---

## ⚠️ IMPORTANTE

### NO Confundir:

**PÁGINA (obsoleta):**
- ❌ `frontend/src/pages/BulkTimeEntry.jsx`
- Era una página completa
- Ruta: `/time-entries/bulk`
- **ELIMINAR**

**COMPONENTE (activo):**
- ✅ `frontend/src/components/timeEntry/BulkTimeEntry.jsx`
- Es un modal
- Se usa dentro de TimeEntries.jsx
- **MANTENER**

---

## 🎯 FLUJO CORRECTO DE CARGA DE HORAS

### Como está AHORA (correcto):

1. Usuario va a `/time-entries` (TimeEntries.jsx)
2. Click en "Cargar Múltiples Horas"
3. Se abre MODAL (BulkTimeEntry componente)
4. Usuario carga horas con rango horario
5. Guarda y cierra modal

### Como estaba ANTES (confuso):

1. Había una PÁGINA en `/time-entries/bulk` (BulkTimeEntry página)
2. Había un COMPONENTE modal (BulkTimeEntry componente)
3. Ambos con el mismo nombre
4. Solo se usaba el componente
5. La página nunca se usó

---

## 📊 ESTADÍSTICAS

### Archivos Totales:
- **Páginas:** 7 activas + 2 obsoletas = 9 total
- **Componentes:** ~30 activos
- **Total a eliminar:** 2 archivos

### Impacto de la Limpieza:
- ✅ Elimina confusión de nombres duplicados
- ✅ Reduce tamaño del bundle
- ✅ Mejora claridad del código
- ✅ Sin riesgo (archivos no usados)

---

## ✅ CHECKLIST DE LIMPIEZA

- [ ] Eliminar `frontend/src/pages/BulkTimeEntry.jsx`
- [ ] Eliminar `frontend/src/pages/DashboardImproved.jsx`
- [ ] Remover import de BulkTimeEntry en App.jsx
- [ ] Remover ruta `/time-entries/bulk` en App.jsx
- [ ] Verificar que TimeEntries.jsx sigue funcionando
- [ ] Verificar que el modal de carga sigue funcionando
- [ ] Hacer commit de la limpieza

---

## 🔍 CÓMO VERIFICAR

### Después de eliminar:

1. **Verificar que compila:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Verificar funcionalidad:**
   - ✅ Dashboard carga correctamente
   - ✅ TimeEntries carga correctamente
   - ✅ Modal de carga múltiple funciona
   - ✅ Rango horario aparece en el modal
   - ✅ Reportes funcionan

3. **Verificar rutas:**
   - ✅ `/` funciona
   - ✅ `/time-entries` funciona
   - ❌ `/time-entries/bulk` da 404 (correcto)

---

**Última actualización:** 26 de marzo de 2026, 21:30  
**Estado:** PENDIENTE DE LIMPIEZA
