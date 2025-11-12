const pool = require('../config/database');

// Obtener todos los servicios del home con información del servicio
const obtenerHomeServicios = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT hs.*, s.nombre, s.descripcion, s.precio, s.duracion
      FROM home_servicios hs
      JOIN servicios s ON hs.servicio_id = s.id
      WHERE hs.mostrar = true
      ORDER BY hs.orden ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener servicios del home:', error);
    res.status(500).json({ mensaje: 'Error al obtener servicios del home' });
  }
};

// Agregar servicio existente al home
const crearHomeServicio = async (req, res) => {
  try {
    const { servicio_id, orden } = req.body;

    if (!servicio_id) {
      return res.status(400).json({ mensaje: 'El servicio_id es requerido' });
    }

    const result = await pool.query(
      'INSERT INTO home_servicios (servicio_id, orden, mostrar) VALUES ($1, $2, true) RETURNING *',
      [servicio_id, orden || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear servicio del home:', error);
    res.status(500).json({ mensaje: 'Error al crear servicio del home: ' + error.message });
  }
};

// Actualizar servicio del home
const actualizarHomeServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { orden, mostrar } = req.body;

    const result = await pool.query(
      'UPDATE home_servicios SET orden = $1, mostrar = $2 WHERE id = $3 RETURNING *',
      [orden, mostrar, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar servicio del home:', error);
    res.status(500).json({ mensaje: 'Error al actualizar servicio del home: ' + error.message });
  }
};

// Eliminar servicio del home
const eliminarHomeServicio = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM home_servicios WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    res.json({ mensaje: 'Servicio eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar servicio del home:', error);
    res.status(500).json({ mensaje: 'Error al eliminar servicio del home: ' + error.message });
  }
};

module.exports = {
  obtenerHomeServicios,
  crearHomeServicio,
  actualizarHomeServicio,
  eliminarHomeServicio
};
