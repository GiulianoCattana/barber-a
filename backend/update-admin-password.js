const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'peluqueria_db',
  password: '123',
  port: 5432,
});

async function updateAdminPassword() {
  try {
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña del admin
    await pool.query(
      "UPDATE usuarios SET password = $1 WHERE rol = 'admin'",
      [hashedPassword]
    );

    console.log('✓ Contraseña del admin actualizada a: admin123');

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

updateAdminPassword();
