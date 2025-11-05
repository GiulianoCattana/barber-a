const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'peluqueria_db',
  password: process.env.DB_PASSWORD || '123',
  port: process.env.DB_PORT || 5432,
});

async function addEmailVerificationColumns() {
  const client = await pool.connect();

  try {
    console.log('Agregando columnas para verificación por email...');

    await client.query(`
      ALTER TABLE usuarios
      ADD COLUMN IF NOT EXISTS codigo_verificacion VARCHAR(6),
      ADD COLUMN IF NOT EXISTS codigo_expiracion TIMESTAMP;
    `);

    console.log('✓ Columnas agregadas exitosamente');

  } catch (error) {
    console.error('Error al agregar columnas:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addEmailVerificationColumns();
