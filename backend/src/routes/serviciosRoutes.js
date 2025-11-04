const express = require('express');
const router = express.Router();
const {
  obtenerServicios,
  obtenerServicioPorId
} = require('../controllers/serviciosController');

// Rutas públicas (no requieren autenticación)
router.get('/', obtenerServicios);
router.get('/:id', obtenerServicioPorId);

module.exports = router;
