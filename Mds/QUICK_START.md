# ⚡ Quick Start - Sistema de Horas

## 🚀 Inicio Rápido (5 minutos)

### 1️⃣ Backend

```bash
cd backend
npm install
cp .env.example .env
# Edita .env con tu service_role key de Supabase
npm run dev
```

### 2️⃣ Generar Password Hash

```bash
cd backend
npm run hash ContraseñaSegura123!
# Copia el hash generado
```

### 3️⃣ Crear Usuario Admin en Supabase

Ve a Supabase SQL Editor y ejecuta:

```sql
INSERT INTO users (id, email, password_hash, name, role)
VALUES (
  '1fa2dea5-5852-4eed-94f8-757aef724d9f',
  'admin@horticola.com',
  'EL_HASH_QUE_COPIASTE',
  'Juan Pérez',
  'admin'
);
```

### 4️⃣ Frontend

```bash
cd frontend
npm install
npm run dev
```

### 5️⃣ Login

1. Abre http://localhost:5173
2. Login:
   - Email: `admin@horticola.com`
   - Password: `ContraseñaSegura123!`

---

## 📝 Checklist

- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 5173
- [ ] Schema ejecutado en Supabase
- [ ] Usuario admin creado
- [ ] Login funciona
- [ ] Dashboard carga

---

## 🐛 Si algo falla

### Backend no inicia
```bash
# Verifica que tienes Node.js 18+
node --version

# Reinstala dependencias
rm -rf node_modules package-lock.json
npm install
```

### Frontend no conecta con backend
```bash
# Verifica .env
cat frontend/.env
# Debe tener: VITE_API_URL=http://localhost:3001/api

# Reinicia el frontend
npm run dev
```

### Login falla
```bash
# Verifica que el usuario existe
# En Supabase SQL Editor:
SELECT * FROM users WHERE email = 'admin@horticola.com';

# Verifica el hash
npm run hash ContraseñaSegura123!
# Compara con el hash en la DB
```

---

## 📚 Documentación Completa

- `SETUP_COMPLETO.md`: Guía detallada paso a paso
- `RESUMEN_CAMBIOS.md`: Qué cambió y por qué
- `backend/README.md`: API endpoints y ejemplos

---

## 🎯 Siguiente Paso

Una vez que el login funcione:

1. Crea unidades organizacionales
2. Crea más usuarios (supervisores, operarios)
3. Prueba crear registros de horas
4. Verifica permisos por rol

¡Listo! 🎉
