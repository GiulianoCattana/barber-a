# Configuración de Mercado Pago para Suscripciones

## Sistema Implementado

Tu sistema de suscripciones está completo con:

✅ **Sistema Manual**: Admin paga y confirma el pago (Ya funciona)
✅ **Webhooks Automáticos**: Mercado Pago notifica automáticamente los pagos (Requiere configuración)

## 📋 Configuración Paso a Paso

### 1. Crear Link de Pago en Mercado Pago

1. Entra a tu cuenta de Mercado Pago: https://www.mercadopago.com.ar
2. Ve a **"Cobrar" → "Link de pago"**
3. Crea un nuevo link de pago con:
   - **Título**: "Suscripción Mensual WonderBarber"
   - **Precio**: $25,000
   - **Cantidad de usos**: Ilimitado (para que lo uses cada mes)
4. Copia el link generado (ej: https://mpago.la/XXXXX)

### 2. Configurar el Link en tu Sistema

1. Entra a tu dashboard admin
2. Ve a **Configuración → Configuración de Pagos**
3. Selecciona tipo de pago: **"Mercado Pago"**
4. Pega el link en el campo **"Link de Mercado Pago"**
5. Guarda cambios

### 3. Configurar Webhooks (Opcional pero Recomendado)

Los webhooks permiten que tu sistema se active automáticamente cuando recibes un pago.

#### A. Obtener tu URL de Webhook

Tu URL de webhook es:
```
https://TU-DOMINIO.com/api/webhook/mercadopago
```

Si estás en desarrollo local, necesitas exponer tu localhost usando **ngrok**:

```bash
# Instalar ngrok
npm install -g ngrok

# Exponer tu puerto 3000
ngrok http 3000
```

Ngrok te dará una URL como: `https://abc123.ngrok.io`
Tu webhook sería: `https://abc123.ngrok.io/api/webhook/mercadopago`

#### B. Configurar Webhook en Mercado Pago

1. Entra a tu cuenta de Mercado Pago
2. Ve a **"Tu negocio" → "Configuración" → "Notificaciones"**
3. En **"Webhooks"** haz clic en **"Configurar notificaciones"**
4. Agrega tu URL de webhook: `https://TU-DOMINIO.com/api/webhook/mercadopago`
5. Selecciona el evento: **"Pagos"**
6. Guarda

#### C. Probar el Webhook

1. En Mercado Pago, ve a la sección de webhooks
2. Usa la opción **"Probar webhook"**
3. Verifica que tu servidor reciba la notificación (aparecerá en los logs del backend)

## 💳 Flujo de Pago para el Administrador

### Opción 1: Pago Manual (Ya funciona sin configuración)

1. Admin hace clic en **"Renovar Suscripción ($25,000)"**
2. Se abre Mercado Pago en nueva pestaña
3. Admin paga (tarjeta, transferencia, etc.)
4. Admin vuelve al dashboard
5. Aparece botón **"Sí, ya pagué"**
6. Admin hace clic y la suscripción se activa inmediatamente

### Opción 2: Pago Automático (Con webhooks configurados)

1. Admin hace clic en **"Renovar Suscripción ($25,000)"**
2. Se abre Mercado Pago en nueva pestaña
3. Admin paga
4. Mercado Pago notifica automáticamente a tu servidor
5. La suscripción se activa automáticamente
6. Admin recarga la página y ve su suscripción activa

## 🔒 Seguridad

El sistema actual acepta confirmaciones manuales del admin porque:
- Es para un solo admin (tú)
- No hay riesgo de fraude interno
- Simplifica el proceso

Si en el futuro quisieras hacer esto multi-tenant (varios clientes), deberías:
- Validar el pago con la API de Mercado Pago antes de activar
- Implementar firma de webhooks
- Guardar comprobantes

## 🚀 Producción

Cuando subas a producción (Render):

1. Tu URL de webhook será automática: `https://tu-app.onrender.com/api/webhook/mercadopago`
2. Actualiza esta URL en Mercado Pago
3. No necesitas ngrok en producción

## 📊 Verificar que Funciona

1. **Sistema Manual**:
   - Haz clic en "Renovar Suscripción"
   - Paga en Mercado Pago
   - Vuelve y confirma
   - Verifica que tu suscripción se extienda 30 días

2. **Webhooks**:
   - Revisa los logs del backend después de pagar
   - Deberías ver: "Webhook recibido de Mercado Pago"
   - La suscripción debería activarse automáticamente

## ❓ Problemas Comunes

**"No se ha configurado el link de pago"**
→ Ve a Configuración → Pagos y agrega tu link de Mercado Pago

**"El webhook no se recibe"**
→ Verifica que la URL sea correcta y que esté expuesta (ngrok en desarrollo)

**"El pago se hizo pero no se activó"**
→ Usa el botón "Sí, ya pagué" para activar manualmente

## 🎯 Resumen

✅ **Sistema Actual**: Totalmente funcional con confirmación manual
✅ **Webhooks**: Opcional, requiere configuración en Mercado Pago
✅ **Costo**: $25,000 mensuales
✅ **Período de prueba**: 30 días gratis
✅ **Período de gracia**: 3 días adicionales después del vencimiento
