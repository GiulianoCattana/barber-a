const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'peluqueria_db',
  password: '123',
  port: 5432,
});

async function debug() {
  try {
    console.log('=== DEBUGGING HORARIO 9:00 ===\n');

    // Verificar horarios bloqueados
    const bloqueados = await pool.query(`
      SELECT * FROM horarios_bloqueados
      WHERE hora = '09:00:00'
      ORDER BY fecha
    `);

    console.log('Horarios bloqueados a las 9:00:');
    console.table(bloqueados.rows);

    // Verificar turnos a las 9:00
    const turnos = await pool.query(`
      SELECT * FROM turnos
      WHERE hora = '09:00:00'
      ORDER BY fecha
    `);

    console.log('\nTurnos a las 9:00:');
    console.table(turnos.rows);

    // Ver todos los horarios bloqueados
    const todosBloqueados = await pool.query(`
      SELECT * FROM horarios_bloqueados
      ORDER BY fecha, hora
    `);

    console.log('\nTODOS los horarios bloqueados:');
    console.table(todosBloqueados.rows);

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

debug();
