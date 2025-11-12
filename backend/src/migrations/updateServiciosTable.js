const pool = require('../config/database');

async function updateServiciosTable() {
  try {
    console.log('🔄 Verificando tabla servicios...');

    // Verificar y agregar columnas de timestamp
    const columns = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'servicios'
    `);

    const columnNames = columns.rows.map(row => row.column_name);

    // Agregar created_at si no existe
    if (!columnNames.includes('created_at')) {
      console.log('🔄 Agregando columna created_at a servicios...');
      await pool.query(`
        ALTER TABLE servicios
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ Columna created_at agregada exitosamente');
    }

    // Agregar updated_at si no existe
    if (!columnNames.includes('updated_at')) {
      console.log('🔄 Agregando columna updated_at a servicios...');
      await pool.query(`
        ALTER TABLE servicios
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ Columna updated_at agregada exitosamente');
    }

    console.log('✅ Tabla servicios actualizada correctamente');
  } catch (error) {
    console.error('❌ Error al actualizar tabla servicios:', error.message);
  }
}

module.exports = updateServiciosTable;
