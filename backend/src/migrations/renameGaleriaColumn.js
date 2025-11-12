const pool = require('../config/database');

async function migrateGaleria() {
  try {
    // 1. Agregar columna descripcion si no existe
    const checkDescripcion = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'galeria' AND column_name = 'descripcion'
    `);

    if (checkDescripcion.rows.length === 0) {
      console.log('🔄 Agregando columna descripcion a tabla galeria...');
      await pool.query('ALTER TABLE galeria ADD COLUMN descripcion TEXT NOT NULL DEFAULT \'\'');
      console.log('✅ Columna descripcion agregada exitosamente');
    } else {
      console.log('✓ La columna descripcion ya existe');
    }

    // 2. Renombrar url_imagen a imagen_url si existe
    const checkUrlImagen = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'galeria' AND column_name = 'url_imagen'
    `);

    if (checkUrlImagen.rows.length > 0) {
      console.log('🔄 Renombrando columna url_imagen a imagen_url en tabla galeria...');
      await pool.query('ALTER TABLE galeria RENAME COLUMN url_imagen TO imagen_url');
      console.log('✅ Columna renombrada exitosamente');
    } else {
      console.log('✓ La columna imagen_url ya existe');
    }
  } catch (error) {
    console.error('❌ Error en migración de galeria:', error.message);
    // No lanzar error para que el servidor pueda iniciar
  }
}

module.exports = migrateGaleria;
