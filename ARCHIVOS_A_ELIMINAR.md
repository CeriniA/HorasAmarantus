# 🗑️ ARCHIVOS A ELIMINAR MANUALMENTE

**Fecha:** 16 de Abril de 2026  
**Motivo:** Limpieza de reportes - Eliminar componentes inútiles

---

## ❌ COMPONENTES A ELIMINAR (6 archivos)

Por favor, elimina manualmente los siguientes archivos:

### **1. TimeDistributionReport.jsx**
**Ruta:** `frontend/src/components/reports/TimeDistributionReport.jsx`  
**Motivo:** Mapa de calor sin sentido (registros son de hora inicio a hora fin del día)

### **2. ProductivityAnalysis.jsx**
**Ruta:** `frontend/src/components/reports/ProductivityAnalysis.jsx`  
**Motivo:** Métricas subjetivas que no reflejan productividad real

### **3. AreaVolumeReport.jsx**
**Ruta:** `frontend/src/components/reports/AreaVolumeReport.jsx`  
**Motivo:** Redundante con `ReportTable.jsx` (ya muestra horas por unidad)

### **4. OvertimeReport.jsx**
**Ruta:** `frontend/src/components/reports/OvertimeReport.jsx`  
**Motivo:** Sin jornada laboral estándar definida, no tiene sentido calcular "extras"

### **5. MonthlyTrendsReport.jsx**
**Ruta:** `frontend/src/components/reports/MonthlyTrendsReport.jsx`  
**Motivo:** Redundante con `ReportCharts.jsx` (ya muestra tendencias)

### **6. GoalComplianceReport.jsx**
**Ruta:** `frontend/src/components/reports/GoalComplianceReport.jsx`  
**Motivo:** Reemplazado por `ObjectivesReport.jsx` (nuevo componente con sub-pestañas claras)

---

## ✅ CAMBIOS YA REALIZADOS EN CÓDIGO

### **Reports.jsx - Actualizado:**
- ✅ Eliminados imports de componentes inútiles
- ✅ Eliminadas pestañas: "Volumen por Área", "Horas Extras", "Tendencias", "Distribución Horaria"
- ✅ Simplificado de 8 pestañas a 4:
  1. **Resumen** - Métricas generales + tabla de usuarios + tabla por unidad
  2. **Objetivos** - Cumplimiento de objetivos
  3. **Detalle** - Tabla completa de registros
  4. **Comparativas** - Análisis comparativo

### **Iconos actualizados:**
- ✅ Eliminados iconos no usados: `TrendingUp`, `AlertTriangle`, `LineChart`, `Clock`
- ✅ Mantenidos: `BarChart2`, `Target`, `FileText`, `Users`

---

## 📊 ANTES vs DESPUÉS

### **ANTES (8 pestañas):**
1. Resumen
2. Volumen por Área ❌
3. Horas Extras ❌
4. Tendencias ❌
5. Objetivos
6. Distribución Horaria ❌
7. Detalle
8. Análisis Comparativo

### **DESPUÉS (4 pestañas):**
1. ✅ Resumen (incluye todo lo útil)
2. ✅ Objetivos
3. ✅ Detalle
4. ✅ Comparativas

**Reducción:** 50% menos pestañas, 100% más claro

---

## 🎯 PRÓXIMOS PASOS

Una vez eliminados los archivos:

### **FASE 2: Rediseñar Objetivos**
- Separar objetivos en sub-pestañas:
  - Empresa (COMPANY)
  - Asignados (ASSIGNED)
  - Personales (PERSONAL) - Solo admin

### **FASE 3: Mejorar Métricas**
- Agregar contexto a promedios
- Especificar base de porcentajes
- Calcular "días trabajados"

---

## ✅ VERIFICACIÓN

Después de eliminar los archivos, verifica que no haya errores:

```bash
# Buscar referencias a componentes eliminados
grep -r "TimeDistributionReport" frontend/src/
grep -r "ProductivityAnalysis" frontend/src/
grep -r "AreaVolumeReport" frontend/src/
grep -r "OvertimeReport" frontend/src/
grep -r "MonthlyTrendsReport" frontend/src/
```

**Resultado esperado:** Solo comentarios en `Reports.jsx`, no imports ni uso.

---

**¿Listo para continuar con FASE 2 (Rediseño de Objetivos)?**
