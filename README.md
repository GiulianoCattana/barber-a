# 💈 Sistema de Gestión de Peluquería WonderBarber

Sistema completo de gestión con **sistema de suscripciones**, gestión de turnos, servicios, galería y más.

## 🚀 Características Principales

### Sistema de Suscripciones 💰
- **30 días de prueba GRATIS**
- Suscripción mensual de $25,000
- 3 días de gracia post-vencimiento
- Integración con Mercado Pago
- Activación semi-automática o con webhooks

### Dashboard de Clientes
- Registro y autenticación segura
- Ver turnos disponibles por fecha
- Reservar turnos con horario y servicio
- Ver historial de turnos
- Cancelar reservas

### Dashboard de Administrador
- **Sistema de suscripción visible en todo momento**
- Gestión completa de turnos
- Gestión de servicios y precios
- Galería de trabajos
- Bloqueo de horarios y días completos
- Configuración de métodos de pago (Alias, QR, Mercado Pago)
- Slider del home page
- Estadísticas en tiempo real
- Historial de clientes
- Notificaciones de turnos próximos

## Tecnologías Utilizadas

### Backend
- Node.js + Express
- PostgreSQL
- JWT para autenticación
- bcryptjs para hash de contraseñas
- CORS habilitado

### Frontend
- Angular 17
- Standalone Components
- RxJS
- HTTP Interceptors
- Guards para protección de rutas

## Instalación

### 1. Configurar Base de Datos PostgreSQL

Asegúrate de tener PostgreSQL instalado y corriendo.

```bash
# Crear la base de datos
psql -U postgres
CREATE DATABASE peluqueria_db;
\q

# Ejecutar el script de creación de tablas
psql -U postgres -d peluqueria_db -f backend/database/schema.sql
```

### 2. Configurar Backend

```bash
# Ir a la carpeta del backend
cd backend

# Instalar dependencias
npm install

# Crear archivo .env basado en .env.example
cp .env.example .env

# Editar .env con tus credenciales de PostgreSQL
# Asegúrate de configurar:
# - DB_HOST=localhost
# - DB_PORT=5432
# - DB_NAME=peluqueria_db
# - DB_USER=tu_usuario
# - DB_PASSWORD=tu_password
# - JWT_SECRET=tu_clave_secreta_segura

# Iniciar el servidor
npm start

# O en modo desarrollo
npm run dev
```

El backend correrá en `http://localhost:3000`

### 3. Configurar Frontend

```bash
# Abrir una nueva terminal
# Ir a la carpeta del frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar la aplicación
ng serve

# O especificar puerto
ng serve --port 4200
```

El frontend estará disponible en `http://localhost:4200`

## Usuarios por Defecto

El sistema tiene un usuario administrador:

- **Email**: wonderbarber2025@gmail.com
- **Password**: 123456
- **Suscripción**: 30 días de prueba gratis

⚠️ **IMPORTANTE**: Cambia esta contraseña en producción.

## Sistema de Suscripciones

### Configuración
- **Período de prueba**: 30 días gratis
- **Costo mensual**: $25,000
- **Período de gracia**: 3 días después del vencimiento
- **Link de pago**: https://mpago.la/2Cf9bkf

### Cómo Funciona
1. El admin tiene 30 días de prueba gratis
2. 7 días antes de vencer aparece el botón de renovación
3. Al hacer clic se abre Mercado Pago
4. Después de pagar, ingresa el ID de pago
5. La suscripción se renueva por 30 días más

### Documentación
- `SISTEMA-SUSCRIPCIONES-RESUMEN.md` - Descripción completa del sistema
- `CONFIGURACION-MERCADOPAGO.md` - Configurar Mercado Pago
- `CONFIGURAR-WEBHOOKS-MP.md` - Webhooks automáticos
- `LISTO-PARA-PRODUCCION.md` - Guía de despliegue completa

## Uso del Sistema

### Para Clientes

1. Accede a `http://localhost:4200`
2. Haz clic en "Regístrate aquí"
3. Completa el formulario de registro
4. Serás redirigido al dashboard de clientes
5. Selecciona una fecha para ver turnos disponibles
6. Reserva tu turno seleccionando hora y servicio

### Para Administradores

1. Accede a `http://localhost:4200`
2. Inicia sesión con las credenciales de administrador
3. Verás el panel de administración con:
   - Estadísticas de turnos
   - Lista completa de turnos
   - Opciones para confirmar o cancelar turnos
4. Usa los filtros para ver turnos por estado

## Estructura del Proyecto

```
pag peluqueria/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── turnosController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── turnosRoutes.js
│   │   └── index.js
│   ├── database/
│   │   └── schema.sql
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   ├── login/
    │   │   │   ├── registro/
    │   │   │   ├── dashboard-cliente/
    │   │   │   └── dashboard-admin/
    │   │   ├── guards/
    │   │   │   ├── auth.guard.ts
    │   │   │   └── admin.guard.ts
    │   │   ├── interceptors/
    │   │   │   └── auth.interceptor.ts
    │   │   ├── services/
    │   │   │   ├── auth.service.ts
    │   │   │   └── turnos.service.ts
    │   │   ├── app.config.ts
    │   │   └── app.routes.ts
    │   └── index.html
    └── package.json
```

## API Endpoints

### Autenticación
- `POST /api/auth/registro` - Registro de nuevos usuarios
- `POST /api/auth/login` - Inicio de sesión

### Turnos
- `GET /api/turnos` - Obtener turnos (requiere autenticación)
- `GET /api/turnos/disponibles?fecha=YYYY-MM-DD` - Obtener horarios disponibles
- `POST /api/turnos` - Crear nuevo turno
- `PUT /api/turnos/:id/estado` - Actualizar estado (solo admin)
- `DELETE /api/turnos/:id` - Cancelar turno

## Horarios Disponibles

El sistema maneja turnos en los siguientes horarios:
- 09:00 a 18:00
- Intervalos de 1 hora
- Los horarios ya reservados no se muestran como disponibles

## Servicios Disponibles

- Corte de cabello
- Tinte
- Peinado
- Barba
- Tratamiento capilar

## Estados de Turnos

- **Pendiente**: Turno reservado pero no confirmado
- **Confirmado**: Turno confirmado por el administrador
- **Cancelado**: Turno cancelado

## Seguridad

- Contraseñas hasheadas con bcryptjs
- Autenticación JWT con tokens que expiran en 24 horas
- Guards de Angular para proteger rutas
- Interceptor HTTP para agregar token automáticamente
- Validación de roles en backend y frontend

## Desarrollo

### Backend
```bash
cd backend
npm run dev  # Usa nodemon para hot reload
```

### Frontend
```bash
cd frontend
ng serve --open  # Abre automáticamente en el navegador
```

## Producción

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
ng build --configuration production
# Los archivos compilados estarán en dist/
```

## Troubleshooting

### Error de conexión a PostgreSQL
- Verifica que PostgreSQL esté corriendo
- Confirma las credenciales en el archivo .env
- Asegúrate de que la base de datos existe

### Error CORS
- Verifica que el backend esté corriendo en el puerto 3000
- El CORS ya está configurado en el backend

### Error de autenticación
- Limpia el localStorage del navegador
- Verifica que el JWT_SECRET sea el mismo en el backend

## Contribución

Este es un proyecto de demostración. Si encuentras algún problema o tienes sugerencias, no dudes en crear un issue.

## Licencia

ISC
