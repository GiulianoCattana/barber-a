const pool = require('../config/database');

// Obtener todos los horarios bloqueados
const obtenerBloqueados = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, fecha, hora, motivo, creado_en
      FROM horarios_bloqueados
      ORDER BY fecha, hora
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener bloqueados:', error);
    res.status(500).json({ mensaje: 'Error al obtener horarios bloqueados' });
  }
};

// Obtener horarios bloqueados por fecha
const obtenerBloqueadosPorFecha = async (req, res) => {
  try {
    const { fecha } = req.params;

    const result = await pool.query(`
      SELECT id, fecha, hora, motivo
      FROM horarios_bloqueados
      WHERE fecha = $1
      ORDER BY hora
    `, [fecha]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener bloqueados por fecha:', error);
    res.status(500).json({ mensaje: 'Error al obtener horarios bloqueados' });
  }
};

// Bloquear un horario
const bloquearHorario = async (req, res) => {
  try {
    const { fecha, hora, motivo } = req.body;
    const adminId = req.usuario.id;

    // Verificar si ya existe un turno reservado en ese horario
    const turnoExistente = await pool.query(`
      SELECT id FROM turnos
      WHERE fecha = $1 AND hora = $2 AND estado != 'cancelado'
    `, [fecha, hora]);

    if (turnoExistente.rows.length > 0) {
      return res.status(400).json({
        mensaje: 'No se puede bloquear. Ya existe un turno reservado en este horario.'
      });
    }

    // Verificar si ya está bloqueado
    const bloqueadoExistente = await pool.query(`
      SELECT id FROM horarios_bloqueados
      WHERE fecha = $1 AND hora = $2
    `, [fecha, hora]);

    if (bloqueadoExistente.rows.length > 0) {
      return res.status(400).json({
        mensaje: 'Este horario ya está bloqueado'
      });
    }

    // Insertar el bloqueo
    const result = await pool.query(`
      INSERT INTO horarios_bloqueados (fecha, hora, motivo, creado_por)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [fecha, hora, motivo || 'No disponible', adminId]);

    res.status(201).json({
      mensaje: 'Horario bloqueado exitosamente',
      bloqueado: result.rows[0]
    });
  } catch (error) {
    console.error('Error al bloquear horario:', error);
    res.status(500).json({ mensaje: 'Error al bloquear horario' });
  }
};

// Desbloquear un horario
const desbloquearHorario = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      DELETE FROM horarios_bloqueados
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Horario bloqueado no encontrado' });
    }

    res.json({
      mensaje: 'Horario desbloqueado exitosamente',
      bloqueado: result.rows[0]
    });
  } catch (error) {
    console.error('Error al desbloquear horario:', error);
    res.status(500).json({ mensaje: 'Error al desbloquear horario' });
  }
};

// Desbloquear por fecha y hora
const desbloquearPorFechaHora = async (req, res) => {
  try {
    const { fecha, hora } = req.body;

    const result = await pool.query(`
      DELETE FROM horarios_bloqueados
      WHERE fecha = $1 AND hora = $2
      RETURNING *
    `, [fecha, hora]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Horario bloqueado no encontrado' });
    }

    res.json({
      mensaje: 'Horario desbloqueado exitosamente',
      bloqueado: result.rows[0]
    });
  } catch (error) {
    console.error('Error al desbloquear horario:', error);
    res.status(500).json({ mensaje: 'Error al desbloquear horario' });
  }
};

// Verificar si un horario está bloqueado
const verificarBloqueado = async (req, res) => {
  try {
    const { fecha, hora } = req.query;

    const result = await pool.query(`
      SELECT id, motivo FROM horarios_bloqueados
      WHERE fecha = $1 AND hora = $2
    `, [fecha, hora]);

    res.json({
      bloqueado: result.rows.length > 0,
      motivo: result.rows.length > 0 ? result.rows[0].motivo : null
    });
  } catch (error) {
    console.error('Error al verificar bloqueado:', error);
    res.status(500).json({ mensaje: 'Error al verificar horario' });
  }
};

module.exports = {
  obtenerBloqueados,
  obtenerBloqueadosPorFecha,
  bloquearHorario,
  desbloquearHorario,
  desbloquearPorFechaHora,
  verificarBloqueado
};
