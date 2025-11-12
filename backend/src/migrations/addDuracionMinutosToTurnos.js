const pool = require('../config/database');

async function addDuracionMinutosToTurnos() {
  try {
    console.log('🔄 Verificando columna duracion_minutos en turnos...');

    // Verificar si la columna ya existe
    const columnExists = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'turnos' AND column_name = 'duracion_minutos'
    `);

    if (columnExists.rows.length === 0) {
      console.log('🔄 Agregando columna duracion_minutos a turnos...');

      // Agregar la columna con valor por defecto 30
      await pool.query(`
        ALTER TABLE turnos
        ADD COLUMN duracion_minutos INTEGER DEFAULT 30
      `);

      // Actualizar turnos existentes con la duración de su servicio asociado
      await pool.query(`
        UPDATE turnos t
        SET duracion_minutos = COALESCE(s.duracion, 30)
        FROM servicios s
        WHERE t.servicio_id = s.id AND t.duracion_minutos IS NULL
      `);

      console.log('✅ Columna duracion_minutos agregada y valores actualizados');
    } else {
      console.log('✓ La columna duracion_minutos ya existe');
    }
  } catch (error) {
    console.error('❌ Error al agregar columna duracion_minutos:', error.message);
  }
}

module.exports = addDuracionMinutosToTurnos;
