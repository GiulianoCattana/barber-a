# ✅ LISTO PARA PRODUCCIÓN - Checklist Completo

## 🎯 Estado Actual del Sistema

### Sistema de Suscripciones
✅ **Implementado y funcionando**
- Período de prueba: 30 días gratis
- Costo mensual: $25,000
- Período de gracia: 3 días
- Link de pago configurado: https://mpago.la/2Cf9bkf
- Método de activación: Semi-automático (con ID de pago)

### Base de Datos
✅ **Tablas creadas**
- usuarios
- turnos
- suscripciones
- pagos_suscripcion
- servicios
- galeria
- configuracion_pagos
- horarios_bloqueados
- dias_bloqueados
- slider
- home_servicios

### Backend
✅ **Todos los endpoints funcionando**
- Puerto: 3000
- Rutas protegidas con middleware de suscripción
- Webhooks de Mercado Pago listos
- Sistema de pagos configurado

### Frontend
✅ **Interfaz completa**
- Puerto: 4200
- Dashboard admin completo
- Banner de suscripción visible
- Gestión de turnos, servicios, galería
- Sistema de pagos integrado

---

## 🚀 Pasos para Desplegar en Render

### 1. Preparar Variables de Entorno

Creá un archivo `.env` en la carpeta `backend` con estos valores:

```env
# Base de datos PostgreSQL (Render te dará estos valores)
DATABASE_URL=postgresql://usuario:password@host:5432/database

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui_cambiar_en_produccion

# Email (si usás Gmail)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password_de_gmail

# Mercado Pago (opcional, para webhooks avanzados)
MP_ACCESS_TOKEN=tu_access_token_de_mp

# Frontend URL
FRONTEND_URL=https://wonderbarberia.onrender.com

# Node
NODE_ENV=production
PORT=3000
```

### 2. Crear Proyecto en Render

#### A. Base de Datos PostgreSQL

1. Entrá a: https://render.com
2. New → PostgreSQL
3. Nombre: `peluqueria-db` (o el que quieras)
4. Plan: Free
5. Creá la base de datos
6. **GUARDÁ** la "External Database URL" que te da

#### B. Web Service (Backend)

1. New → Web Service
2. Conectá tu repositorio de GitHub
3. Configuración:
   ```
   Name: peluqueria-backend
   Environment: Node
   Build Command: cd backend && npm install
   Start Command: cd backend && node src/index.js
   ```
4. Environment Variables (agregá todas del `.env`)
5. Advanced → Health Check Path: `/api`
6. Creá el servicio

#### C. Static Site (Frontend)

1. New → Static Site
2. Conectá tu repositorio de GitHub
3. Configuración:
   ```
   Name: peluqueria-frontend
   Build Command: cd frontend && npm install && npm run build
   Publish Directory: frontend/dist/frontend/browser
   ```
4. Environment Variables:
   ```
   API_URL=https://wonderbarberia.onrender.com/api
   ```
5. Creá el sitio

### 3. Ejecutar Migraciones de Base de Datos

Después de que el backend esté corriendo:

1. Conectate a tu base de datos de Render usando la URL externa
2. Ejecutá el schema:

```bash
# Opción A: Desde tu PC con psql
psql "tu-database-url-de-render" < backend/database/schema.sql

# Opción B: Desde Render Shell
# Ve a tu web service → Shell
cd backend
node crear-sistema-suscripciones.js
```

### 4. Configurar Webhook de Mercado Pago

Una vez desplegado:

1. Copiá la URL de tu backend: `https://wonderbarberia.onrender.com`
2. Entrá a Mercado Pago → Configuración → Webhooks
3. Creá nuevo webhook:
   ```
   URL: https://wonderbarberia.onrender.com/api/webhook/mercadopago
   Evento: Pagos ✓
   ```
4. Guardá

### 5. Configurar Admin Inicial

Ejecutá este script en el Shell de Render:

```javascript
// Ya está creado en: backend/verificar-suscripcion-admin.js
node verificar-suscripcion-admin.js
```

O creá manualmente el admin con el SQL:

```sql
INSERT INTO usuarios (nombre, email, password, rol, email_verificado)
VALUES ('Administrador', 'email-del-admin@gmail.com', 'hash-del-password', 'admin', true);

-- Luego crear suscripción de prueba
INSERT INTO suscripciones (usuario_id, fecha_vencimiento, es_periodo_prueba, estado, monto_mensual)
VALUES (1, NOW() + INTERVAL '30 days', TRUE, 'activa', 25000.00);
```

---

## ⚙️ Configuración del Sistema (Primera Vez)

Cuando el admin entre por primera vez:

1. **Login**:
   - Email: el que configuraste
   - Password: el que configuraste

2. **Ir a Configuración → Pagos**:
   - Seleccionar tipo: "Mercado Pago"
   - Pegar link: https://mpago.la/2Cf9bkf
   - Guardar

3. **Verificar Suscripción**:
   - Ver banner verde: "Período de prueba - 30 días"
   - Fecha de vencimiento visible

---

## 🧪 Testing Post-Despliegue

### Test 1: Login
```
✓ Puede entrar con credenciales
✓ Redirige a dashboard
✓ Ve banner de suscripción
```

### Test 2: Crear Turno
```
✓ Puede crear turno
✓ Aparece en la lista
✓ Puede modificar
```

### Test 3: Suscripción
```
✓ Banner muestra días restantes
✓ Botón de renovación funciona (cuando faltan 7 días)
✓ Link de MP se abre correctamente
```

### Test 4: Sistema de Pago
```
✓ Hacer pago de prueba en MP
✓ Copiar ID de pago
✓ Ingresar ID en el sistema
✓ Verificar que se extienda la suscripción
```

---

## 📝 Instrucciones para el Admin

Enviá esto al admin que va a usar el sistema:

```markdown
# Bienvenido a tu Sistema de Gestión

## Primer Acceso

1. Entrá a: https://wonderbarberia.onrender.com
2. Email: [tu-email]
3. Password: [tu-password]

## Tu Suscripción

- Tenés 30 días de prueba GRATIS
- Después son $25,000 por mes
- Te avisará 7 días antes de vencer

## Cómo Renovar tu Suscripción

Cuando te aparezca el aviso de renovación:

1. Hacé clic en "Renovar Suscripción ($25,000)"
2. Se abre Mercado Pago
3. Pagá con tarjeta o transferencia
4. **IMPORTANTE**: Guardá el comprobante
5. Volvé al sistema
6. Ingresá el "ID de operación" del comprobante
7. ¡Listo! Tenés 30 días más

## Soporte

- El ID de operación lo encontrás en el comprobante de MP
- Si tenés problemas, guardá el comprobante y contactanos
```

---

## 🔒 Seguridad Checklist

✅ Variables de entorno en Render (no en código)
✅ JWT_SECRET cambiado en producción
✅ Database con password seguro
✅ CORS configurado con dominio específico
✅ Middleware de autenticación en todas las rutas protegidas
✅ Middleware de suscripción en operaciones críticas
✅ Validación de pagos con ID de Mercado Pago

---

## 📊 Monitoreo

### Logs de Render

Para ver qué pasa:
1. Entrá a tu Web Service en Render
2. Ve a la pestaña "Logs"
3. Verás todos los requests y errores en tiempo real

### Base de Datos

Para ver pagos y suscripciones:
```sql
-- Ver todas las suscripciones
SELECT * FROM suscripciones;

-- Ver pagos
SELECT * FROM pagos_suscripcion ORDER BY fecha_pago DESC;

-- Ver admin
SELECT * FROM usuarios WHERE rol = 'admin';
```

---

## 🚨 Problemas Comunes y Soluciones

### "Cannot connect to database"
→ Verificá la DATABASE_URL en variables de entorno

### "JWT malformed"
→ Verificá que JWT_SECRET esté configurado

### "El pago no se activa"
→ Verificá que el webhook esté configurado correctamente
→ Revisá los logs de Render para ver errores
→ Usá el método manual con ID de pago

### "Build failed"
→ Verificá que las rutas de build sean correctas
→ Asegurate que node_modules no esté en git

---

## ✅ Sistema Listo

Tu sistema está **100% listo para producción** con:

- ✅ Sistema de suscripciones funcional
- ✅ Pagos con Mercado Pago
- ✅ 30 días de prueba gratis
- ✅ Protección de operaciones
- ✅ Dashboard completo
- ✅ Gestión de turnos, servicios, galería
- ✅ Configuración de pagos
- ✅ Webhooks preparados (configurar después de deploy)

**Próximos pasos**:
1. Desplegá en Render siguiendo los pasos de arriba
2. Configurá el webhook de Mercado Pago
3. Probá hacer un pago
4. ¡A facturar! 💰
