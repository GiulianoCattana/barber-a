const pool = require('../config/database');

async function renameGaleriaColumn() {
  try {
    // Verificar si la columna url_imagen existe
    const checkColumn = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'galeria' AND column_name = 'url_imagen'
    `);

    if (checkColumn.rows.length > 0) {
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

module.exports = renameGaleriaColumn;
