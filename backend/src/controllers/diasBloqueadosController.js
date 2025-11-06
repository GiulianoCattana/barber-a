const pool = require('../config/database');

// Obtener todos los días bloqueados
const obtenerDiasBloqueados = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, TO_CHAR(fecha, 'YYYY-MM-DD') as fecha, motivo, creado_en
       FROM dias_bloqueados
       ORDER BY fecha ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener días bloqueados:', error);
    res.status(500).json({ mensaje: 'Error al obtener días bloqueados' });
  }
};

// Verificar si un día está bloqueado
const verificarDiaBloqueado = async (req, res) => {
  try {
    const { fecha } = req.params;

    const result = await pool.query(
      'SELECT * FROM dias_bloqueados WHERE fecha = $1',
      [fecha]
    );

    if (result.rows.length > 0) {
      res.json({ bloqueado: true, motivo: result.rows[0].motivo });
    } else {
      res.json({ bloqueado: false });
    }
  } catch (error) {
    console.error('Error al verificar día bloqueado:', error);
    res.status(500).json({ mensaje: 'Error al verificar día bloqueado' });
  }
};

// Bloquear un día
const bloquearDia = async (req, res) => {
  try {
    const { fecha, motivo } = req.body;

    if (!fecha) {
      return res.status(400).json({ mensaje: 'La fecha es requerida' });
    }

    // Verificar si ya está bloqueado
    const existe = await pool.query(
      'SELECT * FROM dias_bloqueados WHERE fecha = $1',
      [fecha]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ mensaje: 'Este día ya está bloqueado' });
    }

    // Bloquear el día
    await pool.query(
      'INSERT INTO dias_bloqueados (fecha, motivo) VALUES ($1, $2)',
      [fecha, motivo || 'Día no disponible']
    );

    res.json({ mensaje: 'Día bloqueado exitosamente' });
  } catch (error) {
    console.error('Error al bloquear día:', error);
    res.status(500).json({ mensaje: 'Error al bloquear día' });
  }
};

// Desbloquear un día
const desbloquearDia = async (req, res) => {
  try {
    const { fecha } = req.params;

    const result = await pool.query(
      'DELETE FROM dias_bloqueados WHERE fecha = $1 RETURNING *',
      [fecha]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Día no encontrado' });
    }

    res.json({ mensaje: 'Día desbloqueado exitosamente' });
  } catch (error) {
    console.error('Error al desbloquear día:', error);
    res.status(500).json({ mensaje: 'Error al desbloquear día' });
  }
};

module.exports = {
  obtenerDiasBloqueados,
  verificarDiaBloqueado,
  bloquearDia,
  desbloquearDia
};
