const express = require('express');
const router = express.Router();
const { verificarToken, verificarAdmin } = require('../middleware/auth');
const {
  obtenerEstadoSuscripcion,
  obtenerHistorialPagos,
  registrarPago,
  generarLinkPago,
  confirmarPagoManual
} = require('../controllers/suscripcionController');

// Todas las rutas requieren autenticación y ser admin
router.use(verificarToken, verificarAdmin);

// Obtener estado de suscripción
router.get('/estado', obtenerEstadoSuscripcion);

// Obtener historial de pagos
router.get('/historial', obtenerHistorialPagos);

// Registrar un pago manual con detalles
router.post('/pago', registrarPago);

// Confirmar pago manual simple (ya pagué)
router.post('/confirmar-pago', confirmarPagoManual);

// Obtener link de pago de Mercado Pago
router.get('/link-pago', generarLinkPago);

module.exports = router;
