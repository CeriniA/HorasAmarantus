# 🎯 MIGRACIÓN: Agregar Objetivos Personalizados

> **Estado:** OPCIONAL - No urgente  
> **Impacto:** Permite que cada usuario tenga su propio objetivo semanal/mensual

---

## 📋 SITUACIÓN ACTUAL

**Dashboard muestra:**
- Objetivo semanal de 40 horas (default)
- Si el usuario tiene `weekly_goal` en DB, usa ese valor
- Si no, usa 40 como fallback

**Código actual:**
```javascript
// Dashboard.jsx línea 161
customGoal={user?.weekly_goal || 40}
```

**Base de datos:**
- ❌ Campo `weekly_goal` NO existe actualmente
- ✅ Usa 40 horas como default para todos

---

## 🚀 CÓMO AGREGAR OBJETIVOS PERSONALIZADOS

### Opción 1: Solo Weekly Goal (Recomendado)

**1. Migración SQL:**
```sql
-- Agregar campo weekly_goal a tabla users
ALTER TABLE users 
ADD COLUMN weekly_goal INTEGER DEFAULT 40;

-- Actualizar usuarios existentes (opcional)
UPDATE users SET weekly_goal = 40 WHERE weekly_goal IS NULL;
```

**2. Actualizar schema-simple.sql:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'operario',
  organizational_unit_id UUID,
  weekly_goal INTEGER DEFAULT 40,  -- ← NUEVO
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**3. Backend - Actualizar respuesta de usuario:**
No requiere cambios, ya devuelve todos los campos del usuario.

**4. Frontend - Ya está listo:**
El Dashboard ya usa `user?.weekly_goal || 40`

---

### Opción 2: Weekly + Monthly Goals (Completo)

**1. Migración SQL:**
```sql
-- Agregar ambos campos
ALTER TABLE users 
ADD COLUMN weekly_goal INTEGER DEFAULT 40,
ADD COLUMN monthly_goal INTEGER DEFAULT 160;

-- Actualizar usuarios existentes
UPDATE users 
SET weekly_goal = 40, 
    monthly_goal = 160 
WHERE weekly_goal IS NULL;
```

**2. Actualizar Dashboard.jsx:**
```javascript
// Para objetivo mensual
<GoalTracker 
  timeEntries={timeEntries} 
  goalType="monthly"
  customGoal={user?.monthly_goal || 160}
/>
```

---

## 🎨 INTERFAZ PARA CONFIGURAR OBJETIVOS

### Opción A: En Perfil de Usuario

**Ubicación:** `frontend/src/pages/Profile.jsx` (crear si no existe)

```jsx
<div className="space-y-4">
  <h3 className="font-semibold">Objetivos de Horas</h3>
  
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
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
  
  <Button onClick={handleSaveGoals}>
    Guardar Objetivos
  </Button>
</div>
```

### Opción B: Admin Configura para Usuarios

**Ubicación:** Panel de administración de usuarios

```jsx
// En formulario de edición de usuario
<div>
  <label>Objetivo Semanal</label>
  <input
    type="number"
    value={editingUser.weekly_goal}
    onChange={(e) => setEditingUser({
      ...editingUser,
      weekly_goal: parseInt(e.target.value)
    })}
  />
</div>
```

---

## 📝 ENDPOINT PARA ACTUALIZAR OBJETIVOS

**Backend:** `backend/src/routes/users.js`

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
        return res.status(400).json({ error: 'Objetivo semanal inválido' });
      }
      
      // Actualizar
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
      res.status(500).json({ error: error.message });
    }
  }
);
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Base de Datos
- [ ] Ejecutar migración SQL en Supabase
- [ ] Actualizar `schema-simple.sql`
- [ ] Verificar que usuarios existentes tienen valores default

### Fase 2: Backend
- [ ] Agregar endpoint PATCH `/api/users/:id/goals`
- [ ] Agregar validaciones
- [ ] Probar con Postman/Thunder Client

### Fase 3: Frontend
- [ ] Crear página de Perfil (o agregar a existente)
- [ ] Agregar formulario de objetivos
- [ ] Conectar con API
- [ ] Probar que Dashboard usa el valor correcto

### Fase 4: Testing
- [ ] Usuario puede cambiar su objetivo
- [ ] Dashboard refleja el cambio
- [ ] Admin puede configurar objetivos de otros (opcional)
- [ ] Valores se persisten correctamente

---

## 🎯 VALORES RECOMENDADOS

### Por Rol
```javascript
const DEFAULT_GOALS = {
  'operario': { weekly: 40, monthly: 160 },
  'supervisor': { weekly: 35, monthly: 140 },
  'admin': { weekly: 30, monthly: 120 }
};
```

### Por Tipo de Contrato
- **Full-time:** 40h semanales
- **Part-time:** 20h semanales
- **Por proyecto:** Variable

---

## 🚨 IMPORTANTE

### NO hacer:
- ❌ Hardcodear valores en el código
- ❌ Asumir que todos tienen 40 horas
- ❌ Olvidar validar los valores

### SÍ hacer:
- ✅ Usar `user?.weekly_goal || 40` (con fallback)
- ✅ Validar rangos razonables (1-60 horas)
- ✅ Permitir que usuarios configuren su objetivo
- ✅ Documentar cambios en este archivo

---

## 📊 ESTADO ACTUAL

**Implementado:**
- ✅ Dashboard usa `user?.weekly_goal || 40`
- ✅ Fallback a 40 si no existe el campo
- ✅ No hay hardcodeo directo

**Pendiente:**
- ⏳ Migración de base de datos
- ⏳ Endpoint para actualizar objetivos
- ⏳ Interfaz de configuración

**Funciona ahora:**
- ✅ Todos ven objetivo de 40 horas
- ✅ Cuando agregues el campo, se usará automáticamente

---

**Última actualización:** 26 de marzo de 2026  
**Próxima revisión:** Cuando decidas implementar objetivos personalizados
