# 🔒 Análisis de Seguridad - Sistema Horas

## ✅ Protecciones Implementadas

### 1. **Autenticación JWT**
- ✅ Tokens firmados con secreto (no modificables por el cliente)
- ✅ Rol del usuario viene del token, no del frontend
- ✅ Middleware `authenticate` valida cada request

### 2. **Autorización por Rol**
- ✅ Backend filtra datos según rol (línea 26-28 en `timeEntries.js`)
- ✅ Operarios solo reciben SUS datos desde la base de datos
- ✅ Rutas protegidas con `requireRole()` y `allowedRoles`

### 3. **Validación de Entrada**
- ✅ Express-validator en todos los endpoints
- ✅ Validación de UUIDs, fechas, strings
- ✅ Sanitización de inputs (trim, escape)

### 4. **Protección contra Inyección SQL**
- ✅ Supabase usa queries parametrizadas
- ✅ No hay concatenación de strings en queries

---

## ⚠️ Vectores de Ataque (y por qué NO funcionan)

### Ataque 1: Modificar rol en DevTools
```javascript
// En consola del navegador
user.role = 'admin'
```
**¿Funciona?** ❌ NO
**Por qué:** El backend ignora el rol del frontend y usa el del JWT

---

### Ataque 2: Modificar JWT
```javascript
localStorage.setItem('token', 'eyJ...token_modificado')
```
**¿Funciona?** ❌ NO
**Por qué:** El backend rechaza tokens no firmados correctamente con el secreto

---

### Ataque 3: Enviar `user_id` falso
```javascript
// POST /api/time-entries
{ user_id: "uuid-de-otro-usuario", ... }
```
**¿Funciona?** ❌ NO (si eres operario)
**Por qué:** Línea 50 de `timeEntries.js` valida que solo admin/superadmin pueden crear para otros

---

### Ataque 4: Inyección SQL
```javascript
setSelectedUser("' OR '1'='1")
```
**¿Funciona?** ❌ NO
**Por qué:** Supabase usa queries parametrizadas, no concatenación

---

### Ataque 5: XSS (Cross-Site Scripting)
```javascript
description: "<script>alert('hack')</script>"
```
**¿Funciona?** ⚠️ PARCIALMENTE
**Mitigación:** React escapa HTML por defecto, pero revisar `dangerouslySetInnerHTML`

---

## 🔴 Vulnerabilidades Potenciales

### 1. **Secreto JWT en código**
**Ubicación:** `backend/src/config/auth.js`
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-aqui';
```
**Riesgo:** Si el secreto por defecto se usa en producción
**Solución:** ✅ Usar variable de entorno en producción

---

### 2. **CORS permisivo**
**Ubicación:** `backend/src/app.js`
```javascript
app.use(cors());
```
**Riesgo:** Permite requests desde cualquier origen
**Solución recomendada:**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

---

### 3. **Rate Limiting**
**Estado:** ⚠️ Solo en `/api/auth/login`
**Riesgo:** Endpoints sin rate limit pueden ser abusados
**Solución recomendada:**
```javascript
// Aplicar rate limit global
app.use('/api/', apiLimiter);
```

---

## 🛡️ Mejores Prácticas Implementadas

### ✅ Passwords
- Hasheados con bcrypt (10 rounds)
- Nunca se devuelven en responses
- Validación de longitud mínima

### ✅ Tokens
- Expiración de 7 días
- Almacenados en localStorage (considerar httpOnly cookies para mayor seguridad)
- Removidos al logout

### ✅ Permisos
- Validación en CADA endpoint
- Filtrado a nivel de base de datos
- Principio de menor privilegio

---

## 📋 Checklist de Seguridad para Producción

- [ ] Cambiar `JWT_SECRET` a valor aleatorio fuerte
- [ ] Configurar CORS con origen específico
- [ ] Habilitar HTTPS
- [ ] Configurar rate limiting global
- [ ] Revisar logs de errores (no exponer stack traces)
- [ ] Configurar CSP (Content Security Policy)
- [ ] Habilitar helmet.js para headers de seguridad
- [ ] Configurar variables de entorno correctamente
- [ ] Revisar permisos de base de datos (RLS en Supabase)
- [ ] Implementar logging de acciones sensibles

---

## 🔍 Cómo Probar la Seguridad

### Test 1: Intentar acceder a datos de otro usuario
```bash
# Como operario, intentar obtener registros de otro usuario
curl -H "Authorization: Bearer TOKEN_OPERARIO" \
  http://localhost:3001/api/time-entries
# Debe devolver solo TUS registros
```

### Test 2: Intentar modificar rol
```javascript
// En DevTools
localStorage.setItem('user', JSON.stringify({...user, role: 'admin'}))
// Recargar página y verificar que el backend sigue filtrando correctamente
```

### Test 3: Token inválido
```bash
curl -H "Authorization: Bearer token_falso" \
  http://localhost:3001/api/time-entries
# Debe devolver 401 Unauthorized
```

---

## 📚 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Última actualización:** 2026-03-10
**Revisado por:** Sistema de IA
**Próxima revisión:** Antes de deploy a producción
