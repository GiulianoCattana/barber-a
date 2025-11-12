const pool = require('../config/database');
const path = require('path');
const fs = require('fs');

// Obtener todos los items de la galería
const obtenerItems = async (req, res) => {
  try {
    const query = `
      SELECT * FROM galeria
      ORDER BY created_at DESC
    `;
    const resultado = await pool.query(query);
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener items de galería:', error);
    res.status(500).json({ mensaje: 'Error al obtener items de galería' });
  }
};

// Crear un nuevo item de galería
const crearItem = async (req, res) => {
  try {
    const { titulo } = req.body;

    if (!titulo) {
      return res.status(400).json({ mensaje: 'Título es requerido' });
    }

    if (!req.file) {
      return res.status(400).json({ mensaje: 'La imagen es requerida' });
    }

    const imagenUrl = '/uploads/' + req.file.filename;

    const query = `
      INSERT INTO galeria (titulo, imagen_url)
      VALUES ($1, $2)
      RETURNING *
    `;

    const resultado = await pool.query(query, [titulo, imagenUrl]);

    res.status(201).json({
      mensaje: 'Item creado exitosamente',
      item: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al crear item:', error);

    // Eliminar el archivo si hubo un error
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({ mensaje: 'Error al crear item' });
  }
};

// Actualizar un item de galería
const actualizarItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo } = req.body;

    if (!titulo) {
      return res.status(400).json({ mensaje: 'Título es requerido' });
    }

    let query;
    let params;

    if (req.file) {
      // Si hay nueva imagen, eliminar la anterior
      const itemAnterior = await pool.query('SELECT imagen_url FROM galeria WHERE id = $1', [id]);

      if (itemAnterior.rows.length > 0) {
        const imagenUrlAnterior = itemAnterior.rows[0].imagen_url;
        const nombreArchivo = imagenUrlAnterior.replace('/uploads/', '');
        const filePath = path.join(__dirname, '../../uploads', nombreArchivo);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      const imagenUrl = '/uploads/' + req.file.filename;
      query = 'UPDATE galeria SET titulo = $1, imagen_url = $2 WHERE id = $3 RETURNING *';
      params = [titulo, imagenUrl, id];
    } else {
      query = 'UPDATE galeria SET titulo = $1 WHERE id = $2 RETURNING *';
      params = [titulo, id];
    }

    const resultado = await pool.query(query, params);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Item no encontrado' });
    }

    res.json({
      mensaje: 'Item actualizado exitosamente',
      item: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar item:', error);

    // Eliminar el archivo si hubo un error
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({ mensaje: 'Error al actualizar item' });
  }
};

// Eliminar un item de galería
const eliminarItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener la URL de la imagen antes de eliminar
    const itemQuery = await pool.query('SELECT imagen_url FROM galeria WHERE id = $1', [id]);

    if (itemQuery.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Item no encontrado' });
    }

    const imagenUrl = itemQuery.rows[0].imagen_url;

    // Eliminar el registro de la base de datos
    await pool.query('DELETE FROM galeria WHERE id = $1', [id]);

    // Eliminar el archivo del servidor
    const nombreArchivo = imagenUrl.replace('/uploads/', '');
    const filePath = path.join(__dirname, '../../uploads', nombreArchivo);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ mensaje: 'Item eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar item:', error);
    res.status(500).json({ mensaje: 'Error al eliminar item' });
  }
};

module.exports = {
  obtenerItems,
  crearItem,
  actualizarItem,
  eliminarItem
};
