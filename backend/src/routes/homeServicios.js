const express = require('express');
const router = express.Router();
const homeServiciosController = require('../controllers/homeServiciosController');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// Rutas públicas
router.get('/', homeServiciosController.obtenerHomeServicios);

// Rutas protegidas (solo admin)
router.post('/', verificarToken, verificarAdmin, homeServiciosController.crearHomeServicio);
router.put('/:id', verificarToken, verificarAdmin, homeServiciosController.actualizarHomeServicio);
router.delete('/:id', verificarToken, verificarAdmin, homeServiciosController.eliminarHomeServicio);

module.exports = router;
