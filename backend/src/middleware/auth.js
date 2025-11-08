const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ mensaje: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido' });
  }
};

const verificarAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso denegado. Se requiere rol de administrador' });
  }
  next();
};

const verificarSuscripcionActiva = async (req, res, next) => {
  try {
    // Solo verificar suscripción para admins
    if (req.usuario.rol !== 'admin') {
      return next();
    }

    const usuarioId = req.usuario.id;

    const result = await pool.query(`
      SELECT
        fecha_vencimiento,
        estado,
        CASE
          WHEN fecha_vencimiento > NOW() THEN true
          WHEN fecha_vencimiento <= NOW() AND fecha_vencimiento > (NOW() - INTERVAL '3 days') THEN true
          ELSE false
        END as puede_operar
      FROM suscripciones
      WHERE usuario_id = $1
    `, [usuarioId]);

    if (result.rows.length === 0) {
      return res.status(403).json({
        mensaje: 'No se encontró suscripción activa',
        codigo: 'SIN_SUSCRIPCION'
      });
    }

    const suscripcion = result.rows[0];

    if (!suscripcion.puede_operar) {
      return res.status(403).json({
        mensaje: 'Tu suscripción ha vencido. Renueva tu suscripción para continuar operando el sistema',
        codigo: 'SUSCRIPCION_VENCIDA',
        fecha_vencimiento: suscripcion.fecha_vencimiento
      });
    }

    // Suscripción válida, continuar
    next();

  } catch (error) {
    console.error('Error al verificar suscripción:', error);
    res.status(500).json({ mensaje: 'Error al verificar suscripción' });
  }
};

module.exports = { verificarToken, verificarAdmin, verificarSuscripcionActiva };
