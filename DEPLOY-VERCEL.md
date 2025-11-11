# 🚀 GUÍA RÁPIDA: Deploy en Vercel (10 minutos)

## ✅ Pre-requisitos
- Cuenta en Vercel (gratis): https://vercel.com
- Tu código está en GitHub (ya lo tienes)
- Base de datos PostgreSQL en Render (ya la tienes)

---

## 📋 PASO 1: Deploy del BACKEND (API)

### 1.1 Ir a Vercel
1. Ve a https://vercel.com
2. Login con GitHub
3. Click en **"Add New..."** → **"Project"**

### 1.2 Importar repositorio
1. Busca tu repo: `barber-a`
2. Click en **"Import"**

### 1.3 Configurar el BACKEND
En la pantalla de configuración:

**Project Name:** `barber-backend` (o el que quieras)

**Framework Preset:** Other

**Root Directory:** Click en **"Edit"** → Selecciona `backend`

**Build Command:** Dejar vacío o poner `npm install`

**Output Directory:** Dejar vacío

**Install Command:** `npm install`

### 1.4 Variables de Entorno (MUY IMPORTANTE)

Click en **"Environment Variables"** y agrega:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Tu URL de PostgreSQL de Render (empieza con postgresql://) |
| `JWT_SECRET` | Una cadena aleatoria larga (ej: `miSecr3t0SuperSegur0123456789`) |
| `EMAIL_USER` | `wonderbarber2025@gmail.com` |
| `EMAIL_PASSWORD` | `tkrmdefmjvjzolpj` |
| `NODE_ENV` | `production` |

### 1.5 Deploy
1. Click en **"Deploy"**
2. Espera 2-3 minutos
3. Copia la URL que te da (algo como: `https://barber-backend-xxxxx.vercel.app`)

**ANOTA ESTA URL, LA NECESITAS PARA EL FRONTEND**

---

## 📋 PASO 2: Actualizar Frontend con URL del Backend

### 2.1 Actualizar environment.prod.ts

Abre el archivo: `frontend/src/environments/environment.prod.ts`

Cambia la URL:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://TU-URL-DE-BACKEND.vercel.app/api'  // ← Pega tu URL del backend aquí
};
```

### 2.2 Commit y push
```bash
git add frontend/src/environments/environment.prod.ts
git commit -m "Update: URL de API para Vercel"
git push origin main
```

---

## 📋 PASO 3: Deploy del FRONTEND

### 3.1 Nuevo proyecto en Vercel
1. En Vercel, click en **"Add New..."** → **"Project"**
2. Busca tu repo: `barber-a`
3. Click en **"Import"**

### 3.2 Configurar el FRONTEND
En la pantalla de configuración:

**Project Name:** `barber-frontend` (o el que quieras)

**Framework Preset:** Other (o Angular si aparece)

**Root Directory:** Click en **"Edit"** → Selecciona `frontend`

**Build Command:** `npm run vercel-build`

**Output Directory:** `dist/frontend/browser`

**Install Command:** `npm install`

### 3.3 NO necesitas variables de entorno para el frontend

### 3.4 Deploy
1. Click en **"Deploy"**
2. Espera 3-5 minutos
3. ¡LISTO! Tu app está en: `https://barber-frontend-xxxxx.vercel.app`

---

## 📋 PASO 4: Inicializar Base de Datos

Una sola vez, necesitas crear las tablas. Desde tu computadora:

```bash
cd backend
node init-db.js
```

Esto crea todas las tablas y el usuario admin.

---

## ✅ VERIFICAR QUE TODO FUNCIONA

1. Ve a tu URL de frontend: `https://barber-frontend-xxxxx.vercel.app`
2. Deberías ver el home
3. Click en "Iniciar Sesión"
4. Login con:
   - **Email:** wonderbarber2025@gmail.com
   - **Password:** admin123
5. Deberías entrar al dashboard de admin
6. **Presiona F5** → Debería seguir funcionando (no "Not Found")

---

## 🎉 ¡LISTO!

Tu aplicación está funcionando en:
- **Frontend:** https://barber-frontend-xxxxx.vercel.app
- **Backend API:** https://barber-backend-xxxxx.vercel.app

### 🔄 Actualizaciones Automáticas

Cada vez que hagas `git push`, Vercel detecta el cambio y redespliega automáticamente.

---

## 🆘 Si algo falla

### Error: "Failed to fetch"
- Verifica que la URL del backend en `environment.prod.ts` sea correcta
- Asegúrate de haber hecho commit y push después de cambiarla

### Error 500 en el backend
- Ve a Vercel Dashboard → tu proyecto backend → "Functions"
- Click en cualquier request fallido para ver los logs
- Probablemente sea un problema con DATABASE_URL

### No puedo hacer login
- Asegúrate de haber corrido `node init-db.js` desde tu computadora
- Verifica que DATABASE_URL esté correctamente configurada en el backend

---

## 💡 Ventajas de Vercel vs Render

✅ Deploy más rápido (2-3 min vs 8-10 min)
✅ Más confiable
✅ Mejor manejo de rutas SPA (no más "Not Found")
✅ Logs más claros
✅ CDN global gratuito
✅ SSL automático

---

**Si necesitas ayuda, mandame screenshot del error y te ayudo.**
