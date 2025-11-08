const express = require('express');
const router = express.Router();
const homeServiciosController = require('../controllers/homeServiciosController');
const { verificarToken, verificarAdmin, verificarSuscripcionActiva } = require('../middleware/auth');

// Rutas públicas
router.get('/', homeServiciosController.obtenerHomeServicios);

// Rutas protegidas (solo admin)
router.post('/', verificarToken, verificarAdmin, verificarSuscripcionActiva, homeServiciosController.crearHomeServicio);
router.put('/:id', verificarToken, verificarAdmin, verificarSuscripcionActiva, homeServiciosController.actualizarHomeServicio);
router.delete('/:id', verificarToken, verificarAdmin, verificarSuscripcionActiva, homeServiciosController.eliminarHomeServicio);

module.exports = router;
