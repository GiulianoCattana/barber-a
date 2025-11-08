const express = require('express');
const router = express.Router();
const diasBloqueadosController = require('../controllers/diasBloqueadosController');
const { verificarToken, verificarAdmin, verificarSuscripcionActiva } = require('../middleware/auth');

// Obtener todos los días bloqueados (público - para que clientes vean días no disponibles)
router.get('/', diasBloqueadosController.obtenerDiasBloqueados);

// Verificar si un día específico está bloqueado (público)
router.get('/verificar/:fecha', diasBloqueadosController.verificarDiaBloqueado);

// Bloquear un día (solo admin)
router.post('/', verificarToken, verificarAdmin, verificarSuscripcionActiva, diasBloqueadosController.bloquearDia);

// Desbloquear un día (solo admin)
router.delete('/:fecha', verificarToken, verificarAdmin, verificarSuscripcionActiva, diasBloqueadosController.desbloquearDia);

module.exports = router;
