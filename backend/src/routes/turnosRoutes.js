const express = require('express');
const router = express.Router();
const {
  obtenerTurnos,
  obtenerTurnosDisponibles,
  crearTurno,
  actualizarEstadoTurno,
  cancelarTurno,
  buscarClientePorEmail,
  buscarClientes,
  obtenerHistorialCliente
} = require('../controllers/turnosController');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// Rutas protegidas (requieren autenticación)
router.get('/', verificarToken, obtenerTurnos);
router.get('/disponibles', verificarToken, obtenerTurnosDisponibles);
router.post('/', verificarToken, crearTurno);
router.delete('/:id', verificarToken, cancelarTurno);

// Rutas solo para admin
router.put('/:id/estado', verificarToken, verificarAdmin, actualizarEstadoTurno);
router.get('/buscar/clientes', verificarToken, verificarAdmin, buscarClientes);
router.get('/historial/:clienteId', verificarToken, verificarAdmin, obtenerHistorialCliente);
router.get('/cliente/:email', verificarToken, verificarAdmin, buscarClientePorEmail);

module.exports = router;
