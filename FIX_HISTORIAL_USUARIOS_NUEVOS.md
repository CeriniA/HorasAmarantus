# 🔧 FIX: Historial limitado según fecha de creación del usuario

## 🎯 PROBLEMA

**Escenario:**  
Un usuario que comenzó a trabajar HOY ve en su dashboard:
- Comparación de las últimas 4 semanas (cuando solo lleva 1 día)
- Historial de objetivos de las últimas 8 semanas (cuando no existía)

**Resultado:** Datos vacíos o sin sentido que confunden al usuario nuevo.

---

## ✅ SOLUCIÓN IMPLEMENTADA

### Lógica Inteligente

**Calcular semanas desde creación:**
```javascript
const userCreatedDate = new Date(user.created_at);
const weeksSinceCreation = differenceInWeeks(today, userCreatedDate);
```

**Limitar semanas mostradas:**
```javascript
// Máximo 4 semanas, o las que el usuario ha existido
maxWeeks = Math.min(4, Math.max(1, weeksSinceCreation + 1));
```

---

## 📊 COMPONENTES ACTUALIZADOS

### 1. WeeklyComparison

**Antes:**
```javascript
// Siempre mostraba 4 semanas
for (let i = 0; i < 4; i++) {
  // ...
}
```

**Después:**
```javascript
// Calcula cuántas semanas mostrar
let maxWeeks = 4;
if (user?.created_at) {
  const weeksSinceCreation = differenceInWeeks(today, userCreatedDate);
  maxWeeks = Math.min(4, Math.max(1, weeksSinceCreation + 1));
}

for (let i = 0; i < maxWeeks; i++) {
  // ...
}
```

**Ejemplos:**
- Usuario creado hace 1 día → Muestra 1 semana (actual)
- Usuario creado hace 2 semanas → Muestra 2 semanas
- Usuario creado hace 6 meses → Muestra 4 semanas (máximo)

---

### 2. GoalHistory

**Antes:**
```javascript
// Siempre mostraba 8 semanas
for (let i = 1; i <= 8; i++) {
  // ...
}
```

**Después:**
```javascript
// Calcula cuántas semanas mostrar
let maxWeeks = 8;
if (user?.created_at) {
  const weeksSinceCreation = differenceInWeeks(today, userCreatedDate);
  maxWeeks = Math.min(8, Math.max(0, weeksSinceCreation));
}

// Si es muy nuevo, muestra mensaje de bienvenida
if (maxWeeks === 0) {
  return (
    <div className="text-center py-8">
      <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 text-sm">
        ¡Bienvenido! Completa tu primera semana para ver tu historial de objetivos.
      </p>
    </div>
  );
}

for (let i = 1; i <= maxWeeks; i++) {
  // ...
}
```

**Ejemplos:**
- Usuario creado hace 1 día → Mensaje de bienvenida
- Usuario creado hace 2 semanas → Muestra 1 semana (excluye actual)
- Usuario creado hace 10 semanas → Muestra 8 semanas (máximo)

---

## 🎨 EXPERIENCIA DE USUARIO

### Usuario Nuevo (< 1 semana)

**Dashboard muestra:**

```
┌─────────────────────────────────┐
│ Comparación Semanal             │
├─────────────────────────────────┤
│ Esta semana: 8h                 │
│ (Solo 1 semana visible)         │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Historial de Objetivos          │
├─────────────────────────────────┤
│ 🏆                              │
│ ¡Bienvenido!                    │
│ Completa tu primera semana      │
│ para ver tu historial           │
└─────────────────────────────────┘
```

---

### Usuario con 2 Semanas

**Dashboard muestra:**

```
┌─────────────────────────────────┐
│ Comparación Semanal             │
├─────────────────────────────────┤
│ Esta semana: 40h                │
│ Hace 1 semana: 38h              │
│ (2 semanas visibles)            │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Historial de Objetivos          │
│ Últimas 1 semanas               │
├─────────────────────────────────┤
│ ✅ Semana 1: 38h (95%)          │
└─────────────────────────────────┘
```

---

### Usuario Antiguo (> 8 semanas)

**Dashboard muestra:**

```
┌─────────────────────────────────┐
│ Comparación Semanal             │
├─────────────────────────────────┤
│ Esta semana: 40h                │
│ Hace 1 semana: 42h              │
│ Hace 2 semanas: 38h             │
│ Hace 3 semanas: 40h             │
│ (4 semanas - máximo)            │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Historial de Objetivos          │
│ Últimas 8 semanas               │
├─────────────────────────────────┤
│ ✅ Semana 1: 40h (100%)         │
│ ✅ Semana 2: 42h (105%)         │
│ ⚠️  Semana 3: 35h (87%)         │
│ ... (8 semanas - máximo)        │
└─────────────────────────────────┘
```

---

## 🔧 CAMBIOS TÉCNICOS

### Archivos Modificados

1. **`frontend/src/pages/Dashboard.jsx`**
   - Pasar `user` a componentes

2. **`frontend/src/components/dashboard/WeeklyComparison.jsx`**
   - Agregar prop `user`
   - Calcular `maxWeeks` según `created_at`
   - Agregar dependencia `user?.created_at` al useMemo

3. **`frontend/src/components/dashboard/GoalHistory.jsx`**
   - Agregar prop `user`
   - Calcular `maxWeeks` según `created_at`
   - Agregar mensaje de bienvenida para usuarios nuevos
   - Agregar dependencia `user?.created_at` al useMemo

---

## 📋 LÓGICA DE CÁLCULO

### WeeklyComparison

```javascript
// Incluye la semana actual
maxWeeks = Math.min(4, Math.max(1, weeksSinceCreation + 1))

Ejemplos:
- 0 días  → weeksSinceCreation = 0 → maxWeeks = 1 (esta semana)
- 7 días  → weeksSinceCreation = 1 → maxWeeks = 2 (esta + 1 anterior)
- 14 días → weeksSinceCreation = 2 → maxWeeks = 3 (esta + 2 anteriores)
- 30 días → weeksSinceCreation = 4 → maxWeeks = 4 (máximo alcanzado)
```

### GoalHistory

```javascript
// Excluye la semana actual (solo historial)
maxWeeks = Math.min(8, Math.max(0, weeksSinceCreation))

Ejemplos:
- 0 días  → weeksSinceCreation = 0 → maxWeeks = 0 (mensaje bienvenida)
- 7 días  → weeksSinceCreation = 1 → maxWeeks = 1 (1 semana completa)
- 14 días → weeksSinceCreation = 2 → maxWeeks = 2 (2 semanas completas)
- 60 días → weeksSinceCreation = 8 → maxWeeks = 8 (máximo alcanzado)
```

---

## 🎯 BENEFICIOS

### Para Usuarios Nuevos
- ✅ No ven datos vacíos confusos
- ✅ Mensaje de bienvenida claro
- ✅ Expectativas correctas sobre el historial

### Para Usuarios Antiguos
- ✅ Siguen viendo el máximo de semanas
- ✅ Sin cambios en su experiencia
- ✅ Datos relevantes y útiles

### Para el Sistema
- ✅ Lógica adaptativa e inteligente
- ✅ Mejor UX desde el primer día
- ✅ Menos confusión y preguntas de soporte

---

## 🧪 CASOS DE PRUEBA

### Test 1: Usuario creado hoy
```javascript
user.created_at = '2026-03-28T10:00:00'
today = '2026-03-28'

WeeklyComparison:
- weeksSinceCreation = 0
- maxWeeks = 1
- Muestra: Solo esta semana ✅

GoalHistory:
- weeksSinceCreation = 0
- maxWeeks = 0
- Muestra: Mensaje de bienvenida ✅
```

### Test 2: Usuario creado hace 10 días
```javascript
user.created_at = '2026-03-18T10:00:00'
today = '2026-03-28'

WeeklyComparison:
- weeksSinceCreation = 1
- maxWeeks = 2
- Muestra: Esta semana + 1 anterior ✅

GoalHistory:
- weeksSinceCreation = 1
- maxWeeks = 1
- Muestra: 1 semana completa ✅
```

### Test 3: Usuario creado hace 3 meses
```javascript
user.created_at = '2025-12-28T10:00:00'
today = '2026-03-28'

WeeklyComparison:
- weeksSinceCreation = 13
- maxWeeks = 4 (máximo)
- Muestra: 4 semanas ✅

GoalHistory:
- weeksSinceCreation = 13
- maxWeeks = 8 (máximo)
- Muestra: 8 semanas ✅
```

---

## 📝 DEPENDENCIAS

### Backend
- ✅ Ya envía `created_at` en el objeto user
- ✅ No requiere cambios

### Frontend
- ✅ Importar `differenceInWeeks` de `date-fns`
- ✅ Pasar prop `user` a componentes
- ✅ Agregar lógica de cálculo

---

## 🎉 RESULTADO FINAL

### Antes ❌
```
Usuario nuevo ve:
- 4 semanas vacías en comparación
- 8 semanas vacías en historial
- Confusión: "¿Por qué no hay datos?"
```

### Después ✅
```
Usuario nuevo ve:
- Solo su semana actual
- Mensaje: "¡Bienvenido! Completa tu primera semana..."
- Claridad: "Ah, soy nuevo, por eso no hay historial"
```

---

**Fecha:** 28 de marzo de 2026  
**Prioridad:** MEDIA  
**Estado:** ✅ Implementado
