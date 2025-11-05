const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'peluqueria_db',
  password: '123',
  port: 5432,
});

async function fix() {
  try {
    console.log('=== LIMPIANDO HORARIO 9:00 ===\n');

    // Eliminar el bloqueo existente de las 9:00 del 2025-11-05
    const result = await pool.query(`
      DELETE FROM horarios_bloqueados
      WHERE fecha = '2025-11-05' AND hora = '09:00:00'
      RETURNING *
    `);

    console.log('Bloqueo eliminado:');
    console.table(result.rows);

    console.log('\nAhora puedes gestionar el horario de las 9:00 desde el dashboard del admin');

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

fix();
