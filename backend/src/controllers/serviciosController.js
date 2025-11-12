const pool = require('../config/database');

// Obtener todos los servicios activos y reservables
const obtenerServicios = async (req, res) => {
  try {
    const query = `
      SELECT id, nombre, descripcion, duracion, precio, activo
      FROM servicios
      WHERE activo = true AND es_reservable = true
      ORDER BY nombre
    `;
    const resultado = await pool.query(query);
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ mensaje: 'Error al obtener servicios' });
  }
};

// Obtener todos los servicios reservables (incluidos inactivos) - solo admin
const obtenerTodosServicios = async (req, res) => {
  try {
    const query = `
      SELECT id, nombre, descripcion, duracion, precio, activo, created_at, updated_at
      FROM servicios
      WHERE es_reservable = true
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
    const query = 'SELECT * FROM servicios WHERE id = $1';
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

// Crear un nuevo servicio
const crearServicio = async (req, res) => {
  try {
    const { nombre, descripcion, precio, duracion } = req.body;

    if (!nombre || !precio) {
      return res.status(400).json({ mensaje: 'Nombre y precio son requeridos' });
    }

    const query = `
      INSERT INTO servicios (nombre, descripcion, precio, duracion)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const resultado = await pool.query(query, [nombre, descripcion, precio, duracion || 30]);

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({ mensaje: 'Error al crear servicio' });
  }
};

// Actualizar un servicio
const actualizarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, duracion, activo } = req.body;

    const query = `
      UPDATE servicios
      SET nombre = COALESCE($1, nombre),
          descripcion = COALESCE($2, descripcion),
          precio = COALESCE($3, precio),
          duracion = COALESCE($4, duracion),
          activo = COALESCE($5, activo),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;
    const resultado = await pool.query(query, [nombre, descripcion, precio, duracion, activo, id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    res.status(500).json({ mensaje: 'Error al actualizar servicio' });
  }
};

// Eliminar (desactivar) un servicio
const eliminarServicio = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE servicios
      SET activo = false,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const resultado = await pool.query(query, [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    res.json({ mensaje: 'Servicio desactivado exitosamente', servicio: resultado.rows[0] });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    res.status(500).json({ mensaje: 'Error al eliminar servicio' });
  }
};

module.exports = {
  obtenerServicios,
  obtenerTodosServicios,
  obtenerServicioPorId,
  crearServicio,
  actualizarServicio,
  eliminarServicio
};
