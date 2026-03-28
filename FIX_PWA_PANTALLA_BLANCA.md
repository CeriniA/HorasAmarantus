# 🔧 FIX: PWA Pantalla Blanca en Celular

## 🐛 PROBLEMA

La PWA se instala en el celular pero al abrirla muestra pantalla en blanco.

---

## 🔍 CAUSA

El `start_url: '/'` en el manifest hace que la app instalada intente abrir:
```
Instalada desde: http://192.168.1.100:5173
Intenta abrir:   http://192.168.1.100/  ← Sin puerto
Resultado:       404 → Pantalla blanca
```

---

## ✅ SOLUCIÓN APLICADA

### Cambio en `vite.config.js`

```javascript
// ANTES ❌
manifest: {
  start_url: '/',
  scope: '/',
  // ...
}

// DESPUÉS ✅
manifest: {
  start_url: './',  // Relativa
  scope: './',      // Relativa
  // ...
}
```

**Ahora funciona con cualquier IP/puerto:**
```
Instalada desde: http://192.168.1.100:5173
Intenta abrir:   http://192.168.1.100:5173/  ← Correcto
Resultado:       ✅ Funciona
```

---

## 🚀 PASOS PARA APLICAR EL FIX

### 1. Rebuild (IMPORTANTE)

```bash
cd frontend

# Limpiar build anterior
rm -rf dist

# Rebuild con nueva configuración
npm run build

# Reiniciar servidor
npm run dev
```

### 2. En el Celular

```
1. Desinstalar app actual (si está instalada)
2. Abrir Chrome
3. Ir a: Configuración → Privacidad → Borrar datos
   - Cache
   - Cookies
4. Ir a: http://TU_IP:5173
5. Verificar que funciona en el navegador
6. Menú → Agregar a pantalla de inicio
7. Instalar
8. Abrir app instalada
9. ✅ Debe funcionar
```

---

## 🧪 VERIFICACIÓN

### Antes de Instalar

```
1. Abrir http://TU_IP:5173 en Chrome móvil
2. Verificar que carga correctamente
3. Hacer login
4. Verificar que funciona
```

**Si NO funciona en el navegador:**
- Problema de red/backend
- NO instalar todavía

**Si SÍ funciona en el navegador:**
- Proceder a instalar

---

### Después de Instalar

```
1. Abrir app desde pantalla de inicio
2. Debe cargar (no pantalla blanca)
3. Debe mostrar login o dashboard
4. Debe funcionar normal
```

---

## 📱 TROUBLESHOOTING

### Si sigue en blanco después del fix:

#### 1. Verificar que hiciste rebuild
```bash
npm run build
npm run dev
```

#### 2. Limpiar cache del navegador móvil
```
Chrome → Configuración → Privacidad → Borrar datos
```

#### 3. Desinstalar y reinstalar
```
1. Mantener presionado el icono
2. Desinstalar
3. Volver a Chrome
4. Ir a http://TU_IP:5173
5. Reinstalar
```

#### 4. Verificar consola (USB Debugging)
```
1. Conectar celular por USB
2. Habilitar depuración USB
3. En PC: chrome://inspect/#devices
4. Ver errores en consola
```

---

## 🎯 CONFIGURACIÓN FINAL

### Para Testing Local (Ahora)

```javascript
// vite.config.js
manifest: {
  start_url: './',  // ✅ Relativa
  scope: './',      // ✅ Relativa
}

server: {
  host: '0.0.0.0',  // ✅ Acceso desde red
  port: 5173
}
```

### Para Producción (Después)

```javascript
// vite.config.js
manifest: {
  start_url: '/',   // Absoluta (funciona con dominio)
  scope: '/',
}
```

**Nota:** Cuando despliegues en producción con dominio (ej: `https://app.com`), puedes volver a usar `/`.

---

## ✅ CHECKLIST

- [x] `start_url: './'` configurado
- [x] `scope: './'` configurado
- [ ] Rebuild ejecutado (`npm run build`)
- [ ] Servidor reiniciado
- [ ] Cache limpiado en móvil
- [ ] App desinstalada
- [ ] Funciona en navegador móvil
- [ ] App reinstalada
- [ ] App abre correctamente

---

## 📝 RESUMEN

**Problema:** Pantalla blanca al abrir PWA instalada desde IP local.

**Causa:** `start_url: '/'` no funciona con IP + puerto.

**Solución:** Cambiar a `start_url: './'` (relativa).

**Acción requerida:** 
1. Rebuild
2. Limpiar cache
3. Reinstalar

---

**Fecha:** 28 de marzo de 2026  
**Prioridad:** ALTA  
**Estado:** ✅ Fix aplicado, requiere rebuild
