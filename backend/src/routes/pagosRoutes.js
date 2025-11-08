const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verificarToken, verificarAdmin, verificarSuscripcionActiva } = require('../middleware/auth');
const {
  obtenerConfiguracion,
  actualizarConfiguracion
} = require('../controllers/pagosController');

// Configurar almacenamiento de multer para QR
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');

    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'qr-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro para solo aceptar imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: fileFilter
});

// Ruta pública - obtener configuración de pagos
router.get('/configuracion', obtenerConfiguracion);

// Ruta protegida - actualizar configuración (solo admin)
router.put('/configuracion', verificarToken, verificarAdmin, verificarSuscripcionActiva, upload.single('imagen_qr'), actualizarConfiguracion);

module.exports = router;
