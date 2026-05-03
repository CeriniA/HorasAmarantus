# 🚀 Guía de Desarrollo - Sistema de Horas

## 📦 Instalación Inicial

```bash
# Instalar dependencias de todo el proyecto (raíz, backend y frontend)
npm run install:all
```

## 🔧 Desarrollo

### Levantar Frontend y Backend Juntos (Recomendado)

```bash
npm run dev
```

Esto levantará:
- **Backend**: http://localhost:3000 (API)
- **Frontend**: http://localhost:5173 (Vite)

Los logs aparecerán con colores:
- 🔵 **BACKEND** (azul)
- 🟣 **FRONTEND** (magenta)

### Levantar Solo Backend

```bash
npm run dev:backend
```

### Levantar Solo Frontend

```bash
npm run dev:frontend
```

## 🏗️ Build para Producción

```bash
# Build del frontend
npm run build

# Iniciar backend en producción
npm run start:backend

# Preview del frontend (después del build)
npm run start:frontend
```

## 📁 Estructura del Proyecto

```
app-web/
├── backend/          # API Express + Supabase
│   ├── src/
│   └── package.json
├── frontend/         # React + Vite + TailwindCSS
│   ├── src/
│   └── package.json
└── package.json      # Scripts raíz (este archivo)
```

## ⚙️ Variables de Entorno

### Backend (.env)
```env
PORT=3000
SUPABASE_URL=tu_url
SUPABASE_ANON_KEY=tu_key
JWT_SECRET=tu_secret
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_ANON_KEY=tu_key
```

## 🛠️ Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Levanta backend y frontend juntos |
| `npm run dev:backend` | Solo backend (nodemon) |
| `npm run dev:frontend` | Solo frontend (Vite) |
| `npm run install:all` | Instala deps de raíz, backend y frontend |
| `npm run build` | Build del frontend |
| `npm run start:backend` | Backend en producción |
| `npm run start:frontend` | Preview del frontend |

## 🔥 Hot Reload

- **Backend**: Nodemon detecta cambios automáticamente
- **Frontend**: Vite HMR (Hot Module Replacement)

## 📝 Notas

- El backend usa **nodemon** para auto-reload
- El frontend usa **Vite** con HMR ultra-rápido
- Ambos se ejecutan en paralelo con **concurrently**
- Los logs están coloreados para fácil identificación
