# 🗄️ MIGRACIONES DE BASE DE DATOS PENDIENTES

> **Fecha:** 26 de marzo de 2026  
> **Estado:** 📋 OPCIONAL - No urgente  
> **Prioridad:** BAJA (todo funciona sin esto)

---

## 📊 RESUMEN EJECUTIVO

**¿Necesitas hacer cambios en la DB ahora?**
- ❌ **NO** - Todo funciona perfectamente sin cambios
- ✅ El código ya está preparado para cuando quieras hacerlo
- ⏰ Puedes hacerlo cuando tengas tiempo

**¿Qué se gana con los cambios?**
- 🎯 Objetivos personalizados por usuario
- 📈 Reportes más precisos
- ⚙️ Configuración más flexible

---

## 🎯 ÚNICA MIGRACIÓN PENDIENTE

### **Agregar Objetivos Personalizados a Usuarios**

**Estado actual:**
- ✅ Funciona con objetivo fijo de 40h semanales
- ✅ Código preparado con fallback: `user?.weekly_goal || 40`
- ❌ Campo `weekly_goal` NO existe en DB

**Beneficio de agregarlo:**
- Cada usuario puede tener su propio objetivo
- Admin puede configurar objetivos diferentes
- Reportes más personalizados

---

## 📝 MIGRACIÓN SQL

### Opción 1: Solo Objetivo Semanal (Recomendado)

```sql
-- Conectar a tu base de datos Supabase
-- Ejecutar en el SQL Editor:

ALTER TABLE users 
ADD COLUMN weekly_goal INTEGER DEFAULT 40;

-- Comentario en la columna (opcional)
COMMENT ON COLUMN users.weekly_goal IS 'Objetivo de horas semanales del usuario';
```

**Tiempo estimado:** 5 segundos  
**Impacto:** Ninguno (tiene DEFAULT)  
**Rollback:** `ALTER TABLE users DROP COLUMN weekly_goal;`

---

### Opción 2: Objetivos Semanal + Mensual (Completo)

```sql
-- Agregar ambos campos
ALTER TABLE users 
ADD COLUMN weekly_goal INTEGER DEFAULT 40,
ADD COLUMN monthly_goal INTEGER DEFAULT 160;

-- Comentarios (opcional)
COMMENT ON COLUMN users.weekly_goal IS 'Objetivo de horas semanales del usuario';
COMMENT ON COLUMN users.monthly_goal IS 'Objetivo de horas mensuales del usuario';
```

**Tiempo estimado:** 5 segundos  
**Impacto:** Ninguno  
**Rollback:** 
```sql
ALTER TABLE users 
DROP COLUMN weekly_goal,
DROP COLUMN monthly_goal;
```

---

## 📋 PASOS DETALLADOS

### 1. **Conectar a Supabase**

1. Ir a https://supabase.com
2. Abrir tu proyecto
3. Ir a "SQL Editor" en el menú lateral

### 2. **Ejecutar Migración**

Copiar y pegar este SQL:

```sql
-- ============================================
-- MIGRACIÓN: Agregar objetivos personalizados
-- Fecha: 2026-03-26
-- Autor: Sistema Horas
-- ============================================

-- Agregar campos de objetivos
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS weekly_goal INTEGER DEFAULT 40,
ADD COLUMN IF NOT EXISTS monthly_goal INTEGER DEFAULT 160;

-- Verificar que se agregaron
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('weekly_goal', 'monthly_goal');
```

### 3. **Verificar Resultado**

Deberías ver:
```
column_name   | data_type | column_default
--------------+-----------+----------------
weekly_goal   | integer   | 40
monthly_goal  | integer   | 160
```

### 4. **Actualizar schema-simple.sql (Opcional)**

Para mantener documentación actualizada:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'operario',
  organizational_unit_id UUID,
  weekly_goal INTEGER DEFAULT 40,        -- ← NUEVO
  monthly_goal INTEGER DEFAULT 160,      -- ← NUEVO
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔧 CAMBIOS EN BACKEND (Opcional)

### Endpoint para Actualizar Objetivos

**Archivo:** `backend/src/routes/users.js`

```javascript
// PATCH /api/users/:id/goals
router.patch('/:id/goals', 
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { weekly_goal, monthly_goal } = req.body;
      
      // Verificar permisos (solo el usuario mismo o admin)
      if (req.user.id !== id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No autorizado' });
      }
      
      // Validar valores
      if (weekly_goal && (weekly_goal < 1 || weekly_goal > 60)) {
        return res.status(400).json({ 
          error: 'Objetivo semanal debe estar entre 1 y 60 horas' 
        });
      }
      
      if (monthly_goal && (monthly_goal < 1 || monthly_goal > 240)) {
        return res.status(400).json({ 
          error: 'Objetivo mensual debe estar entre 1 y 240 horas' 
        });
      }
      
      // Actualizar en Supabase
      const { data, error } = await supabase
        .from('users')
        .update({ 
          weekly_goal,
          monthly_goal,
          updated_at: new Date()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      res.json(data);
    } catch (error) {
      console.error('Error updating goals:', error);
      res.status(500).json({ error: error.message });
    }
  }
);
```

---

## 🎨 INTERFAZ DE USUARIO (Opcional)

### Opción A: Perfil de Usuario

Crear página donde cada usuario configure su objetivo:

```jsx
// frontend/src/pages/Profile.jsx

const Profile = () => {
  const { user, updateUser } = useAuthContext();
  const [weeklyGoal, setWeeklyGoal] = useState(user?.weekly_goal || 40);
  const [monthlyGoal, setMonthlyGoal] = useState(user?.monthly_goal || 160);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${user.id}/goals`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          weekly_goal: weeklyGoal,
          monthly_goal: monthlyGoal 
        })
      });
      
      if (!response.ok) throw new Error('Error al guardar');
      
      const updatedUser = await response.json();
      updateUser(updatedUser);
      setMessage('Objetivos actualizados correctamente');
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Mi Perfil">
      <div className="space-y-4">
        <h3 className="font-semibold">Objetivos de Horas</h3>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Objetivo Semanal (horas)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={weeklyGoal}
            onChange={(e) => setWeeklyGoal(parseInt(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Horas que planeas trabajar por semana
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Objetivo Mensual (horas)
          </label>
          <input
            type="number"
            min="1"
            max="240"
            value={monthlyGoal}
            onChange={(e) => setMonthlyGoal(parseInt(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Horas que planeas trabajar por mes
          </p>
        </div>
        
        <Button onClick={handleSave} loading={loading}>
          Guardar Objetivos
        </Button>
        
        {message && (
          <div className="p-3 bg-blue-50 text-blue-800 rounded">
            {message}
          </div>
        )}
      </div>
    </Card>
  );
};
```

### Opción B: Admin Configura para Usuarios

En el panel de administración de usuarios:

```jsx
// En el formulario de edición de usuario
<div>
  <label>Objetivo Semanal</label>
  <input
    type="number"
    value={editingUser.weekly_goal || 40}
    onChange={(e) => setEditingUser({
      ...editingUser,
      weekly_goal: parseInt(e.target.value)
    })}
  />
</div>
```

---

## 📊 IMPACTO EN REPORTES

### Reportes que Usarán los Nuevos Campos

#### 1. **Dashboard - GoalTracker**
```javascript
// Ya está preparado
<GoalTracker 
  customGoal={user?.weekly_goal || 40}  // ← Usará el campo
/>
```

#### 2. **Reporte de Cumplimiento de Objetivos**
```javascript
// Ya está preparado
const userGoal = period === 'weekly' 
  ? (user.weekly_goal || DEFAULT_WEEKLY_GOAL)
  : (user.monthly_goal || DEFAULT_MONTHLY_GOAL);
```

**Beneficio:**
- Ahora: Todos tienen objetivo de 40h
- Después: Cada usuario su propio objetivo
- Reportes más precisos y personalizados

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### 1. **No es Urgente**
- ✅ Todo funciona sin estos campos
- ✅ Puedes hacerlo cuando quieras
- ✅ No hay presión de tiempo

### 2. **Sin Riesgo**
- ✅ Tiene DEFAULT (no rompe nada)
- ✅ Usuarios existentes tendrán 40h automáticamente
- ✅ Fácil rollback si es necesario

### 3. **Preparado para el Futuro**
- ✅ Código ya usa los campos con fallback
- ✅ Cuando agregues los campos, funcionará automáticamente
- ✅ No requiere cambios en frontend

### 4. **Alternativas**
Si no quieres modificar DB, puedes:
- Dejar objetivo fijo de 40h para todos
- Configurar por rol en código
- Usar archivo de configuración

---

## 🎯 VALORES RECOMENDADOS

### Por Tipo de Contrato

```javascript
// Ejemplos de objetivos comunes
const COMMON_GOALS = {
  'full-time': { weekly: 40, monthly: 160 },
  'part-time': { weekly: 20, monthly: 80 },
  'contractor': { weekly: 30, monthly: 120 },
  'intern': { weekly: 25, monthly: 100 }
};
```

### Por Rol

```javascript
// Si prefieres por rol
const GOALS_BY_ROLE = {
  'operario': { weekly: 40, monthly: 160 },
  'supervisor': { weekly: 35, monthly: 140 },
  'admin': { weekly: 30, monthly: 120 }
};
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Base de Datos (5 minutos)
- [ ] Conectar a Supabase
- [ ] Ejecutar migración SQL
- [ ] Verificar que campos existen
- [ ] Actualizar schema-simple.sql (opcional)

### Fase 2: Backend (15 minutos) - OPCIONAL
- [ ] Crear endpoint PATCH /api/users/:id/goals
- [ ] Agregar validaciones
- [ ] Probar con Postman/Thunder Client

### Fase 3: Frontend (30 minutos) - OPCIONAL
- [ ] Crear página de Perfil
- [ ] Agregar formulario de objetivos
- [ ] Conectar con API
- [ ] Probar que funciona

### Fase 4: Testing (10 minutos)
- [ ] Usuario puede cambiar su objetivo
- [ ] Dashboard refleja el cambio
- [ ] Reportes usan el nuevo valor
- [ ] Valores se persisten correctamente

---

## 🚀 CÓMO PROCEDER

### Opción 1: Hacerlo Ahora (Recomendado)
1. Ejecutar migración SQL (5 min)
2. Probar que Dashboard sigue funcionando
3. Listo - los reportes usarán los nuevos campos automáticamente

### Opción 2: Hacerlo Después
1. Dejar como está (funciona perfecto)
2. Cuando tengas tiempo, ejecutar migración
3. Todo seguirá funcionando igual

### Opción 3: No Hacerlo
1. Dejar objetivo fijo de 40h
2. Todo sigue funcionando
3. Menos flexible pero más simple

---

## 📝 SCRIPT COMPLETO DE MIGRACIÓN

```sql
-- ============================================
-- MIGRACIÓN COMPLETA: Objetivos Personalizados
-- ============================================

-- 1. Agregar campos
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS weekly_goal INTEGER DEFAULT 40,
ADD COLUMN IF NOT EXISTS monthly_goal INTEGER DEFAULT 160;

-- 2. Agregar comentarios
COMMENT ON COLUMN users.weekly_goal IS 'Objetivo de horas semanales del usuario';
COMMENT ON COLUMN users.monthly_goal IS 'Objetivo de horas mensuales del usuario';

-- 3. Verificar
SELECT 
  id,
  name,
  role,
  weekly_goal,
  monthly_goal
FROM users
LIMIT 5;

-- 4. Estadísticas
SELECT 
  COUNT(*) as total_users,
  AVG(weekly_goal) as avg_weekly_goal,
  AVG(monthly_goal) as avg_monthly_goal
FROM users;
```

---

## 🎉 RESUMEN

### Lo que tienes que hacer:
**NADA urgente** - Todo funciona sin cambios

### Si quieres objetivos personalizados:
1. Ejecutar 1 comando SQL (5 segundos)
2. Listo - el código ya está preparado

### Archivos afectados:
- **DB:** `users` table (agregar 2 columnas)
- **Backend:** Opcional (endpoint para actualizar)
- **Frontend:** Ya está listo (usa fallback)

---

## 📞 DUDAS FRECUENTES

**P: ¿Es obligatorio hacer esto?**
R: No. Todo funciona sin estos cambios.

**P: ¿Cuándo debería hacerlo?**
R: Cuando quieras que cada usuario tenga su propio objetivo.

**P: ¿Rompe algo si lo hago?**
R: No. Tiene DEFAULT, usuarios existentes tendrán 40h automáticamente.

**P: ¿Puedo revertirlo?**
R: Sí. `ALTER TABLE users DROP COLUMN weekly_goal;`

**P: ¿Necesito cambiar código?**
R: No. El código ya está preparado con `user?.weekly_goal || 40`

---

**Última actualización:** 26 de marzo de 2026  
**Próxima revisión:** Cuando decidas implementar objetivos personalizados  
**Estado:** 📋 OPCIONAL - No urgente
