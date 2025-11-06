const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/slider');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'slider-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
  }
});

// Obtener todas las imágenes del slider
const obtenerImagenesSlider = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM slider_imagenes ORDER BY orden ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener imágenes del slider:', error);
    res.status(500).json({ mensaje: 'Error al obtener imágenes del slider' });
  }
};

// Crear nueva imagen del slider
const crearImagenSlider = async (req, res) => {
  try {
    const { imagen_url, alt_text, orden } = req.body;

    const result = await pool.query(
      'INSERT INTO slider_imagenes (imagen_url, alt_text, orden) VALUES ($1, $2, $3) RETURNING *',
      [imagen_url, alt_text || '', orden || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear imagen del slider:', error);
    res.status(500).json({ mensaje: 'Error al crear imagen del slider' });
  }
};

// Subir imagen
const subirImagen = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se proporcionó ninguna imagen' });
    }

    const imagenUrl = `/uploads/slider/${req.file.filename}`;
    const altText = req.body.alt_text || '';
    const orden = req.body.orden || 0;

    const result = await pool.query(
      'INSERT INTO slider_imagenes (imagen_url, alt_text, orden) VALUES ($1, $2, $3) RETURNING *',
      [imagenUrl, altText, orden]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ mensaje: 'Error al subir imagen' });
  }
};

// Actualizar imagen del slider
const actualizarImagenSlider = async (req, res) => {
  try {
    const { id } = req.params;
    const { imagen_url, alt_text, orden, activo } = req.body;

    const result = await pool.query(
      'UPDATE slider_imagenes SET imagen_url = $1, alt_text = $2, orden = $3, activo = $4 WHERE id = $5 RETURNING *',
      [imagen_url, alt_text, orden, activo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Imagen no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar imagen del slider:', error);
    res.status(500).json({ mensaje: 'Error al actualizar imagen del slider' });
  }
};

// Eliminar imagen del slider
const eliminarImagenSlider = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener la URL de la imagen antes de eliminarla
    const imagenResult = await pool.query('SELECT imagen_url FROM slider_imagenes WHERE id = $1', [id]);

    if (imagenResult.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Imagen no encontrada' });
    }

    const imagenUrl = imagenResult.rows[0].imagen_url;

    // Eliminar de la base de datos
    await pool.query('DELETE FROM slider_imagenes WHERE id = $1', [id]);

    // Intentar eliminar el archivo físico si es una imagen subida
    if (imagenUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../../', imagenUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ mensaje: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar imagen del slider:', error);
    res.status(500).json({ mensaje: 'Error al eliminar imagen del slider' });
  }
};

module.exports = {
  obtenerImagenesSlider,
  crearImagenSlider,
  subirImagen,
  actualizarImagenSlider,
  eliminarImagenSlider,
  upload
};
