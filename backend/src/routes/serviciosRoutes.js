const express = require('express');
const router = express.Router();
const {
  obtenerServicios,
  obtenerTodosServicios,
  obtenerServicioPorId,
  crearServicio,
  actualizarServicio,
  eliminarServicio
} = require('../controllers/serviciosController');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// Rutas públicas (no requieren autenticación)
router.get('/', obtenerServicios);
router.get('/:id', obtenerServicioPorId);

// Rutas protegidas (solo administrador)
router.get('/admin/todos', verificarToken, verificarAdmin, obtenerTodosServicios);
router.post('/', verificarToken, verificarAdmin, crearServicio);
router.put('/:id', verificarToken, verificarAdmin, actualizarServicio);
router.delete('/:id', verificarToken, verificarAdmin, eliminarServicio);

module.exports = router;
