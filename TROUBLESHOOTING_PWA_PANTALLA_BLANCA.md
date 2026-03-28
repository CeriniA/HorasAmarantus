# 🔧 TROUBLESHOOTING: PWA Pantalla en Blanco en Celular

## 🐛 PROBLEMA

La PWA se instala en el celular pero al abrirla muestra **pantalla en blanco**.

---

## 🔍 CAUSAS POSIBLES

### 1. Problema con start_url (MÁS COMÚN)

**Causa:**
El manifest tiene `start_url: '/'` pero la app fue instalada desde una IP local con puerto (ej: `http://192.168.1.100:5173`).

Cuando abres la app instalada, intenta ir a `http://192.168.1.100/` (sin puerto) → Error 404 → Pantalla blanca.

**Solución:**
Usar URL relativa o configurar correctamente para producción.

---

### 2. Service Worker bloqueando

**Causa:**
El Service Worker está cacheando una versión antigua o incorrecta.

**Solución:**
Limpiar cache y reinstalar.

---

### 3. Error de JavaScript

**Causa:**
Algún error en el código que solo se manifiesta en móvil.

**Solución:**
Revisar consola del navegador móvil.

---

### 4. CORS o problemas de red

**Causa:**
Backend no accesible desde el celular.

**Solución:**
Verificar que backend esté en la misma red.

---

## ✅ SOLUCIONES

### Solución 1: Probar en Navegador Móvil Primero

**ANTES de instalar, verificar que funciona en el navegador:**

```
1. Abrir Chrome en el celular
2. Ir a: http://TU_IP:5173
3. Verificar que carga correctamente
4. Verificar que puedes hacer login
5. Verificar que no hay errores en consola
```

**Si NO funciona en el navegador:**
- ❌ NO instalar todavía
- ✅ Arreglar primero los problemas de red/backend

**Si SÍ funciona en el navegador:**
- ✅ Proceder a instalar

---

### Solución 2: Configurar start_url Correctamente

#### Para Testing Local (IP + Puerto)

**Opción A: Usar URL completa en manifest**

Modificar `vite.config.js` temporalmente:

```javascript
// vite.config.js
export default defineConfig({
  plugins: [
    VitePWA({
      manifest: {
        name: 'Sistema Horas Hortícola',
        start_url: 'http://192.168.1.100:5173/', // ← URL completa
        scope: 'http://192.168.1.100:5173/',
        // ... resto
      }
    })
  ]
});
```

**Problema:** Hay que cambiar la IP cada vez.

---

**Opción B: Usar URL relativa (RECOMENDADO para testing)**

```javascript
// vite.config.js
export default defineConfig({
  plugins: [
    VitePWA({
      manifest: {
        name: 'Sistema Horas Hortícola',
        start_url: './', // ← Relativa
        scope: './',
        // ... resto
      }
    })
  ]
});
```

**Ventaja:** Funciona con cualquier IP/puerto.

---

#### Para Producción (Dominio)

```javascript
// vite.config.js
export default defineConfig({
  plugins: [
    VitePWA({
      manifest: {
        name: 'Sistema Horas Hortícola',
        start_url: '/',
        scope: '/',
        // ... resto
      }
    })
  ]
});
```

**Funciona cuando está en:** `https://tu-dominio.com`

---

### Solución 3: Limpiar Cache y Reinstalar

**En el celular:**

```
1. Abrir Chrome
2. Ir a: chrome://inspect/#devices
3. O en el celular:
   - Configuración → Apps → Sistema Horas
   - Almacenamiento → Borrar datos
   - Desinstalar

4. Volver a Chrome
5. Ir a: http://TU_IP:5173
6. Menú → Borrar datos de navegación
   - Cache
   - Cookies
   - Datos de sitios

7. Recargar página (F5)
8. Reinstalar PWA
```

---

### Solución 4: Verificar Consola en Móvil

#### Método 1: Chrome DevTools Remoto (Recomendado)

**En la PC:**
```
1. Conectar celular por USB
2. Habilitar "Depuración USB" en el celular
3. Abrir Chrome en PC
4. Ir a: chrome://inspect/#devices
5. Ver el celular conectado
6. Click en "inspect" en la app
7. Ver errores en consola
```

#### Método 2: Eruda (Consola en el móvil)

**Agregar temporalmente en `index.html`:**

```html
<!-- Solo para debugging -->
<script src="https://cdn.jsdelivr.net/npm/eruda"></script>
<script>eruda.init();</script>
```

**Luego en el celular:**
- Aparecerá un botón flotante
- Click → Ver consola
- Ver errores

**IMPORTANTE:** Quitar antes de producción.

---

### Solución 5: Verificar Backend Accesible

**En el celular, abrir navegador y probar:**

```
http://TU_IP:3001/api/auth/me

Debe responder:
- 401 Unauthorized (normal, no estás logueado)
- NO debe dar timeout
- NO debe dar "No se puede acceder"
```

**Si da timeout:**
```
1. Verificar firewall en PC
2. Verificar que backend corre con host: '0.0.0.0'
3. Verificar misma red WiFi
```

---

## 🧪 PROCESO DE DEBUGGING COMPLETO

### Paso 1: Verificar en Navegador Móvil

```
✅ Abrir http://TU_IP:5173 en Chrome móvil
✅ Debe cargar la app
✅ Debe poder hacer login
✅ Debe funcionar normal
```

**Si falla aquí:** Problema de red/backend, NO de PWA.

---

### Paso 2: Verificar Manifest

**En Chrome móvil:**
```
1. Ir a: http://TU_IP:5173
2. Menú → Más herramientas → Developer tools
3. Application → Manifest
4. Verificar:
   ✅ start_url correcto
   ✅ Iconos cargan
   ✅ Sin errores
```

---

### Paso 3: Verificar Service Worker

**En Chrome móvil:**
```
1. Developer tools → Application → Service Workers
2. Verificar:
   ✅ Registrado
   ✅ Activated
   ✅ Sin errores
```

**Si hay errores:**
```
1. Click en "Unregister"
2. Recargar página
3. Verificar que se registra de nuevo
```

---

### Paso 4: Instalar y Probar

```
1. Menú → Agregar a pantalla de inicio
2. Instalar
3. Abrir app instalada
4. Verificar que carga
```

**Si pantalla blanca:**
```
1. Conectar por USB
2. chrome://inspect/#devices
3. Ver errores en consola
4. Aplicar solución según error
```

---

## 🔧 CONFIGURACIÓN RECOMENDADA

### Para Testing Local

**`vite.config.js`:**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      manifest: {
        name: 'Sistema Horas Hortícola',
        short_name: 'SistemaHoras',
        description: 'Sistema de registro de horas',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',  // ← Relativa para testing
        scope: './',      // ← Relativa para testing
        icons: [
          {
            src: '/icons/launchericon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/launchericon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0',  // ← Permitir acceso desde red
    port: 5173
  }
});
```

---

### Para Producción

**`vite.config.js`:**

```javascript
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Sistema Horas Hortícola',
        short_name: 'SistemaHoras',
        start_url: '/',  // ← Absoluta para producción
        scope: '/',      // ← Absoluta para producción
        // ... resto igual
      }
    })
  ]
});
```

---

## 📱 ERRORES COMUNES Y SOLUCIONES

### Error 1: "Failed to fetch"

**Causa:** Backend no accesible.

**Solución:**
```bash
# Backend debe correr con:
HOST=0.0.0.0 PORT=3001 npm start

# Verificar en celular:
http://TU_IP:3001/api/auth/me
```

---

### Error 2: "Unexpected token '<'"

**Causa:** Service Worker cacheó el HTML en lugar del JS.

**Solución:**
```
1. Desinstalar app
2. Borrar cache del navegador
3. Rebuild: npm run build
4. Reinstalar
```

---

### Error 3: "Cannot read property of undefined"

**Causa:** Error de JavaScript específico de móvil.

**Solución:**
```
1. Conectar por USB
2. Ver error exacto en consola
3. Arreglar el código
4. Rebuild y reinstalar
```

---

### Error 4: Pantalla blanca sin errores

**Causa:** start_url incorrecto.

**Solución:**
```javascript
// Cambiar a relativa
start_url: './',
scope: './',
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Antes de Instalar

- [ ] App funciona en navegador móvil
- [ ] Backend accesible desde celular
- [ ] Login funciona
- [ ] Sin errores en consola
- [ ] Manifest válido
- [ ] Service Worker registrado

### Configuración

- [ ] `start_url: './'` para testing local
- [ ] `scope: './'` para testing local
- [ ] `server.host: '0.0.0.0'` en vite.config
- [ ] Backend con HOST=0.0.0.0

### Después de Instalar

- [ ] App abre correctamente
- [ ] Login funciona
- [ ] Navegación funciona
- [ ] Datos cargan
- [ ] Sin pantalla blanca

---

## 🎯 SOLUCIÓN RÁPIDA

**Si tienes pantalla blanca AHORA:**

```bash
# 1. Modificar vite.config.js
# Cambiar:
start_url: '/',
scope: '/',

# Por:
start_url: './',
scope: './',

# 2. Rebuild
npm run build

# 3. Reiniciar servidor
npm run dev

# 4. En el celular:
# - Desinstalar app
# - Borrar cache de Chrome
# - Ir a http://TU_IP:5173
# - Verificar que funciona
# - Reinstalar
```

---

## 📝 RESUMEN

**Problema:** Pantalla blanca al abrir PWA instalada.

**Causa más común:** `start_url` incorrecto para testing local.

**Solución rápida:** Usar `start_url: './'` en lugar de `'/'`.

**Verificación:** Siempre probar en navegador móvil ANTES de instalar.

---

**Fecha:** 28 de marzo de 2026  
**Prioridad:** ALTA  
**Estado:** 📋 Guía de troubleshooting
