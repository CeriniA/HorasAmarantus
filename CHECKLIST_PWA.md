# ✅ CHECKLIST: Verificación PWA

## 📋 ESTADO ACTUAL

### ✅ Completado

1. **Iconos PNG generados**
   - ✅ launchericon-48x48.png
   - ✅ launchericon-72x72.png
   - ✅ launchericon-96x96.png
   - ✅ launchericon-144x144.png
   - ✅ launchericon-192x192.png (mínimo Android)
   - ✅ launchericon-512x512.png (mínimo Android)

2. **Configuración actualizada**
   - ✅ `vite.config.js` - Rutas de iconos corregidas
   - ✅ `index.html` - Meta tags iOS agregados
   - ✅ Plugin PWA configurado
   - ✅ Service Worker automático

---

## 🧪 PASOS DE VERIFICACIÓN

### 1. Rebuild del Proyecto

```bash
cd frontend

# Limpiar build anterior
rm -rf dist

# Rebuild
npm run build
```

**Verificar:**
- ✅ Build exitoso sin errores
- ✅ Archivos generados en `dist/`
- ✅ Service Worker generado (`dist/sw.js`)

---

### 2. Test en Localhost

```bash
# Iniciar servidor de desarrollo
npm run dev
```

**Abrir:** http://localhost:5173

#### Verificar en Chrome DevTools (F12)

**A. Application → Manifest**
- ✅ Manifest carga sin errores
- ✅ Nombre: "Sistema Horas Hortícola"
- ✅ Todos los iconos cargan (6 iconos)
- ✅ Start URL: "/"
- ✅ Display: "standalone"

**B. Application → Service Workers**
- ✅ Service Worker registrado
- ✅ Estado: "activated and running"
- ✅ Scope: "/"

**C. Console**
- ✅ Sin errores relacionados a PWA
- ✅ Sin errores de carga de iconos

---

### 3. Lighthouse Audit

**En Chrome DevTools:**
1. Ir a **Lighthouse** tab
2. Seleccionar **Progressive Web App**
3. Click en **Generate report**

**Verificar score:**
- ✅ PWA score > 90
- ✅ "Installable" ✅
- ✅ "Fast and reliable" ✅
- ✅ "Optimized" ✅

**Checks importantes:**
- ✅ Registers a service worker
- ✅ Web app manifest meets requirements
- ✅ Has a `<meta name="viewport">` tag
- ✅ Provides a valid apple-touch-icon
- ✅ Configured for a custom splash screen

---

### 4. Test de Instalación en Desktop

**Chrome (Windows/Mac/Linux):**

1. Abrir http://localhost:5173
2. Buscar icono de instalación en la barra de direcciones (⊕)
3. Click en el icono
4. Verificar diálogo "Instalar Sistema Horas Hortícola"
5. Click en **Instalar**

**Verificar:**
- ✅ Aparece ventana de instalación
- ✅ Icono correcto en el diálogo
- ✅ Nombre correcto
- ✅ App se abre en ventana standalone
- ✅ Sin barra de navegador
- ✅ Icono en escritorio/menú inicio

---

### 5. Test en Red Local (Preparación para Móvil)

#### A. Configurar servidor para red local

**Editar `vite.config.js`:**
```javascript
server: {
  host: '0.0.0.0', // Permitir acceso desde red
  port: 5173,
  open: true
}
```

#### B. Obtener IP local

**Windows:**
```bash
ipconfig
# Buscar "IPv4 Address" (ej: 192.168.1.100)
```

**Mac/Linux:**
```bash
ifconfig
# Buscar inet (ej: 192.168.1.100)
```

#### C. Iniciar servidor

```bash
npm run dev
```

**Verificar:**
- ✅ Servidor escuchando en 0.0.0.0:5173
- ✅ Accesible desde http://192.168.1.100:5173

---

### 6. Test en Dispositivo Móvil (Android)

**Requisitos:**
- ✅ Celular en misma red WiFi
- ✅ Chrome instalado

**Pasos:**

1. **Abrir en Chrome móvil:**
   ```
   http://TU_IP:5173
   (ej: http://192.168.1.100:5173)
   ```

2. **Verificar que carga correctamente**
   - ✅ App se ve bien en móvil
   - ✅ Sin errores de consola

3. **Buscar banner de instalación**
   - Esperar 30 segundos
   - Debería aparecer banner: "Agregar Sistema Horas a la pantalla de inicio"

4. **Si no aparece banner automático:**
   - Menú (⋮) → **Agregar a pantalla de inicio**
   - O: Menú (⋮) → **Instalar app**

5. **Instalar**
   - Click en **Agregar** o **Instalar**
   - Confirmar

**Verificar:**
- ✅ Icono aparece en pantalla de inicio
- ✅ Icono correcto (no genérico)
- ✅ Nombre correcto
- ✅ Al abrir, se ve como app nativa
- ✅ Sin barra de navegador
- ✅ Funciona offline (después de primera carga)

---

### 7. Test en iOS (Safari)

**Pasos:**

1. **Abrir en Safari:**
   ```
   http://TU_IP:5173
   ```

2. **Agregar a pantalla de inicio:**
   - Botón **Compartir** (⬆️)
   - **Agregar a pantalla de inicio**
   - Editar nombre si es necesario
   - **Agregar**

**Verificar:**
- ✅ Icono en pantalla de inicio
- ✅ Al abrir, pantalla de splash
- ✅ Se ve como app

**Nota:** iOS tiene limitaciones con Service Workers, pero la app debería instalarse.

---

## 🚀 DESPLIEGUE EN PRODUCCIÓN

### Requisitos Adicionales

1. **HTTPS Obligatorio**
   - ⚠️ En producción DEBE ser HTTPS
   - ✅ Localhost funciona con HTTP

2. **Build de Producción**
   ```bash
   npm run build
   ```

3. **Servidor configurado**
   - Headers correctos para Service Worker
   - MIME types correctos

---

## 🐛 TROUBLESHOOTING

### ❌ "No aparece el botón de instalar"

**Posibles causas:**

1. **Faltan iconos**
   ```bash
   # Verificar que existen
   ls frontend/public/icons/
   ```
   ✅ Resuelto - Iconos cargados

2. **Service Worker no registrado**
   - F12 → Application → Service Workers
   - Debe estar "activated and running"

3. **Manifest inválido**
   - F12 → Application → Manifest
   - Verificar errores

4. **No hay interacción del usuario**
   - Esperar 30 segundos
   - Hacer scroll o click
   - Volver a visitar la página

5. **Ya está instalada**
   - Verificar en apps instaladas
   - Desinstalar y volver a intentar

---

### ❌ "Los iconos no cargan"

**Verificar rutas:**
```javascript
// vite.config.js - Debe coincidir con archivos reales
src: '/icons/launchericon-192x192.png'  // ✅ Correcto
src: '/icons/icon-192x192.png'          // ❌ Incorrecto
```

**Verificar archivos:**
```bash
ls frontend/public/icons/
# Debe mostrar: launchericon-*.png
```

✅ **Resuelto** - Rutas actualizadas en vite.config.js

---

### ❌ "Service Worker no se registra"

**Verificar plugin:**
```bash
npm list vite-plugin-pwa
# Debe estar instalado
```

**Rebuild:**
```bash
npm run build
```

**Verificar en DevTools:**
- Application → Service Workers
- Ver errores en consola

---

### ❌ "En móvil no aparece opción de instalar"

**Verificar:**

1. **Conexión a red local**
   - Mismo WiFi que la PC
   - Ping a la IP desde el celular

2. **Puerto accesible**
   - Firewall no bloqueando puerto 5173
   - Servidor corriendo con host: '0.0.0.0'

3. **HTTPS en producción**
   - En desarrollo (localhost/IP local) puede funcionar con HTTP
   - En producción DEBE ser HTTPS

4. **Criterios de instalación**
   - Usuario debe interactuar con la página
   - Esperar al menos 30 segundos
   - Tener Service Worker activo

---

## 📊 CRITERIOS DE INSTALABILIDAD

### Chrome (Android)

**Requisitos mínimos:**
- ✅ Manifest válido con:
  - ✅ `name` o `short_name`
  - ✅ `icons` (192x192 y 512x512)
  - ✅ `start_url`
  - ✅ `display: standalone` o `fullscreen`
- ✅ Service Worker registrado
- ✅ HTTPS (o localhost)
- ✅ Usuario interactuó con la página

### Safari (iOS)

**Requisitos:**
- ✅ Manifest (parcialmente soportado)
- ✅ `apple-touch-icon`
- ✅ Meta tags de Apple
- ⚠️ Service Worker limitado

---

## ✅ CHECKLIST FINAL

### Antes de Test

- [x] Iconos PNG generados (6 tamaños)
- [x] `vite.config.js` actualizado con rutas correctas
- [x] `index.html` con meta tags iOS
- [x] Plugin PWA configurado
- [ ] Build ejecutado (`npm run build`)

### Test en Desktop

- [ ] Manifest carga sin errores
- [ ] Service Worker activo
- [ ] Lighthouse score > 90
- [ ] Instalación exitosa
- [ ] App abre en ventana standalone

### Test en Móvil (Android)

- [ ] Accesible desde red local
- [ ] Banner de instalación aparece
- [ ] Instalación exitosa
- [ ] Icono correcto en pantalla de inicio
- [ ] App funciona como nativa
- [ ] Funciona offline

### Test en iOS (opcional)

- [ ] Instalación manual exitosa
- [ ] Icono en pantalla de inicio
- [ ] App abre correctamente

---

## 🎯 PRÓXIMOS PASOS

1. **Ejecutar build:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Test en localhost:**
   ```bash
   npm run dev
   ```
   - Verificar en Chrome DevTools
   - Ejecutar Lighthouse audit

3. **Test en red local:**
   - Configurar `host: '0.0.0.0'`
   - Obtener IP local
   - Probar desde celular

4. **Desplegar en producción:**
   - Servidor con HTTPS
   - Build de producción
   - Test final en móvil

---

## 📝 RESUMEN

**✅ Completado:**
- Iconos PNG cargados
- Configuración actualizada
- Soporte iOS agregado

**⏳ Pendiente:**
- Build y verificación
- Test en dispositivos
- Despliegue en producción

**🎯 Siguiente acción:**
```bash
cd frontend
npm run build
npm run dev
# Luego abrir http://localhost:5173 y verificar en DevTools
```

---

**Fecha:** 28 de marzo de 2026  
**Estado:** ⚠️ Listo para testing
