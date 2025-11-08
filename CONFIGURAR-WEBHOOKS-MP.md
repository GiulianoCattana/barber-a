# 🚀 Configuración de Webhooks de Mercado Pago

## ⚡ Activación Automática de Suscripción

Para que la suscripción se active **automáticamente** al recibir el pago, necesitás configurar webhooks en Mercado Pago.

---

## 📋 Paso 1: Configurar Webhook en Mercado Pago

### A. Ingresar a tu cuenta de Mercado Pago

1. Entrá a: https://www.mercadopago.com.ar
2. Iniciá sesión con tu cuenta

### B. Ir a Configuración de Webhooks

1. Ve a: **"Tu negocio"** (esquina superior derecha)
2. Seleccioná: **"Configuración"**
3. En el menú lateral: **"Notificaciones webhooks"** o **"Webhooks"**

### C. Crear Nuevo Webhook

1. Hacé clic en **"Crear nueva configuración"** o **"+ Nuevo webhook"**
2. Completá los datos:

```
Nombre: Suscripciones WonderBarber
URL de producción: https://TU-DOMINIO.onrender.com/api/webhook/mercadopago
Eventos: ✓ Pagos (payments)
```

**⚠️ IMPORTANTE**:
- Reemplazá `TU-DOMINIO` por tu dominio real de Render
- Si todavía no desplegaste en Render, usá ngrok (ver más abajo)

3. Guardá la configuración

---

## 🌐 Si estás en DESARROLLO LOCAL (localhost)

No podés usar `localhost` directamente porque Mercado Pago no puede llegar a tu PC. Necesitás **ngrok**:

### Instalar ngrok

```bash
# Windows (con chocolatey)
choco install ngrok

# O descargá desde: https://ngrok.com/download
```

### Ejecutar ngrok

```bash
# En una terminal nueva, ejecutá:
ngrok http 3000
```

Esto te dará una URL como: `https://abc123.ngrok.io`

### Configurar en Mercado Pago

Usá esta URL en el webhook:
```
https://abc123.ngrok.io/api/webhook/mercadopago
```

**Nota**: La URL de ngrok cambia cada vez que lo ejecutás. Tendrás que actualizar el webhook cada vez.

---

## 🔍 Paso 2: Probar el Webhook

### Hacer un pago de prueba

1. En el dashboard del admin, clic en "Renovar Suscripción"
2. Se abre el link: https://mpago.la/2Cf9bkf
3. Pagá $25,000
4. Esperá 5-10 segundos

### Verificar que funcionó

1. En los logs del backend deberías ver:
```
Webhook recibido de Mercado Pago
Payment ID recibido: 1234567890
Suscripción renovada exitosamente
```

2. Recargá el dashboard y verificá:
- La fecha de vencimiento se extendió 30 días
- El banner cambió a verde/activo

---

## 📊 Cómo Funciona el Flujo Automático

```
1. Admin hace clic: "Renovar Suscripción ($25,000)"
   ↓
2. Se abre: https://mpago.la/2Cf9bkf
   ↓
3. Admin paga con tarjeta/transferencia
   ↓
4. Mercado Pago envía webhook a tu servidor
   POST /api/webhook/mercadopago
   ↓
5. Tu servidor procesa el pago:
   - Verifica que el monto sea $25,000
   - Busca el usuario por email
   - Registra el pago en la BD
   - Extiende la suscripción 30 días
   ↓
6. ✅ Suscripción activada automáticamente
```

---

## 🔒 Seguridad: Verificar Email del Pagador

Para que el webhook sepa a qué admin asignarle el pago, el sistema usa el **email del pagador**.

**Asegurate que**:
- El admin pague con una cuenta de Mercado Pago
- El email de esa cuenta sea el mismo que el del admin en tu sistema
- Si el email no coincide, el pago no se asignará automáticamente

### Alternativa Manual

Si el email no coincide o el webhook falla:
1. El admin puede usar el botón "Ya pagué"
2. Ingresa el ID de pago de Mercado Pago
3. Sistema registra el pago manualmente

---

## 🚀 En Producción (Render)

Cuando despliegues en Render, tu URL será automática:

```
https://tu-app-nombre.onrender.com/api/webhook/mercadopago
```

**Pasos**:
1. Desplegá tu app en Render
2. Copiá la URL de tu app
3. Agregá `/api/webhook/mercadopago` al final
4. Configurá esa URL en Mercado Pago
5. ¡Listo! Funciona automáticamente

---

## 🧪 Probar sin Pagar (Para Testing)

Para probar el webhook sin hacer un pago real:

1. En Mercado Pago, ve a la configuración del webhook
2. Hacé clic en "Enviar prueba" o "Test"
3. Seleccioná evento tipo: "payment.created" o "payment.approved"
4. Enviá la prueba
5. Verificá los logs de tu backend

---

## ❓ Problemas Comunes

### "El webhook no se recibe"

1. Verificá que tu servidor esté corriendo
2. Si es localhost, verificá que ngrok esté activo
3. Revisá los logs de Mercado Pago para ver errores
4. Verificá que la URL del webhook sea correcta

### "El pago se hizo pero no se activó"

1. Revisá los logs del backend
2. Verificá que el email del pagador coincida con el admin
3. Usá el botón "Ya pagué" + ID de pago como alternativa

### "Error 500 en el webhook"

1. Revisá los logs del backend para ver el error exacto
2. Verificá que la base de datos esté corriendo
3. Verificá que el admin exista en la BD

---

## 📞 Información de tu Configuración Actual

- **Link de pago**: https://mpago.la/2Cf9bkf
- **Monto**: $25,000
- **Endpoint webhook**: `/api/webhook/mercadopago`
- **Email admin**: wonderbarber2025@gmail.com

---

## ✅ Resumen

1. **Desarrollo**: Usá ngrok para exponer tu localhost
2. **Producción**: Usá tu URL de Render
3. **Configurá** el webhook en Mercado Pago
4. **Probá** haciendo un pago
5. **Verificá** que se active automáticamente

Si el webhook falla, siempre tenés el **método manual** con ID de pago como respaldo.
