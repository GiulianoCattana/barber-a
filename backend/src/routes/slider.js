const express = require('express');
const router = express.Router();
const sliderController = require('../controllers/sliderController');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// Rutas públicas
router.get('/', sliderController.obtenerImagenesSlider);

// Rutas protegidas (solo admin)
router.post('/', verificarToken, verificarAdmin, sliderController.crearImagenSlider);
router.post('/upload', verificarToken, verificarAdmin, sliderController.upload.single('imagen'), sliderController.subirImagen);
router.put('/:id', verificarToken, verificarAdmin, sliderController.actualizarImagenSlider);
router.delete('/:id', verificarToken, verificarAdmin, sliderController.eliminarImagenSlider);

module.exports = router;
