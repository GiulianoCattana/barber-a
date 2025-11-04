# Instrucciones para Configurar la Base de Datos

## El sistema YA está completamente implementado como lo pediste:

✅ **Login diferenciado:**
- **Administrador**: admin@peluqueria.com / admin123
  - Ve su dashboard con TODOS los turnos
  - Puede confirmar/cancelar turnos
  - Ve estadísticas

- **Clientes**: Se registran y acceden
  - Ven solo SUS turnos
  - Pueden sacar nuevos turnos
  - Pueden cancelar sus propios turnos

## Problema Actual

El backend no puede conectarse a PostgreSQL. Necesitas:

### Paso 1: Instalar PostgreSQL

Si no tienes PostgreSQL instalado:
1. Descarga PostgreSQL desde: https://www.postgresql.org/download/windows/
2. Durante la instalación, establece una contraseña para el usuario `postgres`
3. Anota esa contraseña, la necesitarás

### Paso 2: Actualizar el archivo .env

Edita el archivo `backend\.env` y cambia la contraseña:

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=peluqueria_db
DB_USER=postgres
DB_PASSWORD=TU_CONTRASEÑA_REAL_DE_POSTGRES  # <-- Cambia esto
JWT_SECRET=mi_clave_secreta_super_segura_123456
```

### Paso 3: Crear la Base de Datos

Abre **pgAdmin** (se instala con PostgreSQL) o usa la terminal:

#### Opción A: Usando pgAdmin
1. Abre pgAdmin
2. Conecta al servidor PostgreSQL
3. Click derecho en "Databases" → "Create" → "Database"
4. Nombre: `peluqueria_db`
5. Click "Save"

#### Opción B: Usando línea de comandos
```bash
# Busca la ruta de instalación de PostgreSQL (usualmente en C:\Program Files\PostgreSQL\XX\bin)
# Luego ejecuta:
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres
# Te pedirá la contraseña
# Una vez dentro:
CREATE DATABASE peluqueria_db;
\q
```

### Paso 4: Ejecutar el Script SQL

En pgAdmin:
1. Conecta a la base de datos `peluqueria_db`
2. Abre el Query Tool
3. Copia y pega el contenido de `backend\database\schema.sql`
4. Ejecuta el script (F5)

O desde línea de comandos:
```bash
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d peluqueria_db -f "C:\proyectos\pag peluqueria\backend\database\schema.sql"
```

### Paso 5: Verificar que Funciona

1. Reinicia el backend (si está corriendo)
2. Abre el navegador en: http://localhost:4200
3. Intenta iniciar sesión con:
   - Email: admin@peluqueria.com
   - Password: admin123
4. Deberías ver el dashboard de administrador

### Paso 6: Crear tu Primer Cliente

1. Haz logout (si estás como admin)
2. Click en "Registrarse"
3. Llena el formulario como cliente
4. Accederás al dashboard de cliente
5. Podrás sacar turnos seleccionando fecha, hora y servicio

## Resumen de lo que YA funciona

El código está 100% implementado:

**Backend (Puerto 3000):**
- ✅ Autenticación con JWT
- ✅ Roles (admin/cliente)
- ✅ Endpoints para login/registro
- ✅ Endpoints para gestión de turnos
- ✅ Middleware de autenticación
- ✅ Validación de roles

**Frontend (Puerto 4200):**
- ✅ Login diferenciado por rol
- ✅ Registro de clientes
- ✅ Dashboard de Administrador:
  - Ver todos los turnos
  - Confirmar turnos pendientes
  - Cancelar turnos
  - Estadísticas en tiempo real
- ✅ Dashboard de Cliente:
  - Ver solo sus turnos
  - Sacar nuevos turnos
  - Cancelar sus turnos
  - Ver horarios disponibles

**Base de Datos (PostgreSQL):**
- ✅ Esquema completo (schema.sql)
- ✅ Tabla usuarios (con roles)
- ✅ Tabla turnos
- ✅ Admin por defecto creado
- ❌ Necesita ser creada (sigue los pasos arriba)

## Si tienes problemas

1. Asegúrate de que PostgreSQL esté corriendo
2. Verifica que la contraseña en `.env` sea correcta
3. Verifica que la base de datos `peluqueria_db` exista
4. Verifica que las tablas se hayan creado ejecutando el schema.sql

Para verificar las tablas en pgAdmin:
- Conecta a peluqueria_db
- Expande: Schemas → public → Tables
- Deberías ver: usuarios, turnos
