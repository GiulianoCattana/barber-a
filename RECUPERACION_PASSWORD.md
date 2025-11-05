# Sistema de Recuperación de Contraseña por Email

## ¿Cómo Funciona?

El sistema permite a los usuarios recuperar su contraseña mediante un código de verificación enviado a su email personal.

### Configuración Inicial del Administrador

**IMPORTANTE:** El administrador debe configurar su email personal en el perfil antes de olvidar su contraseña.

1. Ve al Dashboard de Administrador
2. Click en **"Mi Perfil"** (pestaña superior)
3. Configura tu email personal (ej: tu-email@gmail.com)
4. Guarda los cambios

**Este email es donde recibirás los códigos de recuperación si olvidas tu contraseña.**

---

### Flujo de Recuperación (3 Pasos)

1. **Paso 1: Ingresar Email**
   - Usuario ingresa su email registrado
   - Sistema genera código de 6 dígitos
   - Código se envía al email del usuario automáticamente
   - Código válido por 15 minutos

2. **Paso 2: Verificar Código**
   - Usuario ingresa el código recibido en su email
   - Sistema valida el código y verifica que no haya expirado
   - Si es correcto, permite avanzar

3. **Paso 3: Nueva Contraseña**
   - Usuario crea nueva contraseña (mínimo 6 caracteres)
   - Confirma la contraseña
   - Sistema actualiza la contraseña en la base de datos

---

## Configuración del Servicio de Email (Para el Dueño de la Peluquería)

**Importante:** Necesitas configurar UN email de la peluquería que se usará para ENVIAR todos los códigos de recuperación.

Los códigos se enviarán DESDE este email configurado, pero llegarán AL email personal de cada usuario.

### Pasos para Configurar Gmail:

1. **Crear una contraseña de aplicación de Gmail:**
   - Ve a tu cuenta de Google: https://myaccount.google.com/
   - Ve a **Seguridad** → **Verificación en dos pasos** (actívala si no está activa)
   - Busca **Contraseñas de aplicaciones**
   - Selecciona "Correo" y "Otro (nombre personalizado)"
   - Escribe: "Peluquería App"
   - Copia la contraseña de 16 caracteres que te genera

2. **Editar el archivo `.env` en la carpeta `backend`:**

```env
# Configuración de Email para recuperación de contraseña
# Este email ENVÍA los códigos de recuperación a los usuarios
EMAIL_USER=peluqueria@gmail.com
EMAIL_PASSWORD=tu-contraseña-de-aplicacion-aqui
```

3. **Reiniciar el servidor backend** para que los cambios tomen efecto.

### ¿Cómo Funciona en la Práctica?

- **Email configurado en .env:** `peluqueria@gmail.com` (envía los códigos)
- **Email del admin en su perfil:** `admin-personal@gmail.com` (recibe los códigos)
- Cuando el admin olvida su contraseña, el código se envía DESDE `peluqueria@gmail.com` HACIA `admin-personal@gmail.com`

---

## Modo de Prueba (Sin Email Configurado)

Si no configuras el email, el sistema seguirá funcionando pero **el código se mostrará en la consola del backend** en lugar de enviarse por email.

**Para probarlo sin configurar email:**

1. Ve a `http://localhost:4200/login`
2. Haz click en "¿Olvidaste tu contraseña?"
3. Ingresa el email: `admin@peluqueria.com`
4. Ve a la **consola del backend** (donde corre npm start)
5. Busca el mensaje: `Código enviado a admin@peluqueria.com: XXXXXX`
6. Copia el código de 6 dígitos
7. Ingresa el código en la página
8. Crea tu nueva contraseña

---

## Ventajas de Este Sistema

✅ **Automático** - No requiere intervención manual
✅ **Seguro** - Códigos temporales que expiran en 15 minutos
✅ **Escalable** - Funciona para múltiples usuarios simultáneamente
✅ **Profesional** - Estándar de la industria
✅ **Sin dependencias del administrador** - Los usuarios se recuperan solos

---

## Archivos Modificados

### Backend:
- `backend/src/services/emailService.js` - Servicio de envío de emails
- `backend/src/controllers/recoveryController.js` - Controladores de recuperación
- `backend/src/routes/recoveryRoutes.js` - Rutas de recuperación
- `backend/add-email-verification.js` - Script para agregar columnas a BD

### Frontend:
- `frontend/src/app/services/recovery.service.ts` - Servicio de recuperación
- `frontend/src/app/components/recuperar-password/` - Componente completo
- `frontend/src/app/components/login/login.component.html` - Link "¿Olvidaste tu contraseña?"
- `frontend/src/app/app.routes.ts` - Ruta `/recuperar-password`

### Base de Datos:
- Nueva columna: `codigo_verificacion` VARCHAR(6)
- Nueva columna: `codigo_expiracion` TIMESTAMP

---

## Testing

### Email de prueba:
- **Email:** admin@peluqueria.com
- **Password:** (la que configures después de recuperar)

### Flujo de prueba:
1. Ir a login
2. Click en "¿Olvidaste tu contraseña?"
3. Ingresar email
4. Revisar bandeja de entrada (o consola si no configuraste email)
5. Ingresar código
6. Crear nueva contraseña
7. Iniciar sesión con la nueva contraseña

---

## Solución de Problemas

**Problema:** No llega el email
**Solución:** Verifica que configuraste EMAIL_USER y EMAIL_PASSWORD en .env y reiniciaste el servidor

**Problema:** El código dice que expiró
**Solución:** Los códigos son válidos por 15 minutos. Solicita un nuevo código.

**Problema:** Error al enviar email
**Solución:** Verifica la consola del backend. El código se muestra ahí como respaldo.

---

## Producción

Para producción, considera usar servicios profesionales de email como:
- **SendGrid**
- **Amazon SES**
- **Mailgun**
- **Postmark**

Estos servicios tienen mejor deliverability y límites más altos que Gmail.
