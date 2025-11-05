const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'peluqueria_db',
  password: '123',
  port: 5432,
});

async function checkAdmin() {
  try {
    const result = await pool.query("SELECT id, email, password, rol FROM usuarios WHERE rol = 'admin'");

    if (result.rows.length > 0) {
      const admin = result.rows[0];
      console.log('\nInformación del admin:');
      console.log('ID:', admin.id);
      console.log('Email:', admin.email);
      console.log('Rol:', admin.rol);
      console.log('Password hash:', admin.password.substring(0, 30) + '...');

      // Probar contraseñas comunes
      const passwordsToTest = ['admin123', '123456', 'admin', 'password'];
      console.log('\n--- Probando contraseñas comunes ---');

      for (const pwd of passwordsToTest) {
        const match = await bcrypt.compare(pwd, admin.password);
        if (match) {
          console.log(`✓ La contraseña es: ${pwd}`);
          await pool.end();
          return;
        }
      }

      console.log('✗ Ninguna de las contraseñas comunes coincide');
      console.log('\n¿Quieres actualizar la contraseña del admin a "admin123"? (Ejecuta update-admin-password.js)');
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

checkAdmin();
