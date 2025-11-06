const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'peluqueria_db',
  password: '123',
  port: 5432,
});

async function verificarDiasBloqueados() {
  try {
    const result = await pool.query('SELECT * FROM dias_bloqueados ORDER BY fecha');

    console.log('\n=== DÍAS BLOQUEADOS ===');
    console.log('Total:', result.rows.length);

    if (result.rows.length > 0) {
      console.log('\nDías bloqueados:');
      result.rows.forEach(dia => {
        console.log(`- ${dia.fecha}: ${dia.motivo || 'Sin motivo'}`);
      });
    } else {
      console.log('\nNo hay días bloqueados actualmente.');
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

verificarDiasBloqueados();
