const express = require('express');
const router = express.Router();
const sliderController = require('../controllers/sliderController');
const { verificarToken, verificarAdmin, verificarSuscripcionActiva } = require('../middleware/auth');

// Rutas públicas
router.get('/', sliderController.obtenerImagenesSlider);

// Rutas protegidas (solo admin)
router.post('/', verificarToken, verificarAdmin, verificarSuscripcionActiva, sliderController.crearImagenSlider);
router.post('/upload', verificarToken, verificarAdmin, verificarSuscripcionActiva, sliderController.upload.single('imagen'), sliderController.subirImagen);
router.put('/:id', verificarToken, verificarAdmin, verificarSuscripcionActiva, sliderController.actualizarImagenSlider);
router.delete('/:id', verificarToken, verificarAdmin, verificarSuscripcionActiva, sliderController.eliminarImagenSlider);

module.exports = router;
