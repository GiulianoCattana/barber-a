const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function addRecoveryColumns() {
  const client = await pool.connect();
  try {
    // Agregar columnas para recuperación de contraseña
    await client.query(`
      ALTER TABLE usuarios
      ADD COLUMN IF NOT EXISTS pregunta_seguridad VARCHAR(255),
      ADD COLUMN IF NOT EXISTS respuesta_seguridad VARCHAR(255),
      ADD COLUMN IF NOT EXISTS codigo_recuperacion VARCHAR(50)
    `);

    console.log('Columnas de recuperación agregadas exitosamente');

    // Generar código de recuperación para usuarios existentes que sean admin
    const adminResult = await client.query(`
      SELECT id, email FROM usuarios WHERE rol = 'admin' AND codigo_recuperacion IS NULL
    `);

    for (const admin of adminResult.rows) {
      const codigoRecuperacion = crypto.randomBytes(4).toString('hex').toUpperCase();
      await client.query(
        'UPDATE usuarios SET codigo_recuperacion = $1 WHERE id = $2',
        [codigoRecuperacion, admin.id]
      );
      console.log(`Código de recuperación generado para ${admin.email}: ${codigoRecuperacion}`);
      console.log('¡IMPORTANTE! Guarda este código en un lugar seguro.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addRecoveryColumns();
