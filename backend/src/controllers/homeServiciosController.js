const pool = require('../config/database');

// Obtener todos los servicios del home con información del servicio
const obtenerHomeServicios = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT hs.id, hs.icono, hs.orden, hs.mostrar, s.nombre, s.descripcion, s.precio, s.duracion
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

// Crear servicio nuevo para el home
const crearHomeServicio = async (req, res) => {
  try {
    const { nombre, descripcion, icono, orden } = req.body;

    if (!nombre || !descripcion) {
      return res.status(400).json({ mensaje: 'El nombre y descripción son requeridos' });
    }

    // Primero crear el servicio en la tabla servicios (no reservable, solo informativo)
    const servicioResult = await pool.query(
      'INSERT INTO servicios (nombre, descripcion, duracion, precio, activo, es_reservable) VALUES ($1, $2, $3, $4, true, false) RETURNING id',
      [nombre, descripcion, 30, 0] // Valores por defecto: 30 min duracion, $0 precio, no reservable
    );

    const servicioId = servicioResult.rows[0].id;

    // Luego crear la relación en home_servicios
    const homeResult = await pool.query(
      'INSERT INTO home_servicios (servicio_id, icono, orden, mostrar) VALUES ($1, $2, $3, true) RETURNING *',
      [servicioId, icono || '✨', orden || 0]
    );

    // Devolver el servicio completo
    const finalResult = await pool.query(`
      SELECT hs.id, hs.icono, hs.orden, s.nombre, s.descripcion
      FROM home_servicios hs
      JOIN servicios s ON hs.servicio_id = s.id
      WHERE hs.id = $1
    `, [homeResult.rows[0].id]);

    res.status(201).json(finalResult.rows[0]);
  } catch (error) {
    console.error('Error al crear servicio del home:', error);
    res.status(500).json({ mensaje: 'Error al crear servicio del home: ' + error.message });
  }
};

// Actualizar servicio del home
const actualizarHomeServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, icono, orden, mostrar } = req.body;

    // Obtener el servicio_id de home_servicios
    const homeServicio = await pool.query('SELECT servicio_id FROM home_servicios WHERE id = $1', [id]);

    if (homeServicio.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    const servicioId = homeServicio.rows[0].servicio_id;

    // Actualizar el servicio en la tabla servicios
    if (nombre || descripcion) {
      await pool.query(
        'UPDATE servicios SET nombre = COALESCE($1, nombre), descripcion = COALESCE($2, descripcion) WHERE id = $3',
        [nombre, descripcion, servicioId]
      );
    }

    // Actualizar en home_servicios
    const result = await pool.query(
      'UPDATE home_servicios SET icono = COALESCE($1, icono), orden = COALESCE($2, orden), mostrar = COALESCE($3, mostrar) WHERE id = $4 RETURNING *',
      [icono, orden, mostrar !== undefined ? mostrar : null, id]
    );

    // Devolver el servicio completo actualizado
    const finalResult = await pool.query(`
      SELECT hs.id, hs.icono, hs.orden, hs.mostrar, s.nombre, s.descripcion
      FROM home_servicios hs
      JOIN servicios s ON hs.servicio_id = s.id
      WHERE hs.id = $1
    `, [id]);

    res.json(finalResult.rows[0]);
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
