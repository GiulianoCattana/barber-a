const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'peluqueria_db',
  password: '123',
  port: 5432,
});

async function checkAndClean() {
  try {
    console.log('=== VERIFICANDO TURNOS CANCELADOS ===\n');

    // Ver turnos cancelados del 2025-11-05
    const cancelados = await pool.query(`
      SELECT id, fecha, hora, servicio, estado
      FROM turnos
      WHERE fecha = '2025-11-05' AND estado = 'cancelado'
      ORDER BY hora
    `);

    console.log('Turnos cancelados del 2025-11-05:');
    console.table(cancelados.rows);

    if (cancelados.rows.length > 0) {
      console.log('\n¿Quieres eliminar estos turnos cancelados? (mejorará el sistema)');
      console.log('Eliminando turnos cancelados...\n');

      const result = await pool.query(`
        DELETE FROM turnos
        WHERE fecha = '2025-11-05' AND estado = 'cancelado'
        RETURNING id, hora, servicio
      `);

      console.log('✓ Turnos cancelados eliminados:');
      console.table(result.rows);
    } else {
      console.log('\nNo hay turnos cancelados para eliminar');
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

checkAndClean();
