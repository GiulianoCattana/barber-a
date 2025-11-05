const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'peluqueria_db',
  password: '123',
  port: 5432,
});

async function updateAdminEmail() {
  try {
    // Actualizar el email del admin
    await pool.query(
      "UPDATE usuarios SET email = $1 WHERE rol = 'admin'",
      ['wonderbarber2025@gmail.com']
    );

    console.log('✓ Email del admin actualizado a: wonderbarber2025@gmail.com');

    // Verificar el cambio
    const result = await pool.query("SELECT id, email, rol FROM usuarios WHERE rol = 'admin'");
    console.log('\nUsuario admin actualizado:');
    console.table(result.rows);

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

updateAdminEmail();
