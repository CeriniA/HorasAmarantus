# 🔒 Hacer la App Privada y Segura

## 🎯 Objetivo

Evitar que la aplicación sea indexada por Google y otros buscadores, y que solo sea accesible para usuarios autorizados.

---

## ✅ Nivel 1: Prevenir Indexación (IMPLEMENTADO)

### 1.1 robots.txt ✅

**Archivo**: `frontend/public/robots.txt`

```txt
User-agent: *
Disallow: /

# Bloquear indexación de Google, Bing, etc.
# Esta es una aplicación privada interna
```

**Qué hace**: Indica a los bots de búsqueda que NO indexen ninguna página.

---

### 1.2 Meta Tags ✅

**Archivo**: `frontend/index.html`

```html
<!-- Prevenir indexación en buscadores -->
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
<meta name="googlebot" content="noindex, nofollow" />
<meta name="bingbot" content="noindex, nofollow" />
```

**Qué hace**:
- `noindex`: No indexar la página
- `nofollow`: No seguir los links
- `noarchive`: No guardar en caché
- `nosnippet`: No mostrar fragmentos en resultados

---

## 🔐 Nivel 2: Autenticación (YA IMPLEMENTADO)

### 2.1 Login Obligatorio ✅

La app ya requiere login para acceder a cualquier página.

**Archivo**: `frontend/src/components/ProtectedRoute.jsx`

```javascript
// Todas las rutas están protegidas
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

**Qué hace**: Redirige a `/login` si no estás autenticado.

---

### 2.2 Token JWT ✅

El backend valida tokens en cada request.

**Archivo**: `backend/src/middleware/auth.js`

```javascript
export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  
  // Validar token...
};
```

---

## 🌐 Nivel 3: Restricción por IP (OPCIONAL)

### Opción A: Firewall en el Servidor

Si usas un servidor propio (VPS, AWS, etc.):

```bash
# Ejemplo con UFW (Ubuntu)
sudo ufw allow from 192.168.1.0/24 to any port 3001
sudo ufw deny 3001
```

**Qué hace**: Solo permite acceso desde IPs específicas.

---

### Opción B: Middleware en Backend

**Crear archivo**: `backend/src/middleware/ipWhitelist.js`

```javascript
const ALLOWED_IPS = [
  '192.168.1.100',      // Oficina
  '192.168.1.101',      // Casa
  '10.0.0.0/8',         // Red local
  '::1',                // Localhost IPv6
  '127.0.0.1'           // Localhost IPv4
];

export const ipWhitelist = (req, res, next) => {
  const clientIp = req.ip || 
                   req.headers['x-forwarded-for'] || 
                   req.connection.remoteAddress;
  
  const isAllowed = ALLOWED_IPS.some(allowedIp => {
    if (allowedIp.includes('/')) {
      // CIDR notation
      return isIpInRange(clientIp, allowedIp);
    }
    return clientIp === allowedIp;
  });
  
  if (!isAllowed) {
    console.log(`❌ IP bloqueada: ${clientIp}`);
    return res.status(403).json({ 
      error: 'Acceso denegado desde esta ubicación' 
    });
  }
  
  next();
};

function isIpInRange(ip, cidr) {
  // Implementar lógica CIDR
  // O usar librería: npm install ip-range-check
  const ipRangeCheck = require('ip-range-check');
  return ipRangeCheck(ip, cidr);
}
```

**Usar en app.js**:

```javascript
import { ipWhitelist } from './middleware/ipWhitelist.js';

// Aplicar a todas las rutas
app.use(ipWhitelist);
```

---

### Opción C: Cloudflare Access

Si usas Cloudflare:

1. Ir a **Cloudflare Dashboard**
2. **Access** → **Applications**
3. **Add an application**
4. Configurar:
   - **Name**: Sistema Horas
   - **Domain**: tu-dominio.com
   - **Policy**: Allow IPs específicas

**Ventaja**: No requiere cambios en el código.

---

## 🔑 Nivel 4: VPN (MÁS SEGURO)

### Opción A: WireGuard VPN

1. **Instalar WireGuard** en el servidor
2. **Configurar clientes** en cada dispositivo
3. **Solo permitir acceso** a través de la VPN

```bash
# Instalar WireGuard
sudo apt install wireguard

# Configurar servidor
sudo wg-quick up wg0
```

**Ventaja**: Toda la comunicación encriptada.

---

### Opción B: Tailscale (Más Fácil)

1. Instalar **Tailscale** en servidor y clientes
2. Conectar todos a la misma red privada
3. Acceder via IP privada de Tailscale

```bash
# Instalar Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# Conectar
sudo tailscale up
```

**Ventaja**: Muy fácil de configurar, gratis hasta 100 dispositivos.

---

## 🚫 Nivel 5: Autenticación de Dos Factores (2FA)

### Implementar 2FA con TOTP

**Instalar**:
```bash
npm install speakeasy qrcode
```

**Backend**: `backend/src/routes/auth.js`

```javascript
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// Generar secreto 2FA
router.post('/2fa/setup', authenticate, async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: `Sistema Horas (${req.user.email})`
  });
  
  // Guardar secret en BD
  await supabase
    .from('users')
    .update({ two_factor_secret: secret.base32 })
    .eq('id', req.user.id);
  
  // Generar QR
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);
  
  res.json({ qrCode, secret: secret.base32 });
});

// Verificar código 2FA
router.post('/2fa/verify', authenticate, async (req, res) => {
  const { token } = req.body;
  
  const verified = speakeasy.totp.verify({
    secret: req.user.two_factor_secret,
    encoding: 'base32',
    token
  });
  
  if (verified) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Código inválido' });
  }
});
```

---

## 📊 Comparación de Opciones

| Método | Seguridad | Facilidad | Costo |
|--------|-----------|-----------|-------|
| **robots.txt + meta tags** | ⭐ | ⭐⭐⭐⭐⭐ | Gratis |
| **Autenticación (actual)** | ⭐⭐⭐ | ⭐⭐⭐⭐ | Gratis |
| **IP Whitelist** | ⭐⭐⭐⭐ | ⭐⭐⭐ | Gratis |
| **Cloudflare Access** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $5/mes |
| **VPN (WireGuard)** | ⭐⭐⭐⭐⭐ | ⭐⭐ | Gratis |
| **VPN (Tailscale)** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Gratis |
| **2FA** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Gratis |

---

## 🎯 Recomendación por Escenario

### Escenario 1: Uso Interno en Oficina

**Solución**:
1. ✅ robots.txt + meta tags (ya implementado)
2. ✅ Autenticación (ya implementado)
3. ✅ IP Whitelist (solo IPs de oficina)

**Implementación**: Nivel 1 + Nivel 2 + Nivel 3 Opción B

---

### Escenario 2: Uso Remoto (Casa + Oficina)

**Solución**:
1. ✅ robots.txt + meta tags
2. ✅ Autenticación
3. ✅ Tailscale VPN

**Implementación**: Nivel 1 + Nivel 2 + Nivel 4 Opción B

---

### Escenario 3: Máxima Seguridad

**Solución**:
1. ✅ robots.txt + meta tags
2. ✅ Autenticación
3. ✅ VPN (WireGuard o Tailscale)
4. ✅ 2FA
5. ✅ IP Whitelist

**Implementación**: Todos los niveles

---

## 🚀 Implementación Rápida (Recomendada)

### Paso 1: Ya Implementado ✅

- robots.txt bloqueando bots
- Meta tags noindex
- Autenticación obligatoria

### Paso 2: Agregar IP Whitelist (Opcional)

Si quieres restringir por IP, crear el middleware y agregarlo.

### Paso 3: Usar Tailscale (Recomendado para Remoto)

```bash
# En el servidor
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# En cada cliente (PC, móvil)
# Instalar Tailscale y conectar

# Acceder via IP de Tailscale
http://100.x.x.x:5173
```

---

## 🔍 Verificar que Funciona

### 1. Verificar robots.txt

```
http://tu-dominio.com/robots.txt
```

Debería mostrar:
```
User-agent: *
Disallow: /
```

---

### 2. Verificar Meta Tags

Abrir la app → Ver código fuente (Ctrl+U) → Buscar:
```html
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
```

---

### 3. Verificar en Google

Buscar en Google:
```
site:tu-dominio.com
```

**Resultado esperado**: "No se encontraron resultados"

---

### 4. Verificar Autenticación

Abrir navegador en modo incógnito → Ir a la app

**Resultado esperado**: Redirige a `/login`

---

## ⚠️ Notas Importantes

### 1. robots.txt NO es Seguridad

`robots.txt` solo **pide** a los bots que no indexen. Bots maliciosos pueden ignorarlo.

**Para seguridad real**: Usar autenticación + IP whitelist + VPN

---

### 2. HTTPS es Obligatorio

Si la app está en internet, **SIEMPRE** usar HTTPS:

```bash
# Con Certbot (Let's Encrypt)
sudo certbot --nginx -d tu-dominio.com
```

---

### 3. No Compartir el Dominio Públicamente

- ❌ No publicar en redes sociales
- ❌ No incluir en documentos públicos
- ✅ Solo compartir con usuarios autorizados

---

## 📝 Resumen

### Ya Implementado ✅

1. ✅ `robots.txt` bloqueando bots
2. ✅ Meta tags `noindex, nofollow`
3. ✅ Autenticación obligatoria
4. ✅ Rutas protegidas

### Próximos Pasos (Opcionales)

- [ ] IP Whitelist (si todos están en misma red)
- [ ] Tailscale VPN (si acceso remoto)
- [ ] 2FA (para máxima seguridad)

---

**La app ya está protegida contra indexación y requiere login. Para mayor seguridad, considera agregar VPN o IP whitelist.** 🔒
