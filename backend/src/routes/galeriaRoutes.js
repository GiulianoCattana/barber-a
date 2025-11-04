const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  obtenerItems,
  crearItem,
  actualizarItem,
  eliminarItem
} = require('../controllers/galeriaController');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// Configurar almacenamiento de multer
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
    cb(null, 'galeria-' + uniqueSuffix + path.extname(file.originalname));
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

// Rutas públicas (pueden verse sin autenticación)
router.get('/', obtenerItems);

// Rutas protegidas solo para admin
router.post('/', verificarToken, verificarAdmin, upload.single('imagen'), crearItem);
router.put('/:id', verificarToken, verificarAdmin, upload.single('imagen'), actualizarItem);
router.delete('/:id', verificarToken, verificarAdmin, eliminarItem);

module.exports = router;
