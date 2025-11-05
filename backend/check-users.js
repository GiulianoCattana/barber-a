const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'peluqueria_db',
  password: '123',
  port: 5432,
});

async function checkUsers() {
  try {
    const result = await pool.query('SELECT id, email, rol FROM usuarios');
    console.log('Usuarios registrados:');
    console.table(result.rows);

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

checkUsers();
