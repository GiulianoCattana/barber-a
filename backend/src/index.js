const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const turnosRoutes = require('./routes/turnosRoutes');
const galeriaRoutes = require('./routes/galeriaRoutes');
const serviciosRoutes = require('./routes/serviciosRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde el directorio uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/turnos', turnosRoutes);
app.use('/api/galeria', galeriaRoutes);
app.use('/api/servicios', serviciosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Peluquería funcionando correctamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
