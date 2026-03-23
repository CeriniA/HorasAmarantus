# 🔍 Verificar Conectividad - Paso a Paso

## ✅ Cambios Realizados

1. **Simplificado ConnectivityService** - Eliminado AbortController que causaba problemas
2. **Fetch más simple y robusto** - Solo GET request básico
3. **Mejor logging** - Mensajes claros en consola

---

## 📋 Pasos para Verificar

### 1. Asegúrate que AMBOS servidores estén corriendo

#### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

**Debes ver:**
```
✅ Configuración validada correctamente
🚀 Servidor backend iniciado
   URL: http://localhost:3001
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

**Debes ver:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

### 2. Abre el navegador en http://localhost:5173

---

### 3. Abre la Consola del Navegador (F12)

**Busca estos mensajes:**

✅ **Si funciona correctamente:**
```
🔍 Verificando conectividad con: http://localhost:3001/health
✅ Conectividad verificada: {
  online: true,
  backend: true,
  latency: 15,
  error: null,
  timestamp: "..."
}
🔌 Estado inicial de conectividad: { online: true, backend: true, ... }
```

❌ **Si hay problema:**
```
🔍 Verificando conectividad con: http://localhost:3001/health
❌ Error de conectividad: Failed to fetch
   Endpoint: http://localhost:3001/health
   ¿Backend corriendo en http://localhost:3001?
🔌 Estado inicial de conectividad: { online: true, backend: false, ... }
```

---

### 4. Verifica el Indicador Visual

- **Backend corriendo:** NO debe aparecer indicador "Sin conexión"
- **Backend detenido:** DEBE aparecer badge rojo "Sin conexión"

---

## 🧪 Test Manual

### Opción 1: Usar el archivo de prueba

1. Abre en el navegador: `http://localhost:5173/test-connectivity.html`
2. Verás el resultado del test automáticamente

### Opción 2: Consola del navegador

Pega esto en la consola:
```javascript
fetch('http://localhost:3001/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend OK:', d))
  .catch(e => console.error('❌ Backend ERROR:', e.message))
```

**Resultado esperado:**
```
✅ Backend OK: { status: 'ok', timestamp: '...' }
```

---

## 🔧 Troubleshooting

### Problema: "Failed to fetch"

**Causas posibles:**
1. ❌ Backend no está corriendo
2. ❌ Backend en puerto diferente
3. ❌ Error de CORS (ya debería estar arreglado)

**Solución:**
```bash
# Verifica que el backend esté corriendo
# En la terminal del backend debes ver:
🚀 Servidor backend iniciado
   URL: http://localhost:3001
```

---

### Problema: "CORS policy"

**Ya está arreglado**, pero si aparece:
1. Verifica que el backend tenga: `app.options('*', cors());`
2. Verifica que el frontend esté en `http://localhost:5173`

---

### Problema: "Indicador dice offline pero backend está corriendo"

**Verifica en consola:**
1. ¿Aparece el mensaje "🔍 Verificando conectividad"?
2. ¿Qué dice el resultado?

**Si dice `backend: false`:**
- El endpoint `/health` no está respondiendo OK
- Verifica que el backend no tenga errores

---

## ✅ Checklist Final

- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 5173
- [ ] Consola muestra "✅ Conectividad verificada"
- [ ] `backend: true` en el objeto de estado
- [ ] NO aparece indicador "Sin conexión"
- [ ] Al detener backend, APARECE "Sin conexión"
- [ ] Al iniciar backend, DESAPARECE "Sin conexión"

---

## 📝 Notas Técnicas

### URL del Health Endpoint
```javascript
VITE_API_URL=http://localhost:3001/api
// Se convierte en:
BASE_URL = http://localhost:3001
HEALTH_ENDPOINT = http://localhost:3001/health ✅
```

### Flujo de Verificación
```
1. useOffline hook se monta
2. Llama a connectivityService.checkConnectivity()
3. Hace GET a http://localhost:3001/health
4. Si response.ok === true → backend: true
5. Si error → backend: false
6. Actualiza estado isOnline
7. OfflineIndicator muestra/oculta según isOnline
```

---

**Si sigues viendo "offline", copia y pega TODO el contenido de la consola aquí** 📋
