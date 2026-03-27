# 🔧 ARREGLAR EXPORTACIÓN PDF

## ❌ PROBLEMA

**Error:** `doc.autoTable is not a function`

**Causa:** Versión incompatible de jspdf

**Versiones actuales:**
- `jspdf`: 4.2.1 ❌ (muy antigua)
- `jspdf-autotable`: 5.0.7 ✅

**Versiones requeridas:**
- `jspdf`: 2.5.1 o superior
- `jspdf-autotable`: 3.8.2

---

## ✅ SOLUCIÓN

### Paso 1: Actualizar Dependencias

```bash
cd frontend
npm uninstall jspdf jspdf-autotable
npm install jspdf@2.5.1 jspdf-autotable@3.8.2
```

### Paso 2: Verificar package.json

Después de instalar, verifica que `frontend/package.json` tenga:

```json
{
  "dependencies": {
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.2"
  }
}
```

### Paso 3: Habilitar el Botón PDF

En `frontend/src/pages/Reports.jsx`, cambiar:

```jsx
// Quitar el disabled
<Button 
  onClick={handleExportPDF} 
  variant="outline" 
  size="sm"
>
  <Download className="h-4 w-4 mr-2" />
  PDF
</Button>
```

### Paso 4: Reiniciar el Servidor

```bash
# Detener el servidor (Ctrl+C)
# Volver a iniciar
npm run dev
```

---

## 🎯 ESTADO ACTUAL

**Funcionando:**
- ✅ Exportación CSV
- ✅ Exportación Excel

**Deshabilitado temporalmente:**
- ⏸️ Exportación PDF (botón deshabilitado)

**Razón:**
- Evitar errores en consola
- Mantener la app funcional
- Fácil de habilitar después de actualizar

---

## 📝 ALTERNATIVA: Actualizar Ahora

Si quieres actualizar ahora mismo:

```bash
cd frontend
npm install jspdf@latest jspdf-autotable@latest
```

Luego en `Reports.jsx` línea 180-189, cambiar a:

```jsx
<Button onClick={handleExportPDF} variant="outline" size="sm">
  <Download className="h-4 w-4 mr-2" />
  PDF
</Button>
```

Y reiniciar el servidor.

---

## ⚠️ NOTA IMPORTANTE

La versión antigua de jspdf (4.2.1) es de 2019 y tiene muchas vulnerabilidades de seguridad. Se recomienda actualizar lo antes posible.

---

**Última actualización:** 26 de marzo de 2026  
**Estado:** Botón PDF deshabilitado hasta actualizar dependencias
