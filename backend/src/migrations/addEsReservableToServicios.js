const pool = require('../config/database');

async function addEsReservableToServicios() {
  try {
    console.log('🔄 Verificando columna es_reservable en servicios...');

    // Verificar si la columna ya existe
    const columnExists = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'servicios' AND column_name = 'es_reservable'
    `);

    if (columnExists.rows.length === 0) {
      console.log('🔄 Agregando columna es_reservable a servicios...');

      // Agregar la columna con valor por defecto true
      await pool.query(`
        ALTER TABLE servicios
        ADD COLUMN es_reservable BOOLEAN DEFAULT true
      `);

      // Marcar como no reservables los servicios que están en home_servicios
      await pool.query(`
        UPDATE servicios
        SET es_reservable = false
        WHERE id IN (SELECT servicio_id FROM home_servicios)
      `);

      console.log('✅ Columna es_reservable agregada y servicios del home marcados como no reservables');
    } else {
      console.log('✓ La columna es_reservable ya existe');
    }
  } catch (error) {
    console.error('❌ Error al agregar columna es_reservable:', error.message);
  }
}

module.exports = addEsReservableToServicios;
