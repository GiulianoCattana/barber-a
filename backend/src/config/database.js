const { Pool } = require('pg');
require('dotenv').config();

// Configuración para desarrollo local y producción (Render)
const pool = new Pool({
  // Si existe DATABASE_URL (Render), úsalo
  connectionString: process.env.DATABASE_URL || undefined,
  // Si no existe DATABASE_URL, usa variables individuales (desarrollo local)
  host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
  port: process.env.DATABASE_URL ? undefined : process.env.DB_PORT,
  database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME,
  user: process.env.DATABASE_URL ? undefined : process.env.DB_USER,
  password: process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD,
  // SSL requerido para Render
  ssl: process.env.DATABASE_URL ? {
    rejectUnauthorized: false
  } : false
});

pool.on('connect', () => {
  console.log('Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Error en la conexión a PostgreSQL:', err);
});

module.exports = pool;
