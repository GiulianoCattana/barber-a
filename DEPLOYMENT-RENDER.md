# 🚀 Guía de Deployment en Render

## ✅ Pre-requisitos Completados

- ✅ Configuración de base de datos con soporte para DATABASE_URL
- ✅ Configuración de SSL para PostgreSQL en producción
- ✅ Scripts de build automatizados
- ✅ Configuración de CORS
- ✅ Variables de entorno configuradas
- ✅ Build de producción de Angular

## 📋 Pasos para Deployment

### 1. Crear Base de Datos PostgreSQL en Render

1. Ve a https://dashboard.render.com
2. Click en "New +" → "PostgreSQL"
3. Configura:
   - **Name**: `wonderbarberia-db`
   - **Database**: `wonderbarberia_db`
   - **User**: (se genera automáticamente)
   - **Region**: Ohio (US East)
   - **Plan**: Free
4. Click en "Create Database"
5. **IMPORTANTE**: Copia la "Internal Database URL" (la usaremos después)

### 2. Inicializar la Base de Datos

Una vez creada la base de datos, necesitas ejecutar el script de setup:

```bash
node setup-render-db.js
```

**Nota**: Asegúrate de tener la variable DATABASE_URL configurada apuntando a tu base de datos de Render.

### 3. Crear Web Service en Render

1. Click en "New +" → "Web Service"
2. Conecta tu repositorio de GitHub
3. Configura:
   - **Name**: `wonderbarberia`
   - **Region**: Ohio (US East)
   - **Branch**: `main`
   - **Root Directory**: (dejar vacío)
   - **Runtime**: Node
   - **Build Command**: `bash build.sh`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

### 4. Configurar Variables de Entorno

En la sección "Environment Variables", agrega:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | (Pega la Internal Database URL de tu PostgreSQL) |
| `JWT_SECRET` | (Una clave secreta fuerte) |
| `EMAIL_USER` | (Tu email de Gmail) |
| `EMAIL_PASSWORD` | (Tu contraseña de aplicación de Gmail) |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |

**Nota sobre EMAIL**:
Para Gmail, necesitas crear una "Contraseña de Aplicación":
1. Ve a https://myaccount.google.com/
2. Seguridad → Verificación en dos pasos
3. Contraseñas de aplicaciones
4. Genera una nueva contraseña

### 5. Deploy

1. Click en "Create Web Service"
2. Render automáticamente:
   - Clonará el repositorio
   - Ejecutará `build.sh` (compila Angular e instala dependencias)
   - Ejecutará `cd backend && npm start`
3. Espera a que el deploy termine (5-10 minutos)

### 6. Verificar el Deployment

Una vez completado, tu aplicación estará disponible en:
```
https://wonderbarberia.onrender.com
```

Prueba:
- ✅ Home page carga correctamente
- ✅ Login funciona
- ✅ Registro funciona
- ✅ Dashboard de cliente funciona
- ✅ Dashboard de admin funciona

## 🔄 Actualizaciones Automáticas

Render se conecta a tu repositorio de GitHub. Cada vez que hagas `git push` a la rama `main`, Render automáticamente:
1. Detecta los cambios
2. Ejecuta el build
3. Redespliega la aplicación

## 🐛 Troubleshooting

### Error de conexión a base de datos

Si ves errores de conexión, verifica:
1. Que la DATABASE_URL esté correctamente configurada
2. Que la base de datos esté en la misma región que el web service
3. Que hayas ejecutado el script de setup: `node setup-render-db.js`

### Error al hacer build

Si el build falla:
1. Revisa los logs en Render
2. Verifica que el archivo `build.sh` tenga permisos de ejecución
3. Verifica que todas las dependencias estén en `package.json`

### Aplicación no carga

Si la app no carga:
1. Verifica los logs en Render Dashboard
2. Asegúrate que el Start Command sea: `cd backend && npm start`
3. Verifica que NODE_ENV esté en `production`

## 📝 Notas Importantes

1. **Base de Datos Free**: Render elimina bases de datos Free inactivas después de 90 días
2. **Sleep Mode**: El plan Free entra en sleep después de 15 minutos de inactividad
3. **Logs**: Accede a los logs en tiempo real desde el Dashboard de Render
4. **Escalabilidad**: Puedes actualizar a plan pago para mejor rendimiento

## 🎉 ¡Listo!

Tu aplicación de peluquería está ahora en producción y lista para usarse.

**URL de producción**: https://wonderbarberia.onrender.com

---

**Desarrollado con ❤️**
