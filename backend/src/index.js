const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const turnosRoutes = require('./routes/turnosRoutes');
const galeriaRoutes = require('./routes/galeriaRoutes');
const serviciosRoutes = require('./routes/serviciosRoutes');
const recoveryRoutes = require('./routes/recoveryRoutes');
const bloqueadosRoutes = require('./routes/bloqueadosRoutes');
const diasBloqueadosRoutes = require('./routes/diasBloqueados');
const sliderRoutes = require('./routes/slider');
const homeServiciosRoutes = require('./routes/homeServicios');
const pagosRoutes = require('./routes/pagosRoutes');
const suscripcionRoutes = require('./routes/suscripcionRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);

    // Lista de orígenes permitidos
    const allowedOrigins = [
      'https://barber-a-1.onrender.com',
      'http://localhost:4200'
    ];

    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(null, true); // En producción, cambiar a: callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde el directorio uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/turnos', turnosRoutes);
app.use('/api/galeria', galeriaRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/recovery', recoveryRoutes);
app.use('/api/bloqueados', bloqueadosRoutes);
app.use('/api/dias-bloqueados', diasBloqueadosRoutes);
app.use('/api/slider', sliderRoutes);
app.use('/api/home-servicios', homeServiciosRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/suscripcion', suscripcionRoutes);
app.use('/api/webhook', webhookRoutes);

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ mensaje: 'API de Peluquería funcionando correctamente' });
});

// Servir archivos estáticos del frontend (Angular build)
const fs = require('fs');

// Intentar diferentes rutas posibles para el frontend
const possiblePaths = [
  path.join(__dirname, '../../frontend/dist/frontend/browser'),     // Local
  path.join(__dirname, '../../../frontend/dist/frontend/browser'),  // Render opción 1
  path.join(__dirname, '../../../../frontend/dist/frontend/browser'), // Render opción 2
  '/opt/render/project/frontend/dist/frontend/browser',              // Render absoluto
];

let frontendPath = null;
for (const testPath of possiblePaths) {
  if (fs.existsSync(testPath)) {
    frontendPath = testPath;
    console.log(`✅ Frontend encontrado en: ${frontendPath}`);
    break;
  }
}

if (!frontendPath) {
  console.error(`❌ ERROR: No se encontró el frontend en ninguna ruta`);
  console.error(`Rutas probadas:`);
  possiblePaths.forEach(p => console.error(`  - ${p}`));
  console.error(`__dirname actual: ${__dirname}`);
  frontendPath = possiblePaths[0]; // Usar la primera por defecto
}

// Archivos estáticos (JS, CSS, imágenes) - PRIMERO
app.use(express.static(frontendPath, { index: false }));

// SPA catch-all - DESPUÉS
app.get('*', (req, res, next) => {
  // Si es API, dejar que siga (404)
  if (req.path.startsWith('/api/')) {
    return next();
  }

  // Para todo lo demás, servir index.html
  const indexPath = path.join(frontendPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send('Frontend not built. Please run build script.');
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📁 Sirviendo frontend desde: ${frontendPath}`);
  console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});
