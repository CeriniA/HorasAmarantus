# 📱 GUÍA: Instalar PWA en Dispositivos Móviles

## 🚨 PROBLEMA ACTUAL

**La PWA no se puede instalar en el celular.**

---

## 🔍 DIAGNÓSTICO

### ✅ Lo que SÍ está configurado:

1. **Manifest configurado** (`vite.config.js`)
   - ✅ Nombre, descripción, colores
   - ✅ Display: standalone
   - ✅ Start URL correcto

2. **Plugin PWA instalado**
   - ✅ `vite-plugin-pwa` configurado
   - ✅ Service Worker automático
   - ✅ Estrategias de caching

3. **Manifest vinculado** (`index.html`)
   - ✅ `<link rel="manifest" href="/manifest.webmanifest">`

### ❌ Lo que FALTA:

1. **Iconos PNG** ⚠️ CRÍTICO
   - ❌ No existen los archivos `/icons/icon-*.png`
   - ❌ Solo hay `icon.svg` (no suficiente para móviles)
   - **Requerido:** PNG en múltiples tamaños

2. **HTTPS** (si no está en localhost)
   - ⚠️ PWA requiere HTTPS en producción
   - ✅ Localhost funciona sin HTTPS

---

## 🛠️ SOLUCIÓN: Generar Iconos PNG

### Opción 1: Usar Herramienta Online (RECOMENDADO)

#### 1. PWA Asset Generator
**URL:** https://www.pwabuilder.com/imageGenerator

**Pasos:**
1. Subir `icon.svg` o crear un PNG de 512x512
2. Descargar el paquete de iconos
3. Extraer en `frontend/public/icons/`

**Resultado:**
```
frontend/public/icons/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png
├── icon-384x384.png
└── icon-512x512.png
```

---

#### 2. RealFaviconGenerator
**URL:** https://realfavicongenerator.net/

**Pasos:**
1. Subir imagen (mínimo 260x260)
2. Configurar para PWA
3. Descargar paquete
4. Copiar iconos a `frontend/public/icons/`

---

### Opción 2: Usar ImageMagick (Línea de Comandos)

#### Instalar ImageMagick
```bash
# Windows (con Chocolatey)
choco install imagemagick

# O descargar de: https://imagemagick.org/script/download.php
```

#### Generar iconos
```bash
# Navegar a la carpeta public
cd frontend/public

# Crear carpeta icons
mkdir icons

# Convertir SVG a PNG de 512x512 (base)
magick icon.svg -resize 512x512 icons/icon-512x512.png

# Generar todos los tamaños
magick icons/icon-512x512.png -resize 72x72 icons/icon-72x72.png
magick icons/icon-512x512.png -resize 96x96 icons/icon-96x96.png
magick icons/icon-512x512.png -resize 128x128 icons/icon-128x128.png
magick icons/icon-512x512.png -resize 144x144 icons/icon-144x144.png
magick icons/icon-512x512.png -resize 152x152 icons/icon-152x152.png
magick icons/icon-512x512.png -resize 192x192 icons/icon-192x192.png
magick icons/icon-512x512.png -resize 384x384 icons/icon-384x384.png
```

---

### Opción 3: Usar Script Node.js

#### Crear script de generación

**Archivo:** `frontend/scripts/generate-icons.js`

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = path.join(__dirname, '../public/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

// Crear directorio si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generar cada tamaño
Promise.all(
  sizes.map(size => {
    const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
    return sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(outputFile)
      .then(() => console.log(`✅ Generado: icon-${size}x${size}.png`));
  })
).then(() => {
  console.log('🎉 Todos los iconos generados!');
}).catch(err => {
  console.error('❌ Error:', err);
});
```

#### Instalar dependencia
```bash
npm install --save-dev sharp
```

#### Ejecutar script
```bash
node frontend/scripts/generate-icons.js
```

---

## 📋 CHECKLIST DE INSTALACIÓN PWA

### Requisitos Técnicos

- [ ] **Iconos PNG generados** (todos los tamaños)
- [ ] **HTTPS habilitado** (en producción)
- [ ] **Service Worker registrado** (automático con vite-plugin-pwa)
- [ ] **Manifest válido** (ya está)
- [ ] **Aplicación desplegada** (accesible desde el celular)

### Verificación en Navegador

#### Chrome DevTools
1. Abrir DevTools (F12)
2. Ir a **Application** tab
3. Verificar:
   - [ ] **Manifest** - Sin errores
   - [ ] **Service Workers** - Registrado y activo
   - [ ] **Icons** - Todos los tamaños presentes

#### Lighthouse
1. Abrir DevTools (F12)
2. Ir a **Lighthouse** tab
3. Seleccionar **Progressive Web App**
4. Click en **Generate report**
5. Verificar score > 90

---

## 📱 CÓMO INSTALAR EN DISPOSITIVOS

### Android (Chrome)

#### Método 1: Banner Automático
1. Abrir la app en Chrome
2. Esperar banner "Agregar a pantalla de inicio"
3. Click en **Instalar**

#### Método 2: Menú Manual
1. Abrir la app en Chrome
2. Menú (⋮) → **Agregar a pantalla de inicio**
3. Confirmar instalación

**Requisitos:**
- ✅ HTTPS (o localhost)
- ✅ Manifest válido
- ✅ Service Worker activo
- ✅ Iconos PNG (192x192 y 512x512 mínimo)
- ✅ Usuario interactuó con la página

---

### iOS (Safari)

#### Pasos:
1. Abrir la app en Safari
2. Botón **Compartir** (⬆️)
3. **Agregar a pantalla de inicio**
4. Editar nombre si es necesario
5. **Agregar**

**Limitaciones iOS:**
- ⚠️ No soporta Service Worker completo
- ⚠️ Requiere iconos apple-touch-icon
- ⚠️ Manifest parcialmente soportado

#### Agregar soporte iOS

**En `index.html`:**
```html
<!-- Apple Touch Icons -->
<link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png">
<link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png">
<link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-120x120.png">

<!-- Apple Meta Tags -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="SistemaHoras">
```

---

## 🚀 DESPLIEGUE EN PRODUCCIÓN

### Requisitos de Servidor

1. **HTTPS Obligatorio**
   ```nginx
   # Nginx - Redirigir HTTP a HTTPS
   server {
       listen 80;
       server_name tu-dominio.com;
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name tu-dominio.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       # ... resto de configuración
   }
   ```

2. **Headers Correctos**
   ```nginx
   # Service Worker debe servirse con MIME type correcto
   location /sw.js {
       add_header Cache-Control "no-cache";
       add_header Service-Worker-Allowed "/";
   }
   
   # Manifest
   location /manifest.webmanifest {
       add_header Content-Type "application/manifest+json";
   }
   ```

3. **Build de Producción**
   ```bash
   cd frontend
   npm run build
   ```

---

## 🧪 TESTING

### Test Local

#### 1. Build de producción
```bash
cd frontend
npm run build
npm run preview
```

#### 2. Abrir en navegador
```
http://localhost:4173
```

#### 3. Verificar en DevTools
- Application → Manifest
- Application → Service Workers
- Lighthouse → PWA audit

---

### Test en Red Local (Celular)

#### 1. Obtener IP local
```bash
# Windows
ipconfig

# Buscar "IPv4 Address" (ej: 192.168.1.100)
```

#### 2. Configurar Vite para red local

**`vite.config.js`:**
```javascript
server: {
  host: '0.0.0.0', // Permitir acceso desde red
  port: 5173
}
```

#### 3. Iniciar servidor
```bash
npm run dev
```

#### 4. Abrir en celular
```
http://192.168.1.100:5173
```

**Nota:** En desarrollo (HTTP), algunos navegadores móviles pueden no mostrar el banner de instalación.

---

## 📊 ESTRUCTURA FINAL ESPERADA

```
frontend/
├── public/
│   ├── icons/                    ← CREAR ESTA CARPETA
│   │   ├── icon-72x72.png       ← GENERAR
│   │   ├── icon-96x96.png       ← GENERAR
│   │   ├── icon-128x128.png     ← GENERAR
│   │   ├── icon-144x144.png     ← GENERAR
│   │   ├── icon-152x152.png     ← GENERAR
│   │   ├── icon-180x180.png     ← GENERAR (iOS)
│   │   ├── icon-192x192.png     ← GENERAR
│   │   ├── icon-384x384.png     ← GENERAR
│   │   └── icon-512x512.png     ← GENERAR
│   ├── icon.svg                 ✅ Ya existe
│   ├── manifest.webmanifest     ✅ Ya existe
│   └── robots.txt               ✅ Ya existe
├── src/
│   └── ... (código de la app)
└── vite.config.js               ✅ Ya configurado
```

---

## 🎯 PASOS INMEDIATOS

### 1. Generar Iconos (URGENTE)
```bash
# Opción más rápida: Usar herramienta online
# 1. Ir a https://www.pwabuilder.com/imageGenerator
# 2. Subir icon.svg
# 3. Descargar paquete
# 4. Extraer en frontend/public/icons/
```

### 2. Verificar en DevTools
```
1. npm run dev
2. Abrir http://localhost:5173
3. F12 → Application → Manifest
4. Verificar que todos los iconos cargan
```

### 3. Test en Celular
```
1. Conectar celular a misma red WiFi
2. Obtener IP local (ipconfig)
3. Configurar vite.config.js (host: '0.0.0.0')
4. npm run dev
5. Abrir en celular: http://TU_IP:5173
6. Intentar instalar
```

### 4. Desplegar en Producción
```
1. Generar build: npm run build
2. Subir a servidor con HTTPS
3. Verificar en celular desde URL pública
4. Instalar PWA
```

---

## 🐛 TROUBLESHOOTING

### "No aparece el botón de instalar"

**Causas posibles:**
- ❌ Faltan iconos PNG
- ❌ No hay HTTPS (en producción)
- ❌ Service Worker no registrado
- ❌ Manifest inválido
- ❌ Usuario no interactuó con la página

**Solución:**
1. Verificar en DevTools → Application
2. Ver errores en consola
3. Ejecutar Lighthouse audit

---

### "Los iconos no cargan"

**Causas:**
- ❌ Ruta incorrecta en manifest
- ❌ Archivos no existen
- ❌ Permisos de archivo

**Solución:**
```bash
# Verificar que existen
ls frontend/public/icons/

# Verificar rutas en vite.config.js
# Deben ser: /icons/icon-XXxXX.png
```

---

### "Service Worker no se registra"

**Causas:**
- ❌ Build no ejecutado
- ❌ Plugin PWA no instalado
- ❌ Configuración incorrecta

**Solución:**
```bash
# Verificar plugin instalado
npm list vite-plugin-pwa

# Si no está:
npm install -D vite-plugin-pwa

# Rebuild
npm run build
```

---

## 📚 RECURSOS

### Herramientas
- **PWA Builder:** https://www.pwabuilder.com/
- **Favicon Generator:** https://realfavicongenerator.net/
- **Lighthouse:** Chrome DevTools
- **Workbox:** https://developers.google.com/web/tools/workbox

### Documentación
- **MDN PWA:** https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- **Web.dev PWA:** https://web.dev/progressive-web-apps/
- **Vite PWA Plugin:** https://vite-pwa-org.netlify.app/

### Testing
- **PWA Checklist:** https://web.dev/pwa-checklist/
- **Manifest Validator:** https://manifest-validator.appspot.com/

---

## ✅ RESUMEN

**Para que la PWA se pueda instalar en el celular:**

1. ✅ **Generar iconos PNG** (todos los tamaños)
2. ✅ **Desplegar con HTTPS** (en producción)
3. ✅ **Verificar Service Worker** activo
4. ✅ **Test en dispositivo real**

**El problema actual es la falta de iconos PNG.**

---

**Fecha:** 28 de marzo de 2026  
**Prioridad:** ALTA  
**Estado:** ⚠️ Pendiente generación de iconos
