# 📚 INVENTARIO COMPLETO DE DOCUMENTACIÓN

## 🎯 ARCHIVOS CON REGLAS CRÍTICAS (USAR SIEMPRE)

### ⭐ 1. `ESTANDARES_DESARROLLO.md` ⭐
**Estado:** ✅ ACTUALIZADO (29/03/2026)  
**Propósito:** Reglas estrictas de código  
**Contenido:**
- ❌ NUNCA: Hardcodear, duplicar código, verificar roles inline, usar hooks en orden incorrecto
- ✅ SIEMPRE: Usar constantes, helpers, custom hooks, componentes reutilizables
- Orden correcto de hooks: useState → useCallback → useEffect
- Patrones de código
- Checklist antes de commit

**Uso:** Leer ANTES de escribir cualquier código

---

### ⭐ 2. `REGLAS_FECHAS_TIMESTAMPS.md` ⭐
**Estado:** ✅ VIGENTE  
**Propósito:** Manejo correcto de fechas  
**Contenido:**
- ❌ NUNCA usar `new Date()` directamente con timestamps de DB
- ✅ SIEMPRE usar helpers de `utils/dateHelpers.js`
- Helpers: `calculateHours()`, `extractDate()`, `safeDate()`, `isDateInRange()`
- Problema de zona horaria explicado
- Ejemplos de uso correcto

**Uso:** Leer cuando trabajes con fechas

---

### ⭐ 3. `PERMISOS_Y_CAPACIDADES_POR_ROL.md` ⭐
**Estado:** ✅ VIGENTE  
**Propósito:** Definición de permisos por rol  
**Contenido:**
- Operario: qué puede y no puede hacer
- Admin: permisos y limitaciones
- SuperAdmin: permisos totales
- Reglas de acceso a datos
- Filtrado por rol

**Uso:** Leer cuando implementes verificaciones de permisos

---

### ⭐ 4. `SOLUCION_DEFINITIVA_OFFLINE.md` ⭐
**Estado:** ✅ VIGENTE  
**Propósito:** Arquitectura offline/online  
**Contenido:**
- Backend = fuente de verdad
- IndexedDB solo para pendientes
- NO cachear datos del backend
- Flujo de sincronización
- Prevención de duplicados

**Uso:** Leer cuando trabajes con sincronización offline

---

### ⭐ 5. `ACCESO_DATOS_POR_ROL.md` ⭐
**Estado:** ✅ VIGENTE  
**Propósito:** Reglas de acceso a datos  
**Contenido:**
- Operario: solo sus datos
- Admin: todos excepto otros admins
- SuperAdmin: todos los datos
- Filtrado en backend y frontend

**Uso:** Leer cuando implementes filtros de datos

---

## 📖 DOCUMENTACIÓN DE REFERENCIA (CONSULTAR CUANDO NECESITES)

### 6. `ACTUALIZACION_ESTANDARES.md`
**Estado:** ✅ ACTUALIZADO (29/03/2026)  
**Propósito:** Resumen de última actualización de estándares  
**Contenido:** Nuevas reglas agregadas (orden de hooks)

### 7. `FIX_LINT_ERRORS.md`
**Estado:** ✅ ACTUALIZADO (29/03/2026)  
**Propósito:** Errores corregidos y lecciones aprendidas  
**Contenido:** 5 errores corregidos con explicaciones

### 8. `REFACTORIZACION_COMPLETADA.md`
**Estado:** ✅ ACTUALIZADO (29/03/2026)  
**Propósito:** Resumen de refactorización  
**Contenido:** Componentes refactorizados, antes/después

### 9. `RESUMEN_REFACTORIZACION.md`
**Estado:** ✅ ACTUALIZADO (29/03/2026)  
**Propósito:** Resumen ejecutivo de refactorización  
**Contenido:** Métricas, impacto, beneficios

### 10. `REFACTORIZACION_CODIGO_LIMPIO.md`
**Estado:** ✅ VIGENTE  
**Propósito:** Plan de refactorización  
**Contenido:** Análisis de problemas y soluciones

### 11. `MAPA_COMPLETO_SISTEMA.md`
**Estado:** ✅ VIGENTE  
**Propósito:** Arquitectura del sistema  
**Contenido:** Estructura de archivos, flujos, componentes

### 12. `ESTRUCTURA_DATOS_API.md`
**Estado:** ✅ VIGENTE  
**Propósito:** Estructura de datos de la API  
**Contenido:** Schemas de usuarios, time entries, org units

### 13. `INICIAR_DEV.md`
**Estado:** ✅ VIGENTE  
**Propósito:** Guía para iniciar desarrollo  
**Contenido:** Comandos para levantar backend y frontend

### 14. `CHECKLIST_PWA.md`
**Estado:** ✅ VIGENTE  
**Propósito:** Checklist para PWA  
**Contenido:** Verificaciones de PWA, manifest, service worker

### 15. `GUIA_INSTALAR_PWA.md`
**Estado:** ✅ VIGENTE  
**Propósito:** Guía de instalación de PWA  
**Contenido:** Pasos para instalar en móvil y desktop

---

## 📝 DOCUMENTACIÓN HISTÓRICA (REFERENCIA)

### Fixes Aplicados:
- `FIX_DUPLICADOS_FINAL.md` - Fix de duplicados
- `FIX_MODO_OFFLINE_DUPLICADOS.md` - Fix offline
- `FIX_PANTALLA_BLANCO_OFFLINE_FINAL.md` - Fix pantalla blanca
- `FIX_INVALID_TIME_VALUE.md` - Fix fechas
- `FIX_DASHBOARD_DATOS_MEZCLADOS.md` - Fix dashboard
- `FIX_INTEGRIDAD_USER_ID.md` - Fix user_id
- `FIX_HISTORIAL_USUARIOS_NUEVOS.md` - Fix historial

### Análisis:
- `ANALISIS_SISTEMA_OFFLINE.md` - Análisis offline
- `ANALISIS_REPORTES_Y_DB.md` - Análisis reportes

### Implementaciones:
- `IMPLEMENTACION_REPORTES_DB.md` - Reportes implementados
- `REPORTES_IMPLEMENTADOS.md` - Lista de reportes
- `FUNCIONALIDADES_IMPLEMENTADAS_HOY.md` - Features del día

### Limpiezas:
- `LIMPIEZA_COMPLETADA_28MAR.md` - Limpieza código
- `LIMPIEZA_FINAL_COMPLETA.md` - Limpieza final
- `RESUMEN_LIMPIEZA_CODIGO.md` - Resumen limpieza

---

## ❌ ARCHIVOS OBSOLETOS / NO USAR

### Pendientes Antiguos (Ya resueltos):
- ❌ `PENDIENTES.md` - Pendientes viejos
- ❌ `PENDIENTES_PROXIMA_SESION.md` - Sesión pasada
- ❌ `ARREGLO_FECHAS_PENDIENTE.md` - Ya arreglado
- ❌ `ARREGLAR_PDF.md` - Ya arreglado
- ❌ `MIGRACIONES_DB_PENDIENTES.md` - Ya aplicadas
- ❌ `MIGRACION_OBJETIVOS.md` - Ya migrado
- ❌ `REPORTES_PENDIENTES_CODIGO.md` - Ya implementado

### Troubleshooting Viejos (Problemas ya resueltos):
- ❌ `TROUBLESHOOTING_PWA_PANTALLA_BLANCA.md` - Ya resuelto
- ❌ `FIX_PWA_PANTALLA_BLANCA.md` - Ya resuelto
- ❌ `FIX_USER_ID_TIME_ENTRIES.md` - Ya resuelto

### Propuestas (Ya implementadas o descartadas):
- ❌ `PROPUESTA_TESTING.md` - Pendiente de implementar
- ❌ `SEPARACION_REGISTROS_VS_REPORTES.md` - Ya implementado

### Otros:
- ❌ `AUDITORIA_ARCHIVOS.md` - Auditoría vieja
- ❌ `FIXES_APLICADOS.md` - Lista vieja de fixes
- ❌ `RESUMEN_MEJORAS.md` - Resumen viejo
- ❌ `RESUMEN_FINAL_MEJORAS_OFFLINE.md` - Resumen viejo
- ❌ `REVISION_RUTAS_BACKEND.md` - Revisión vieja
- ❌ `ESTADO_FINAL_BACKEND.md` - Estado viejo
- ❌ `REPORTES_OPERARIOS_Y_CREATED_AT.md` - Ya implementado
- ❌ `SOLUCION_CONECTIVIDAD.md` - Ya resuelto

---

## 📂 CARPETA TEMPLATE (No usar)

Archivos de template del proyecto base:
- ❌ `TEMPLATE/README.md`
- ❌ `TEMPLATE/GUIA_COMPLETA_PROYECTO_BASE.md`
- ❌ `TEMPLATE/BUENAS_PRACTICAS_DEFINITIVAS.md`

**Nota:** Estos son del template original, no del proyecto actual.

---

## 📂 CARPETA DOCS (Guías de deployment)

### ✅ Usar cuando sea necesario:
- `docs/CREAR_SUPERADMIN.md` - Crear superadmin en producción
- `docs/DEPLOY_RENDER.md` - Deploy en Render
- `docs/INSTALAR_PWA.md` - Instalar PWA

---

## 🎯 RESUMEN EJECUTIVO

### 📌 ARCHIVOS CRÍTICOS (Leer siempre):
1. ⭐ `ESTANDARES_DESARROLLO.md` - Reglas de código
2. ⭐ `REGLAS_FECHAS_TIMESTAMPS.md` - Manejo de fechas
3. ⭐ `PERMISOS_Y_CAPACIDADES_POR_ROL.md` - Permisos
4. ⭐ `SOLUCION_DEFINITIVA_OFFLINE.md` - Arquitectura offline
5. ⭐ `ACCESO_DATOS_POR_ROL.md` - Acceso a datos

### 📖 CONSULTAR CUANDO NECESITES:
- `MAPA_COMPLETO_SISTEMA.md` - Arquitectura
- `ESTRUCTURA_DATOS_API.md` - Schemas
- `INICIAR_DEV.md` - Comandos
- `CHECKLIST_PWA.md` - PWA
- `FIX_LINT_ERRORS.md` - Errores comunes

### 🗑️ ARCHIVOS OBSOLETOS:
- 20+ archivos de pendientes/fixes viejos
- Carpeta TEMPLATE completa
- Troubleshooting de problemas ya resueltos

---

## 🧹 RECOMENDACIÓN DE LIMPIEZA

### Archivos a mover a carpeta `_archive/`:
```bash
mkdir _archive
mv PENDIENTES*.md _archive/
mv ARREGLO_*.md _archive/
mv MIGRACION*.md _archive/
mv TROUBLESHOOTING*.md _archive/
mv FIX_PWA*.md _archive/
mv FIX_USER_ID*.md _archive/
mv AUDITORIA*.md _archive/
mv FIXES_APLICADOS.md _archive/
mv RESUMEN_MEJORAS.md _archive/
mv REVISION_RUTAS*.md _archive/
mv ESTADO_FINAL*.md _archive/
mv REPORTES_OPERARIOS*.md _archive/
mv REPORTES_PENDIENTES*.md _archive/
mv SEPARACION*.md _archive/
mv SOLUCION_CONECTIVIDAD.md _archive/
```

### Archivos a eliminar (template):
```bash
rm -rf TEMPLATE/
```

---

## ✅ CHECKLIST DE DOCUMENTACIÓN

Antes de escribir código, verificar:
- [ ] Leí `ESTANDARES_DESARROLLO.md`
- [ ] Si trabajo con fechas, leí `REGLAS_FECHAS_TIMESTAMPS.md`
- [ ] Si trabajo con permisos, leí `PERMISOS_Y_CAPACIDADES_POR_ROL.md`
- [ ] Si trabajo con offline, leí `SOLUCION_DEFINITIVA_OFFLINE.md`
- [ ] Consulté `MAPA_COMPLETO_SISTEMA.md` para entender arquitectura

---

**Última actualización:** 29 de marzo de 2026  
**Total de archivos MD:** 52  
**Archivos críticos:** 5  
**Archivos de referencia:** 10  
**Archivos obsoletos:** 20+  
**Archivos template:** 3
