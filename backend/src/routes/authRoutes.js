const express = require('express');
const router = express.Router();
const {
  registro,
  login,
  actualizarEmail,
  cambiarPassword,
  verificarEmailCodigo,
  reenviarCodigoVerificacion
} = require('../controllers/authController');
const { verificarToken } = require('../middleware/auth');

router.post('/registro', registro);
router.post('/login', login);
router.post('/verificar-email', verificarEmailCodigo);
router.post('/reenviar-codigo-verificacion', reenviarCodigoVerificacion);
router.put('/actualizar-email', verificarToken, actualizarEmail);
router.put('/cambiar-password', verificarToken, cambiarPassword);

module.exports = router;
