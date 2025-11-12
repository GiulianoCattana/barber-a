const pool = require('../config/database');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

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
    console.log('=== CREAR ITEM DE GALERÍA ===');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    const { titulo, descripcion } = req.body;

    if (!titulo || !descripcion) {
      console.log('❌ Faltan datos: titulo=' + titulo + ', descripcion=' + descripcion);
      return res.status(400).json({ mensaje: 'Título y descripción son requeridos' });
    }

    if (!req.file) {
      console.log('❌ No hay archivo');
      return res.status(400).json({ mensaje: 'La imagen es requerida' });
    }

    console.log('📤 Subiendo a Cloudinary...');
    // Subir imagen a Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'wonderbarber/galeria',
      resource_type: 'auto'
    });

    const imagenUrl = result.secure_url;
    console.log('✅ Imagen subida a Cloudinary:', imagenUrl);

    // Eliminar archivo temporal
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.log('💾 Guardando en BD:', { titulo, descripcion, imagenUrl });
    const query = `
      INSERT INTO galeria (titulo, descripcion, imagen_url)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const resultado = await pool.query(query, [titulo, descripcion, imagenUrl]);
    console.log('✅ Guardado en BD:', resultado.rows[0]);

    res.status(201).json({
      mensaje: 'Item creado exitosamente',
      item: resultado.rows[0]
    });
  } catch (error) {
    console.error('❌ Error al crear item:', error);

    // Eliminar el archivo temporal si hubo un error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ mensaje: 'Error al crear item: ' + error.message });
  }
};

// Actualizar un item de galería
const actualizarItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion } = req.body;

    if (!titulo || !descripcion) {
      return res.status(400).json({ mensaje: 'Título y descripción son requeridos' });
    }

    let query;
    let params;

    if (req.file) {
      // Si hay nueva imagen, eliminar la anterior de Cloudinary
      const itemAnterior = await pool.query('SELECT imagen_url FROM galeria WHERE id = $1', [id]);

      if (itemAnterior.rows.length > 0) {
        const imagenUrlAnterior = itemAnterior.rows[0].imagen_url;

        // Extraer public_id de Cloudinary de la URL
        if (imagenUrlAnterior.includes('cloudinary.com')) {
          const parts = imagenUrlAnterior.split('/');
          const filename = parts[parts.length - 1];
          const publicId = 'wonderbarber/galeria/' + filename.split('.')[0];

          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error('Error al eliminar imagen anterior de Cloudinary:', err);
          }
        }
      }

      // Subir nueva imagen a Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'wonderbarber/galeria',
        resource_type: 'auto'
      });

      // Eliminar archivo temporal
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      const imagenUrl = result.secure_url;
      query = 'UPDATE galeria SET titulo = $1, descripcion = $2, imagen_url = $3 WHERE id = $4 RETURNING *';
      params = [titulo, descripcion, imagenUrl, id];
    } else {
      query = 'UPDATE galeria SET titulo = $1, descripcion = $2 WHERE id = $3 RETURNING *';
      params = [titulo, descripcion, id];
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

    // Eliminar el archivo temporal si hubo un error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ mensaje: 'Error al actualizar item: ' + error.message });
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

    // Eliminar imagen de Cloudinary
    if (imagenUrl.includes('cloudinary.com')) {
      const parts = imagenUrl.split('/');
      const filename = parts[parts.length - 1];
      const publicId = 'wonderbarber/galeria/' + filename.split('.')[0];

      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Error al eliminar imagen de Cloudinary:', err);
      }
    }

    res.json({ mensaje: 'Item eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar item:', error);
    res.status(500).json({ mensaje: 'Error al eliminar item: ' + error.message });
  }
};

module.exports = {
  obtenerItems,
  crearItem,
  actualizarItem,
  eliminarItem
};
