# 🎨 Guía de Estilos CSS

## 📋 Índice
1. [Orden de Clases Tailwind](#orden-de-clases-tailwind)
2. [Clases Globales Disponibles](#clases-globales-disponibles)
3. [Variables CSS](#variables-css)
4. [Patrones Comunes](#patrones-comunes)
5. [Buenas Prácticas](#buenas-prácticas)

---

## 🔢 Orden de Clases Tailwind

**SIEMPRE seguir este orden:**

1. **Layout** (display, position, flex, grid)
2. **Spacing** (margin, padding, gap)
3. **Sizing** (width, height)
4. **Typography** (font, text, leading)
5. **Visual** (background, border, shadow, rounded)
6. **Interactive** (hover, focus, active, disabled)
7. **Responsive** (sm:, md:, lg:, xl:)

### ✅ Ejemplo Correcto:
```jsx
className="flex flex-col gap-4 w-full px-4 py-2 text-base font-medium bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 sm:flex-row sm:w-auto md:px-6"
```

---

## 🎯 Clases Globales Disponibles

### Inputs
```jsx
// Usar la clase global
<input className="input-base" />

// Equivale a:
className="w-full px-3 py-2.5 sm:px-4 sm:py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
```

### Botones
```jsx
// Botón primario
<button className="btn-primary">Guardar</button>

// Botón secundario
<button className="btn-secondary">Cancelar</button>
```

### Cards
```jsx
// Card básica
<div className="card-base p-6">...</div>

// Card interactiva (con hover)
<div className="card-interactive p-6">...</div>
```

### Badges de Estado
```jsx
<span className="badge-success">Completado</span>
<span className="badge-warning">Pendiente</span>
<span className="badge-error">Error</span>
<span className="badge-info">Info</span>
```

### Utilidades
```jsx
// Ocultar scrollbar
<div className="scrollbar-hide overflow-auto">...</div>

// Touch-friendly (mínimo 44px)
<button className="touch-target">...</button>

// Truncate con hover
<p className="truncate-tooltip">Texto largo...</p>
```

---

## 🎨 Variables CSS

Usar variables CSS para valores reutilizables:

```css
/* Disponibles en :root */
var(--color-primary)
var(--color-primary-hover)
var(--color-primary-light)
var(--spacing-card)
var(--spacing-section)
var(--border-radius-default)
var(--border-radius-card)
var(--shadow-card)
var(--shadow-modal)
var(--z-dropdown)  /* 40 */
var(--z-modal)     /* 50 */
var(--z-toast)     /* 60 */
```

---

## 📦 Patrones Comunes

### Card con Header
```jsx
<div className="card-base">
  <div className="px-6 py-4 border-b border-gray-200">
    <h3 className="text-lg font-semibold">Título</h3>
  </div>
  <div className="px-6 py-4">
    Contenido
  </div>
</div>
```

### Input con Label
```jsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Nombre *
  </label>
  <input 
    type="text"
    className="input-base"
    placeholder="Ingresa tu nombre"
  />
</div>
```

### Botones de Acción (Mobile-First)
```jsx
<div className="flex flex-col sm:flex-row sm:justify-end gap-3">
  <button className="btn-secondary w-full sm:w-auto order-2 sm:order-1">
    Cancelar
  </button>
  <button className="btn-primary w-full sm:w-auto order-1 sm:order-2">
    Guardar
  </button>
</div>
```

### Grid Responsive
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items */}
</div>
```

### Badge con Icono
```jsx
<span className="badge-success">
  <CheckCircle className="h-3 w-3 mr-1" />
  Completado
</span>
```

---

## ✅ Buenas Prácticas

### ✅ HACER:
- Usar clases globales cuando existan
- Seguir el orden de clases Tailwind
- Mobile-first siempre
- Botones mínimo 44px de altura
- Usar variables CSS para valores repetidos
- Documentar clases custom nuevas

### ❌ NO HACER:
- Inline styles
- Clases CSS custom sin documentar
- `!important`
- Mezclar Tailwind con CSS modules
- Orden aleatorio de clases
- Desktop-first

---

## 🔧 Crear Nueva Clase Global

**Solo si se repite 3+ veces:**

1. Agregar en `src/index.css` bajo `@layer components`
2. Documentar en este archivo
3. Usar nombre descriptivo (ej: `input-base`, `btn-primary`)

```css
@layer components {
  .mi-clase-nueva {
    @apply flex items-center gap-2 px-4 py-2;
    @apply bg-white border border-gray-300 rounded-lg;
  }
}
```

---

## 📱 Breakpoints Tailwind

```
sm:  640px  (tablet pequeña)
md:  768px  (tablet)
lg:  1024px (desktop)
xl:  1280px (desktop grande)
2xl: 1536px (pantalla muy grande)
```

**Siempre diseñar mobile-first:**
```jsx
// ❌ MAL
<div className="flex-row md:flex-col">

// ✅ BIEN
<div className="flex-col md:flex-row">
```

---

## 🎯 Ejemplos Completos

### Modal Mobile-First
```jsx
<div className="fixed inset-0 z-50 overflow-y-auto">
  <div className="flex items-end sm:items-center justify-center min-h-screen p-0 sm:p-4">
    <div className="inline-block w-full max-w-lg bg-white rounded-t-2xl sm:rounded-lg shadow-xl max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b flex-shrink-0">
        <h3 className="text-base sm:text-lg font-semibold">Título</h3>
      </div>
      
      {/* Body */}
      <div className="px-4 sm:px-6 py-4 overflow-y-auto flex-1">
        Contenido
      </div>
      
      {/* Footer */}
      <div className="px-4 sm:px-6 py-4 border-t flex-shrink-0">
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="btn-secondary w-full sm:w-auto">Cancelar</button>
          <button className="btn-primary w-full sm:w-auto">Guardar</button>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Form Responsive
```jsx
<form className="space-y-5">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Nombre *
      </label>
      <input type="text" className="input-base" />
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Email *
      </label>
      <input type="email" className="input-base" />
    </div>
  </div>
  
  <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-6 border-t">
    <button type="button" className="btn-secondary w-full sm:w-auto">
      Cancelar
    </button>
    <button type="submit" className="btn-primary w-full sm:w-auto">
      Guardar
    </button>
  </div>
</form>
```

---

## 🚀 Herramientas Recomendadas

- **Prettier Tailwind Plugin**: Ordena clases automáticamente
- **Tailwind CSS IntelliSense**: Autocompletado en VSCode
- **DevTools**: Probar en mobile (F12 → Toggle device toolbar)

---

**Última actualización:** Abril 2026
