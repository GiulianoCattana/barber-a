# 📧 Configuración de Emails - Wonder Barber

## ✅ Estado Actual

El sistema de emails está configurado con **doble modo**:
- **Local/Desarrollo**: Gmail SMTP
- **Producción**: Resend API

## 🔧 Configuración

### Variables de Entorno

#### Para Desarrollo (Local):
```env
EMAIL_USER=wonderbarber2025@gmail.com
EMAIL_PASSWORD=tkrmdefmjvjzolpj
```

#### Para Producción (Render/Vercel/Railway):
```env
RESEND_API_KEY=re_84Bi9Yak_MPu4prjRjwPzcCGxyYiMcLas
```

## 📨 Cómo Funciona

El sistema detecta automáticamente qué servicio usar:

```javascript
// Si existe RESEND_API_KEY → Usa Resend
// Si NO existe → Usa Gmail SMTP

const usarResend = !!process.env.RESEND_API_KEY;
```

### En Local (Sin RESEND_API_KEY):
✅ Usa Gmail SMTP (puerto 465)
✅ Funciona sin problemas

### En Producción (Con RESEND_API_KEY):
✅ Usa Resend API
✅ No necesita puertos SMTP (usa HTTP)
✅ Más confiable en hosting

## ⚠️ IMPORTANTE: Resend en Modo Prueba

**Resend tiene una limitación en el plan gratuito:**

> Solo puedes enviar emails a **tu propio email** (giulianocattana@gmail.com) hasta que verifiques un dominio.

### Opciones:

#### Opción 1: Usar Resend en Modo Prueba (Actual)
- ✅ **Gratis**
- ⚠️ Solo envía a: `giulianocattana@gmail.com`
- ⚠️ Perfecto para testing, NO para producción real

#### Opción 2: Verificar un Dominio en Resend
1. Ve a: https://resend.com/domains
2. Agrega tu dominio (ej: `wonderbarber.com`)
3. Configura los registros DNS
4. Cambia el `from`:
   ```javascript
   from: 'Wonder Barber <noreply@wonderbarber.com>'
   ```
5. ✅ Podrás enviar a cualquier email

#### Opción 3: Seguir Usando Gmail SMTP en Producción
- NO configurar `RESEND_API_KEY` en Render
- Configurar solo:
  ```env
  EMAIL_USER=wonderbarber2025@gmail.com
  EMAIL_PASSWORD=tkrmdefmjvjzolpj
  ```
- ⚠️ **PROBLEMA**: Render bloquea puertos SMTP (puede no funcionar)

## 🚀 Para Producción (Render)

### Paso 1: Ir a tu Web Service en Render
https://dashboard.render.com

### Paso 2: Environment Variables
Agregar SOLO UNA de estas opciones:

**Opción A: Usar Resend (Recomendado para testing)**
```
RESEND_API_KEY=re_84Bi9Yak_MPu4prjRjwPzcCGxyYiMcLas
```

**Opción B: Usar Gmail SMTP (Puede fallar)**
```
EMAIL_USER=wonderbarber2025@gmail.com
EMAIL_PASSWORD=tkrmdefmjvjzolpj
```

### Paso 3: Redeploy
Render detectará los cambios automáticamente.

## 🧪 Testing

### Test con Gmail SMTP:
```bash
cd backend
node -e "require('dotenv').config(); ..."
```

### Test con Resend:
```bash
cd backend
node test-resend-simple.js
```

## 📋 Resumen

| Entorno | Servicio | Variable | Estado |
|---------|----------|----------|--------|
| **Local** | Gmail SMTP | `EMAIL_USER` + `EMAIL_PASSWORD` | ✅ Funciona |
| **Producción (Testing)** | Resend | `RESEND_API_KEY` | ✅ Solo a giulianocattana@gmail.com |
| **Producción (Real)** | Resend + Dominio | `RESEND_API_KEY` + dominio verificado | ⏳ Pendiente verificar dominio |

## 🎯 Recomendación

Para **uso real en producción con clientes**:
1. Comprar un dominio (ej: `wonderbarber.com`) - $10/año
2. Verificarlo en Resend
3. Usar Resend con tu dominio
4. ✅ Emails ilimitados y profesionales

Para **testing y desarrollo**:
- Gmail SMTP en local ✅
- Resend en producción solo para tu email ✅

## 📞 Soporte

Si tenés problemas con emails en producción:
1. Revisar los logs de Render
2. Verificar que la variable esté configurada
3. Probar envío manual con el script de test
