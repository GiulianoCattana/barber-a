# 🚀 Guía Completa de Despliegue en Render

Esta guía te llevará paso a paso para subir tu sistema de peluquería a Render y tenerlo funcionando en internet.

---

## 📋 Pre-requisitos

Antes de comenzar, asegúrate de tener:

1. ✅ Cuenta en GitHub (para subir el código)
2. ✅ Cuenta en Render.com (gratis)
3. ✅ Git instalado en tu computadora

---

## PASO 1: Subir el Código a GitHub

### 1.1 Verificar que el .gitignore esté correcto

Tu archivo `.gitignore` ya está configurado para NO subir archivos sensibles como `.env`.

### 1.2 Hacer commit de los cambios

Abre la terminal en la carpeta del proyecto y ejecuta:

```bash
git add .
git commit -m "Preparado para producción en Render"
```

### 1.3 Crear repositorio en GitHub

1. Ve a https://github.com
2. Click en el botón **"+"** arriba a la derecha → **"New repository"**
3. Nombre: `peluqueria-wonderbarber` (o el que prefieras)
4. **NO** marques "Initialize with README"
5. Click en **"Create repository"**

### 1.4 Subir el código a GitHub

GitHub te mostrará comandos. Usa estos (reemplaza con tu repositorio):

```bash
git remote add origin https://github.com/TU_USUARIO/peluqueria-wonderbarber.git
git branch -M main
git push -u origin main
```

---

## PASO 2: Crear Base de Datos en Render

### 2.1 Ir a Render Dashboard

1. Ve a https://render.com
2. Regístrate o inicia sesión
3. Click en **"New +"** → **"PostgreSQL"**

### 2.2 Configurar la Base de Datos

- **Name**: `peluqueria-db`
- **Database**: `peluqueria_db`
- **User**: (se genera automáticamente)
- **Region**: Elige el más cercano (por ejemplo: Oregon USA)
- **Plan**: **Free** (suficiente para empezar)

Click en **"Create Database"**

### 2.3 Guardar credenciales

Una vez creada, verás una página con:
- **Internal Database URL** (usa esta)
- **External Database URL**
- **PSQL Command**

**IMPORTANTE**: Guarda estas credenciales, las necesitarás más adelante.

### 2.4 Configurar la Base de Datos

1. En la página de tu base de datos en Render, ve a la pestaña **"Connect"**
2. Copia el comando **"PSQL Command"**
3. Abre una terminal y pega el comando para conectarte
4. Una vez conectado, copia y pega TODO el contenido del archivo `backend/database/schema.sql`
5. Ejecuta los siguientes comandos uno por uno:

```sql
-- Crear tabla de servicios
CREATE TABLE IF NOT EXISTS servicios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    duracion INTEGER NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de galería
CREATE TABLE IF NOT EXISTS galeria (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200),
    imagen_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de horarios bloqueados
CREATE TABLE IF NOT EXISTS horarios_bloqueados (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    motivo VARCHAR(200),
    bloqueado_por INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(fecha, hora)
);

-- Crear tabla de días bloqueados
CREATE TABLE IF NOT EXISTS dias_bloqueados (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL UNIQUE,
    motivo VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tablas para el home
CREATE TABLE IF NOT EXISTS slider_imagenes (
    id SERIAL PRIMARY KEY,
    imagen_url VARCHAR(500) NOT NULL,
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS home_servicios (
    id SERIAL PRIMARY KEY,
    servicio_id INTEGER REFERENCES servicios(id) ON DELETE CASCADE,
    orden INTEGER DEFAULT 0,
    mostrar BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agregar columnas para recuperación de contraseña
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS codigo_recuperacion VARCHAR(6);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS codigo_expiracion TIMESTAMP;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT false;

-- Insertar servicios básicos
INSERT INTO servicios (nombre, descripcion, duracion, precio) VALUES
('Corte de pelo', 'Corte y estilo profesional', 30, 10000),
('Barba', 'Arreglo de barba', 25, 5000),
('Corte + Barba', 'Combo completo', 45, 14000)
ON CONFLICT DO NOTHING;
```

6. Escribe `\q` y presiona Enter para salir

---

## PASO 3: Crear Web Service en Render

### 3.1 Crear el servicio

1. En Render Dashboard, click en **"New +"** → **"Web Service"**
2. Click en **"Connect a repository"**
3. Autoriza a Render para acceder a GitHub
4. Selecciona tu repositorio `peluqueria-wonderbarber`

### 3.2 Configurar el Web Service

Completa el formulario:

- **Name**: `peluqueria-wonderbarber` (este será parte de tu URL)
- **Region**: El mismo que elegiste para la BD
- **Branch**: `main` o `master`
- **Root Directory**: (dejar vacío)
- **Runtime**: **Node**
- **Build Command**:
  ```
  cd frontend && npm install && npm run build && cd ../backend && npm install
  ```
- **Start Command**:
  ```
  cd backend && node src/index.js
  ```
- **Plan**: **Free**

### 3.3 Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega las siguientes variables (click en **"Add Environment Variable"** para cada una):

**IMPORTANTE**: Estos son valores de ejemplo. Debes cambiarlos:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `DB_HOST` | (copia el host de la Internal Database URL de Render) |
| `DB_PORT` | `5432` |
| `DB_NAME` | `peluqueria_db` |
| `DB_USER` | (copia el user de Render) |
| `DB_PASSWORD` | (copia el password de Render) |
| `JWT_SECRET` | `genera_una_cadena_aleatoria_de_minimo_32_caracteres_aqui_12345678` |
| `FRONTEND_URL` | `https://peluqueria-wonderbarber.onrender.com` (reemplaza con tu URL de Render) |
| `EMAIL_USER` | `wonderbarber2025@gmail.com` |
| `EMAIL_PASSWORD` | `tkrmdefmjvjzolpj` |

**Cómo obtener las credenciales de la base de datos:**
1. Ve a tu base de datos en Render
2. En la sección de "Connections", encontrarás:
   - **Internal Database URL**: tiene el formato `postgresql://user:password@host:5432/database`
   - Extrae de ahí: `DB_HOST`, `DB_USER`, `DB_PASSWORD`

### 3.4 Desplegar

1. Click en **"Create Web Service"**
2. Render comenzará a construir y desplegar tu aplicación
3. Este proceso puede tardar 5-10 minutos la primera vez
4. Verás los logs en tiempo real

---

## PASO 4: Configurar el Usuario Administrador

Una vez que el despliegue termine exitosamente:

### 4.1 Conectarse a la base de datos

Usa el PSQL Command de Render para conectarte a tu base de datos.

### 4.2 Actualizar el administrador

Ejecuta estos comandos SQL:

```sql
-- Actualizar email del admin
UPDATE usuarios SET email = 'wonderbarber2025@gmail.com' WHERE rol = 'admin';

-- Actualizar password del admin (hash de "admin123")
UPDATE usuarios SET password = '$2a$10$GdrzA5AoEc1idCHcOH/w7OrlsFLyFoMfHZkQP4nNJxHhF8JL2.3u.' WHERE rol = 'admin';

-- Verificar
SELECT id, nombre, email, rol FROM usuarios WHERE rol = 'admin';
```

---

## PASO 5: Probar la Aplicación

### 5.1 Obtener la URL

En tu dashboard de Render, verás la URL de tu aplicación:
```
https://peluqueria-wonderbarber.onrender.com
```

### 5.2 Hacer login

1. Abre la URL en tu navegador
2. Ve a la página de login
3. Usa las credenciales:
   - **Email**: wonderbarber2025@gmail.com
   - **Password**: admin123

### 5.3 Verificar funcionalidades

Prueba:
- ✅ Login como admin
- ✅ Crear/editar servicios
- ✅ Ver turnos
- ✅ Subir imágenes a la galería
- ✅ Bloquear horarios

---

## ⚠️ IMPORTANTE: Primera Vez que Accedes

La primera vez que accedas a tu aplicación en Render:

1. **Puede tardar 30-60 segundos** en cargar (el plan gratuito "duerme" después de inactividad)
2. Si ves un error 503, espera un minuto y recarga
3. Después de la primera carga, funcionará normal

---

## 🔧 Solución de Problemas Comunes

### Error 500 - Internal Server Error

**Causa**: Problemas con la base de datos o variables de entorno

**Solución**:
1. Ve a los logs en Render (pestaña "Logs")
2. Verifica que todas las variables de entorno estén correctas
3. Verifica que la base de datos esté corriendo

### Error de CORS

**Causa**: El frontend no puede comunicarse con el backend

**Solución**:
1. Verifica que `FRONTEND_URL` en las variables de entorno sea correcta
2. Debe ser la misma URL que Render te asignó

### Las imágenes no se cargan

**Causa**: El directorio `uploads` no persiste en Render

**Solución temporal**: Las imágenes se perderán cuando Render reinicie el servicio. Para solución permanente, necesitarías un servicio de almacenamiento como Cloudinary o AWS S3 (no cubierto en esta guía).

### La aplicación está lenta

**Causa**: El plan gratuito tiene recursos limitados

**Solución**:
- Esto es normal en el plan gratuito
- Considera actualizar a un plan de pago si necesitas mejor rendimiento

---

## 🎉 ¡Listo!

Tu aplicación ahora está en internet y accesible desde cualquier lugar.

**Tu URL**: `https://peluqueria-wonderbarber.onrender.com`

### Próximos Pasos Opcionales

1. **Dominio personalizado**: Puedes configurar tu propio dominio (ejemplo: www.wonderbarber.com)
2. **Mejorar el plan**: Actualizar a un plan de pago para mejor rendimiento
3. **Configurar backups**: Hacer respaldos automáticos de la base de datos
4. **Monitoreo**: Configurar alertas para saber si tu sitio está caído

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Render
2. Verifica que todas las variables de entorno estén correctas
3. Asegúrate de que la base de datos esté corriendo
4. Revisa la consola del navegador (F12) para errores del frontend

---

## 🔄 Actualizar la Aplicación

Cuando hagas cambios en el código:

```bash
git add .
git commit -m "Descripción de los cambios"
git push origin main
```

Render detectará automáticamente los cambios y redesplegará tu aplicación.

---

**¡Felicidades! 🎊 Tu sistema de peluquería está en línea.**
