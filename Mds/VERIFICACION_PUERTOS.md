# ✅ Verificación de Puertos y Configuración

## 🔌 PUERTOS CONFIGURADOS

### Backend
- **Puerto**: `3001`
- **Configurado en**: `backend/.env` → `PORT=3001`
- **Usado en**: `backend/src/app.js` → `const PORT = process.env.PORT || 3001`
- **URL completa**: `http://localhost:3001`

### Frontend
- **Puerto**: `5173` (por defecto de Vite)
- **Configurado en**: Vite automático
- **URL completa**: `http://localhost:5173`

---

## 🔗 CONEXIONES ENTRE SERVICIOS

### Frontend → Backend

#### 1. Variable de Entorno
```env
# frontend/.env
VITE_API_URL=http://localhost:3001/api
```

#### 2. Cliente API
```javascript
// frontend/src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

✅ **COHERENTE**: Frontend apunta a `http://localhost:3001/api`

---

### Backend → Frontend (CORS)

#### 1. Variable de Entorno
```env
# backend/.env
FRONTEND_URL=http://localhost:5173
```

#### 2. Configuración CORS
```javascript
// backend/src/app.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

✅ **COHERENTE**: Backend permite requests desde `http://localhost:5173`

---

## 📡 ENDPOINTS DEL BACKEND

### Base URL
```
http://localhost:3001/api
```

### Rutas Disponibles

#### Auth
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

#### Time Entries
- `GET /api/time-entries`
- `POST /api/time-entries`
- `PUT /api/time-entries/:id`
- `DELETE /api/time-entries/:id`

#### Users
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

#### Organizational Units
- `GET /api/organizational-units`
- `GET /api/organizational-units/:id`
- `POST /api/organizational-units`
- `PUT /api/organizational-units/:id`
- `DELETE /api/organizational-units/:id`

#### Health Check
- `GET /api/health` ✅ (con rate limit)
- `GET /health` ✅ (sin rate limit, para monitoring)

---

## 🔐 SUPABASE CONFIGURATION

### Backend
```env
# backend/.env
SUPABASE_URL=https://yggxulnsniwlrmourssz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ **CORRECTO**: Backend usa `service_role` key para bypasear RLS

### Frontend
```env
# frontend/.env
# ❌ NO tiene SUPABASE_URL ni SUPABASE_ANON_KEY
# ✅ Solo tiene VITE_API_URL
```

✅ **CORRECTO**: Frontend NO accede a Supabase directamente

---

## 🔑 JWT CONFIGURATION

### Backend
```env
# backend/.env
JWT_SECRET=mi-secreto-super-seguro-para-desarrollo-2024
JWT_EXPIRES_IN=7d
```

### Frontend
```javascript
// frontend/src/services/api.js
// Guarda token en localStorage como 'auth_token'
localStorage.setItem('auth_token', token);
```

✅ **COHERENTE**: Backend genera JWT, frontend lo guarda y envía en headers

---

## 📊 FLUJO COMPLETO DE REQUEST

```
1. Usuario en Frontend (localhost:5173)
   ↓
2. Frontend hace request a API
   fetch('http://localhost:3001/api/auth/login', {
     headers: { 'Authorization': 'Bearer <token>' }
   })
   ↓
3. Backend recibe request (localhost:3001)
   - Verifica CORS (origin: localhost:5173) ✅
   - Verifica JWT en middleware ✅
   - Procesa request
   ↓
4. Backend accede a Supabase
   - Usa service_role key ✅
   - Bypasea RLS ✅
   ↓
5. Backend responde a Frontend
   - JSON con datos
   ↓
6. Frontend actualiza UI
```

---

## ✅ CHECKLIST DE COHERENCIA

### Puertos
- [x] Backend en puerto 3001
- [x] Frontend en puerto 5173
- [x] Frontend apunta a backend:3001
- [x] Backend permite CORS desde frontend:5173

### URLs
- [x] Frontend API URL: `http://localhost:3001/api`
- [x] Backend escucha en: `http://localhost:3001`
- [x] Todas las rutas bajo `/api/*`
- [x] Health check en `/api/health` y `/health`

### Autenticación
- [x] Backend genera JWT con secret
- [x] Frontend guarda JWT en localStorage
- [x] Frontend envía JWT en header Authorization
- [x] Backend verifica JWT en middleware

### Supabase
- [x] Backend usa service_role key
- [x] Frontend NO usa Supabase directamente
- [x] URL de Supabase correcta en backend

### CORS
- [x] Backend permite origin del frontend
- [x] Credentials habilitados
- [x] Headers permitidos

---

## 🚀 COMANDOS PARA INICIAR

### Terminal 1 - Backend
```bash
cd backend
npm run dev
# Debería mostrar: 🚀 Servidor backend corriendo en http://localhost:3001
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
# Debería mostrar: Local: http://localhost:5173/
```

---

## 🧪 PRUEBAS DE CONECTIVIDAD

### 1. Health Check del Backend
```bash
curl http://localhost:3001/health
# Respuesta: {"status":"ok","timestamp":"..."}
```

### 2. Health Check con API prefix
```bash
curl http://localhost:3001/api/health
# Respuesta: {"status":"ok","timestamp":"..."}
```

### 3. Login (después de crear usuario)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@horticola.com","password":"ContraseñaSegura123!"}'
```

---

## ⚠️ PROBLEMAS COMUNES

### "CORS Error"
- ✅ Verificar que `FRONTEND_URL` en backend sea `http://localhost:5173`
- ✅ Verificar que frontend esté en puerto 5173

### "Failed to fetch"
- ✅ Verificar que backend esté corriendo en puerto 3001
- ✅ Verificar que `VITE_API_URL` sea `http://localhost:3001/api`

### "Token inválido"
- ✅ Verificar que `JWT_SECRET` esté configurado en backend
- ✅ Verificar que frontend esté enviando el token en headers

### "Service role key error"
- ✅ Verificar que `SUPABASE_SERVICE_ROLE_KEY` esté correcta
- ✅ NO usar la anon key, debe ser service_role

---

## ✨ TODO ESTÁ COHERENTE

✅ Puertos configurados correctamente  
✅ URLs apuntan a los servicios correctos  
✅ CORS configurado para permitir comunicación  
✅ JWT configurado en backend y frontend  
✅ Supabase solo accedido desde backend  
✅ Health checks disponibles  

**El sistema está listo para funcionar** 🎉
