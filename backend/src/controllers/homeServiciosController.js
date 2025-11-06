const pool = require('../config/database');

// Obtener todos los servicios del home
const obtenerHomeServicios = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM home_servicios ORDER BY orden ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener servicios del home:', error);
    res.status(500).json({ mensaje: 'Error al obtener servicios del home' });
  }
};

// Crear nuevo servicio del home
const crearHomeServicio = async (req, res) => {
  try {
    const { nombre, descripcion, icono, orden } = req.body;

    if (!nombre) {
      return res.status(400).json({ mensaje: 'El nombre es requerido' });
    }

    const result = await pool.query(
      'INSERT INTO home_servicios (nombre, descripcion, icono, orden) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, descripcion || '', icono || '✨', orden || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear servicio del home:', error);
    res.status(500).json({ mensaje: 'Error al crear servicio del home' });
  }
};

// Actualizar servicio del home
const actualizarHomeServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, icono, orden, activo } = req.body;

    const result = await pool.query(
      'UPDATE home_servicios SET nombre = $1, descripcion = $2, icono = $3, orden = $4, activo = $5 WHERE id = $6 RETURNING *',
      [nombre, descripcion, icono, orden, activo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar servicio del home:', error);
    res.status(500).json({ mensaje: 'Error al actualizar servicio del home' });
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
    res.status(500).json({ mensaje: 'Error al eliminar servicio del home' });
  }
};

module.exports = {
  obtenerHomeServicios,
  crearHomeServicio,
  actualizarHomeServicio,
  eliminarHomeServicio
};
