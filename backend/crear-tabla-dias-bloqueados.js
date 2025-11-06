const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'peluqueria_db',
  password: '123',
  port: 5432,
});

async function crearTablaDiasBloqueados() {
  try {
    console.log('Creando tabla de días bloqueados...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS dias_bloqueados (
        id SERIAL PRIMARY KEY,
        fecha DATE NOT NULL UNIQUE,
        motivo VARCHAR(255),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✓ Tabla dias_bloqueados creada exitosamente');

    // Crear índice para búsquedas más rápidas por fecha
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_dias_bloqueados_fecha
      ON dias_bloqueados(fecha);
    `);

    console.log('✓ Índice creado exitosamente');

    await pool.end();
    console.log('✓ Configuración completada');
  } catch (error) {
    console.error('Error al crear tabla:', error);
    await pool.end();
    process.exit(1);
  }
}

crearTablaDiasBloqueados();
