const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'peluqueria_db',
  password: '123',
  port: 5432,
});

async function fixConstraint() {
  try {
    // Eliminar la restricción de unicidad que causa el problema
    await pool.query(`
      ALTER TABLE turnos DROP CONSTRAINT IF EXISTS turnos_fecha_hora_key;
    `);

    console.log('✅ Restricción de unicidad eliminada exitosamente');
    console.log('Ahora los turnos pueden ocupar múltiples slots sin conflictos');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixConstraint();
