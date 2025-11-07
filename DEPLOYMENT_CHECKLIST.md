# Checklist de Despliegue - Sistema de Peluquería

## ✅ Verificaciones Completadas

### 1. Estructura de Archivos y Dependencias
- ✅ Backend: Node.js con Express
- ✅ Frontend: Angular 17
- ✅ Base de datos: PostgreSQL
- ✅ Todas las dependencias instaladas correctamente
- ⚠️ Dependencias ligeramente desactualizadas (no crítico)

### 2. Variables de Entorno
- ✅ `.env.example` actualizado con todas las variables necesarias
- ✅ `.env` en `.gitignore`
- ⚠️ **CRÍTICO**: El archivo `.env` actual contiene credenciales reales

### 3. Endpoints del Backend
- ✅ API principal funcionando: `http://localhost:3000/`
- ✅ Endpoints de autenticación
- ✅ Endpoints de turnos
- ✅ Endpoints de servicios
- ✅ Endpoints de galería
- ✅ Endpoints de recuperación de contraseña
- ✅ Endpoints de horarios bloqueados

### 4. Base de Datos
- ✅ Schema SQL disponible en `backend/database/schema.sql`
- ✅ Scripts de migración disponibles
- ✅ Datos de prueba limpiados
- ✅ Usuario administrador configurado: wonderbarber2025@gmail.com

### 5. Build del Frontend
- ✅ Build de producción exitoso
- ✅ Archivos generados en `frontend/dist/frontend`
- ✅ Tamaño del bundle: 537.74 kB (comprimido: 115.17 kB)

### 6. Seguridad
- ✅ Contraseñas hasheadas con bcrypt
- ✅ JWT para autenticación
- ✅ Variables de entorno para credenciales
- ⚠️ CORS abierto a todos los orígenes (debe configurarse en producción)
- ✅ Protección de rutas con middleware de autenticación

---

## 🚨 Acciones Críticas ANTES de Subir a Hosting

### 1. Configurar Variables de Entorno en el Hosting

**NO subir el archivo `.env` con las credenciales reales.** En su lugar, configurar estas variables en el panel del hosting:

```env
PORT=3000
DB_HOST=tu_host_de_base_de_datos
DB_PORT=5432
DB_NAME=peluqueria_db
DB_USER=tu_usuario_db
DB_PASSWORD=tu_password_seguro_db
JWT_SECRET=genera_una_clave_secreta_muy_larga_y_aleatoria_aqui
EMAIL_USER=wonderbarber2025@gmail.com
EMAIL_PASSWORD=tkrmdefmjvjzolpj
```

**Importante**:
- Genera un nuevo `JWT_SECRET` seguro (min 32 caracteres aleatorios)
- Usa las credenciales de base de datos proporcionadas por tu hosting

### 2. Configurar CORS para Producción

Editar `backend/src/index.js` línea 20:

```javascript
// Desarrollo (actual)
app.use(cors());

// Producción (cambiar a esto)
app.use(cors({
  origin: ['https://tu-dominio.com', 'https://www.tu-dominio.com'],
  credentials: true
}));
```

### 3. Configurar URL del Backend en el Frontend

Editar los archivos de servicios en `frontend/src/app/services/*.service.ts` para usar la URL de producción:

```typescript
// Desarrollo
private apiUrl = 'http://localhost:3000/api';

// Producción - Usar variable de entorno
private apiUrl = environment.production
  ? 'https://api.tu-dominio.com/api'
  : 'http://localhost:3000/api';
```

Crear archivo `frontend/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.tu-dominio.com'
};
```

### 4. Configurar Base de Datos en Producción

1. Crear la base de datos en el hosting
2. Ejecutar el schema: `backend/database/schema.sql`
3. Ejecutar migraciones adicionales:
   - `backend/create-services-table.js`
   - `backend/crear-tabla-galeria.js`
   - `backend/create-bloqueados-table.js`
   - `backend/crear-tabla-dias-bloqueados.js`
   - `backend/crear-tablas-admin-home.js`

4. Actualizar email del admin:
   ```bash
   node backend/update-admin-email.js
   node backend/update-admin-password.js
   ```

### 5. Configuración de Uploads

Asegurarse de que el directorio `backend/uploads` tenga permisos de escritura:
```bash
chmod 755 backend/uploads
```

---

## 📦 Hostings Recomendados

### Opción 1: Vercel (Frontend) + Railway (Backend + DB)
- **Frontend**: Vercel (gratis para Angular)
- **Backend + DB**: Railway ($5/mes con PostgreSQL incluido)

### Opción 2: Render (Todo en uno)
- **Frontend y Backend**: Render (plan gratuito disponible)
- **Base de datos**: Render PostgreSQL (plan gratuito con límites)

### Opción 3: DigitalOcean (Más control)
- **VPS**: DigitalOcean Droplet ($6/mes)
- **Todo instalado en el mismo servidor**

---

## 🚀 Pasos de Despliegue

### Para Railway (Backend + PostgreSQL)

1. Crear cuenta en [Railway.app](https://railway.app)
2. Crear nuevo proyecto
3. Agregar servicio PostgreSQL
4. Agregar servicio Node.js
5. Conectar repositorio GitHub
6. Configurar variables de entorno
7. Railway detectará automáticamente `npm start`

### Para Vercel (Frontend)

1. Crear cuenta en [Vercel.com](https://vercel.com)
2. Importar proyecto desde GitHub
3. Configurar:
   - Framework: Angular
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist/frontend/browser`
4. Configurar variable de entorno `API_URL`
5. Deploy

---

## 🔐 Credenciales Actuales

### Administrador
- **Email**: wonderbarber2025@gmail.com
- **Password**: admin123

### Base de Datos Local
- **Host**: localhost
- **Puerto**: 5432
- **Database**: peluqueria_db
- **Usuario**: postgres
- **Password**: 123

### Email (Gmail)
- **Usuario**: wonderbarber2025@gmail.com
- **App Password**: tkrmdefmjvjzolpj

---

## 📊 Resumen del Sistema

### Servicios Configurados
- 5 servicios de peluquería activos

### Tablas en la Base de Datos
- `usuarios` (admin y clientes)
- `turnos` (reservas)
- `servicios` (servicios ofrecidos)
- `galeria` (imágenes de trabajos)
- `horarios_bloqueados` (horarios no disponibles)
- `dias_bloqueados` (días completos bloqueados)
- `slider_imagenes` (carrusel del home)
- `home_servicios` (servicios destacados del home)

### Funcionalidades
- ✅ Sistema de autenticación (JWT)
- ✅ Registro y login de clientes
- ✅ Reserva de turnos
- ✅ Gestión de servicios (admin)
- ✅ Galería de trabajos
- ✅ Recuperación de contraseña por email
- ✅ Bloqueo de horarios y días
- ✅ Dashboard admin y cliente
- ✅ Gestión de contenido del home

---

## ⚠️ Problemas Conocidos y Soluciones

### CORS Errors
Si ves errores de CORS en producción, verificar:
1. La configuración de CORS en `backend/src/index.js`
2. Que el frontend esté usando la URL correcta del backend

### 401 Unauthorized
Si aparece este error:
1. Limpiar localStorage del navegador
2. Hacer logout y login nuevamente
3. Verificar que el JWT_SECRET sea el mismo

### Imágenes no se cargan
1. Verificar permisos del directorio `uploads`
2. Verificar que la URL del backend sea correcta
3. Verificar que las rutas estáticas estén configuradas

---

## 📞 Contacto de Soporte

Para problemas técnicos durante el despliegue, revisar los logs del servidor y la consola del navegador.
