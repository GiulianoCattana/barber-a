const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'peluqueria_db',
  password: '123',
  port: 5432,
});

async function addEmailContacto() {
  try {
    // Agregar columna email_contacto a la tabla usuarios
    console.log('Agregando columna email_contacto...');
    await pool.query(`
      ALTER TABLE usuarios
      ADD COLUMN IF NOT EXISTS email_contacto VARCHAR(255)
    `);

    console.log('✓ Columna email_contacto agregada');

    // Actualizar el admin para que tenga:
    // - email (para login): admin@peluqueria.com
    // - email_contacto (para recibir emails): wonderbarber2025@gmail.com
    console.log('\nActualizando usuario admin...');
    await pool.query(`
      UPDATE usuarios
      SET email = 'admin@peluqueria.com',
          email_contacto = 'wonderbarber2025@gmail.com'
      WHERE rol = 'admin'
    `);

    console.log('✓ Usuario admin actualizado');

    // Verificar los cambios
    const result = await pool.query(`
      SELECT id, email, email_contacto, rol
      FROM usuarios
      WHERE rol = 'admin'
    `);

    console.log('\n--- Usuario Admin Actualizado ---');
    console.table(result.rows);
    console.log('\nAhora puedes:');
    console.log('1. Login con: admin@peluqueria.com');
    console.log('2. Recibir códigos de recuperación en: wonderbarber2025@gmail.com');

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

addEmailContacto();
