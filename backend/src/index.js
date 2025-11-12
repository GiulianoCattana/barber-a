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
      'https://wonderbarberia.onrender.com',
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

// En producción (Render), el frontend está en backend/public/
// En desarrollo local, está en frontend/dist/frontend/browser
const frontendPath = path.join(__dirname, '../public');
const localFrontendPath = path.join(__dirname, '../../frontend/dist/frontend/browser');

let finalPath = frontendPath;
if (!fs.existsSync(frontendPath) && fs.existsSync(localFrontendPath)) {
  finalPath = localFrontendPath;
}

console.log(`📁 Usando frontend desde: ${finalPath}`);

// Archivos estáticos (JS, CSS, imágenes) - PRIMERO
app.use(express.static(finalPath, { index: false }));

// SPA catch-all - DESPUÉS
app.get('*', (req, res, next) => {
  // Si es API, dejar que siga (404)
  if (req.path.startsWith('/api/')) {
    return next();
  }

  // Para todo lo demás, servir index.html
  const indexPath = path.join(finalPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send('Frontend not built. Please run build script.');
  }
});

// Ejecutar migraciones ANTES de iniciar servidor
(async () => {
  try {
    const migrateGaleria = require('./migrations/renameGaleriaColumn');
    await migrateGaleria();

    const createDiasBloqueadosTable = require('./migrations/createDiasBloqueadosTable');
    await createDiasBloqueadosTable();

    const createHorariosBloqueadosTable = require('./migrations/createHorariosBloqueadosTable');
    await createHorariosBloqueadosTable();

    const updateServiciosTable = require('./migrations/updateServiciosTable');
    await updateServiciosTable();

    const addEsReservableToServicios = require('./migrations/addEsReservableToServicios');
    await addEsReservableToServicios();

    const addDuracionMinutosToTurnos = require('./migrations/addDuracionMinutosToTurnos');
    await addDuracionMinutosToTurnos();

    const addLinkMercadopagoToConfiguracion = require('./migrations/addLinkMercadopagoToConfiguracion');
    await addLinkMercadopagoToConfiguracion();

    const addTransferenciaColumnsToConfiguracion = require('./migrations/addTransferenciaColumnsToConfiguracion');
    await addTransferenciaColumnsToConfiguracion();

    const addCodigoVerificacionToUsuarios = require('./migrations/addCodigoVerificacionToUsuarios');
    await addCodigoVerificacionToUsuarios();
  } catch (error) {
    console.error('Error ejecutando migraciones:', error);
  }

  // Iniciar servidor
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📁 Sirviendo frontend desde: ${finalPath}`);
    console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  });
})();
