const express = require('express');
const router = express.Router();
const { webhookMercadoPago } = require('../controllers/webhookController');

// Webhook de Mercado Pago (ruta pública, sin autenticación)
// Mercado Pago envía notificaciones POST a esta URL
router.post('/mercadopago', webhookMercadoPago);

module.exports = router;
