# ⚠️ Verificación de Email DESHABILITADA

## 📋 Estado Actual

La verificación de email está **temporalmente deshabilitada** para permitir el lanzamiento rápido sin necesidad de dominio.

### ✅ Cómo Funciona Ahora:

1. **Registro**:
   - Usuario se registra con email y contraseña
   - ✅ Se crea inmediatamente como verificado
   - ✅ Recibe token JWT automáticamente
   - ✅ Puede usar el sistema sin esperar ningún email

2. **Login**:
   - ✅ Puede loguearse inmediatamente
   - ✅ No se valida si el email está verificado

### ⚠️ Desventaja:

- Los usuarios pueden registrarse con emails falsos (ej: `test@test.com`)
- No hay validación de que el email sea real

---

## 🔄 Para ACTIVAR la Verificación (Cuando tengas dominio)

### Paso 1: Conseguir un Dominio

Opciones:
- **Namecheap**: $0.98/año (.xyz)
- **NIC Argentina**: ~$700 ARS/año (.com.ar)
- **Freenom**: Gratis (.tk, .ml) - Cuando vuelva a funcionar

### Paso 2: Verificar el Dominio en Resend

1. Ve a: https://resend.com/domains
2. Agrega tu dominio (ej: `wonderbarber.xyz`)
3. Configura los registros DNS que te dé Resend
4. Espera verificación (5-15 minutos)

### Paso 3: Actualizar el Código

**Archivo**: `backend/src/services/emailService.js`

Cambiar línea 141:
```javascript
// ANTES:
from: 'Wonder Barber <onboarding@resend.dev>',

// DESPUÉS:
from: 'Wonder Barber <noreply@tudominio.xyz>',
```

### Paso 4: Descomentar el Código de Verificación

**Archivo**: `backend/src/controllers/authController.js`

#### En la función `registro` (líneas 24-65):

**BUSCAR:**
```javascript
// VERIFICACIÓN DE EMAIL DESHABILITADA TEMPORALMENTE
// Los usuarios pueden usar el sistema inmediatamente después de registrarse
const emailVerificado = true; // Auto-verificado para lanzamiento rápido
```

**REEMPLAZAR con:**
```javascript
// VERIFICACIÓN DE EMAIL HABILITADA
const esCliente = true;
const emailVerificado = false; // Necesita verificar email
```

**Y DESCOMENTAR** (líneas 36-46):
```javascript
// Si es cliente, enviar código de verificación
if (esCliente) {
  try {
    await enviarEmailVerificacion(email, nombre);
    console.log(`✅ Código de verificación enviado a ${email}`);
  } catch (emailError) {
    console.error('Error al enviar email:', emailError);
    await pool.query('DELETE FROM usuarios WHERE id = $1', [usuario.id]);
    return res.status(500).json({
      mensaje: 'Error al enviar el código de verificación. Por favor intenta nuevamente.'
    });
  }

  return res.status(201).json({
    mensaje: '¡Registro exitoso! Revisa tu email para verificar tu cuenta.',
    requiresVerification: true,
    email: usuario.email
  });
}
```

**Y ELIMINAR** (líneas 48-65):
```javascript
// Generar token para login automático
const token = jwt.sign(...);
res.status(201).json({...});
```

#### En la función `login` (líneas 95-106):

**DESCOMENTAR:**
```javascript
if (usuario.rol === 'cliente' && !usuario.email_verificado) {
  return res.status(403).json({
    mensaje: 'Por favor verifica tu email antes de iniciar sesión',
    requiresVerification: true,
    email: usuario.email
  });
}
```

### Paso 5: Reiniciar el Backend

El backend se reiniciará automáticamente y la verificación estará activa.

### Paso 6: Configurar Variable en Producción

En Render, agregar:
```
RESEND_API_KEY=re_SmfjKAaD_633Vbn3bJAykjan8nAjSrGMC
```

---

## 📊 Comparación

| Característica | SIN Verificación (Actual) | CON Verificación |
|----------------|--------------------------|-------------------|
| Registro rápido | ✅ Inmediato | ⏳ Espera email |
| Emails falsos | ⚠️ Permitidos | ✅ Bloqueados |
| Necesita dominio | ❌ No | ✅ Sí |
| Listo para producción | ✅ Sí (temporal) | ✅ Sí (definitivo) |

---

## 🎯 Recomendación

**Para lanzar AHORA**: Dejar como está (sin verificación) ✅

**Para producción definitiva**: Conseguir dominio y activar verificación

---

## 📝 Notas

- El código de verificación ya está implementado
- Solo falta activarlo cuando tengas dominio
- Los cambios son reversibles en cualquier momento
- Resend API Key ya configurado: `re_SmfjKAaD_633Vbn3bJAykjan8nAjSrGMC`
