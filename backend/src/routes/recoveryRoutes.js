const express = require('express');
const router = express.Router();
const {
  enviarCodigoEmail,
  verificarCodigoEmail,
  resetearPassword,
  verificarEmail,
  verificarRespuestaSeguridad,
  verificarCodigoRecuperacion,
  configurarPreguntaSeguridad,
  obtenerCodigoRecuperacion
} = require('../controllers/recoveryController');
const { verificarToken } = require('../middleware/auth');

// Rutas públicas para recuperación de contraseña por EMAIL (nuevo)
router.post('/enviar-codigo', enviarCodigoEmail);
router.post('/verificar-codigo-email', verificarCodigoEmail);
router.post('/resetear-password', resetearPassword);

// Rutas públicas LEGACY (antiguas - para compatibilidad)
router.post('/verificar-email', verificarEmail);
router.post('/verificar-respuesta', verificarRespuestaSeguridad);
router.post('/verificar-codigo', verificarCodigoRecuperacion);

// Rutas protegidas (requieren autenticación)
router.post('/configurar-pregunta', verificarToken, configurarPreguntaSeguridad);
router.get('/codigo-recuperacion', verificarToken, obtenerCodigoRecuperacion);

module.exports = router;
