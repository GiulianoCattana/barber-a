const pool = require('../config/database');

// Obtener todos los servicios activos
const obtenerServicios = async (req, res) => {
  try {
    const query = `
      SELECT id, nombre, descripcion, duracion_minutos, precio
      FROM servicios
      WHERE activo = true
      ORDER BY nombre
    `;
    const resultado = await pool.query(query);
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ mensaje: 'Error al obtener servicios' });
  }
};

// Obtener un servicio por ID
const obtenerServicioPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'SELECT * FROM servicios WHERE id = $1 AND activo = true';
    const resultado = await pool.query(query, [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al obtener servicio:', error);
    res.status(500).json({ mensaje: 'Error al obtener servicio' });
  }
};

module.exports = {
  obtenerServicios,
  obtenerServicioPorId
};
