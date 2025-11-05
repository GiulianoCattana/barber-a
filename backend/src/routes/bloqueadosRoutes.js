const express = require('express');
const router = express.Router();
const {
  obtenerBloqueados,
  obtenerBloqueadosPorFecha,
  bloquearHorario,
  desbloquearHorario,
  desbloquearPorFechaHora,
  verificarBloqueado
} = require('../controllers/bloqueadosController');
const { verificarToken } = require('../middleware/auth');

// Rutas públicas (para que los clientes puedan ver qué está bloqueado)
router.get('/verificar', verificarBloqueado);
router.get('/fecha/:fecha', obtenerBloqueadosPorFecha);

// Rutas protegidas (solo admin)
router.get('/', verificarToken, obtenerBloqueados);
router.post('/bloquear', verificarToken, bloquearHorario);
router.delete('/:id', verificarToken, desbloquearHorario);
router.post('/desbloquear', verificarToken, desbloquearPorFechaHora);

module.exports = router;
