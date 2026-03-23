# 🚀 Iniciar Modo Desarrollo

## Problema: "Sin conexión" en desarrollo

El sistema offline verifica la conectividad con el backend. Si ves el mensaje "sin conexión", es porque:

1. **El backend no está corriendo**
2. **El frontend no puede conectarse al backend**

---

## ✅ Solución: Iniciar ambos servidores

### Opción 1: Dos terminales (Recomendado)

#### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Deberías ver:
```
🚀 Servidor backend iniciado
   URL: http://localhost:3001
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Deberías ver:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

### Opción 2: Script único (Windows)

Crear archivo `dev.bat` en la raíz:
```batch
@echo off
start cmd /k "cd backend && npm run dev"
start cmd /k "cd frontend && npm run dev"
```

Ejecutar:
```bash
./dev.bat
```

---

## 🔍 Verificar que funciona

1. **Abrir consola del navegador** (F12)
2. **Buscar estos mensajes:**
   ```
   🔍 Verificando conectividad con: http://localhost:3001/health
   ✅ Conectividad verificada: { online: true, backend: true, ... }
   ```

3. **Si ves error:**
   ```
   ❌ Error de conectividad: Failed to fetch
      Endpoint: http://localhost:3001/health
      ¿Backend corriendo en http://localhost:3001?
   ```
   → **El backend no está corriendo**

---

## 🛠️ Troubleshooting

### Error: "Backend timeout"
- El backend está muy lento o no responde
- Verificar que el puerto 3001 no esté ocupado

### Error: "Failed to fetch"
- El backend no está corriendo
- Verificar que esté en `http://localhost:3001`

### Error: "CORS bloqueado"
- Verificar que el frontend esté en `http://localhost:5173`
- Verificar configuración CORS en `backend/src/app.js`

---

## 📝 URLs Importantes

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001
- **Health Check:** http://localhost:3001/health
- **API:** http://localhost:3001/api

---

## ✅ Todo funcionando cuando:

1. ✅ Backend muestra: `🚀 Servidor backend iniciado`
2. ✅ Frontend muestra: `➜  Local:   http://localhost:5173/`
3. ✅ Consola muestra: `✅ Conectividad verificada`
4. ✅ No aparece indicador "Sin conexión" en la app

---

**¡Listo para desarrollar!** 🎉
