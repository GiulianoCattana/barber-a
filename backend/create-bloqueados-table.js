const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'peluqueria_db',
  password: '123',
  port: 5432,
});

async function createBloqueadosTable() {
  try {
    console.log('Creando tabla horarios_bloqueados...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS horarios_bloqueados (
        id SERIAL PRIMARY KEY,
        fecha DATE NOT NULL,
        hora TIME NOT NULL,
        motivo VARCHAR(255),
        creado_por INTEGER REFERENCES usuarios(id),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fecha, hora)
      )
    `);

    console.log('✓ Tabla horarios_bloqueados creada exitosamente');

    // Insertar un ejemplo de horario bloqueado
    console.log('\nInsertando ejemplo de horario bloqueado...');
    await pool.query(`
      INSERT INTO horarios_bloqueados (fecha, hora, motivo)
      VALUES (CURRENT_DATE + INTERVAL '1 day', '09:00:00', 'Día personal del administrador')
      ON CONFLICT (fecha, hora) DO NOTHING
    `);

    console.log('✓ Ejemplo insertado');

    // Verificar la tabla
    const result = await pool.query(`
      SELECT * FROM horarios_bloqueados
      ORDER BY fecha, hora
    `);

    console.log('\n--- Horarios Bloqueados ---');
    console.table(result.rows);

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

createBloqueadosTable();
