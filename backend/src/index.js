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
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde el directorio uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Servir frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist/frontend/browser')));
}

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

// Servir index.html para todas las rutas en producción (para Angular routing)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/frontend/browser/index.html'));
  });
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
