const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'peluqueria_db',
  password: '123',
  port: 5432,
});

async function limpiarTurnos() {
  try {
    console.log('Limpiando turnos de prueba...');

    // Eliminar todos los turnos
    const resultado = await pool.query('DELETE FROM turnos RETURNING *');

    console.log(`✓ Se eliminaron ${resultado.rowCount} turnos`);

    // Verificar que la tabla esté vacía
    const verificar = await pool.query('SELECT COUNT(*) FROM turnos');
    console.log(`✓ Turnos restantes: ${verificar.rows[0].count}`);

    await pool.end();
    console.log('✓ Limpieza completada exitosamente');
  } catch (error) {
    console.error('Error al limpiar turnos:', error);
    await pool.end();
    process.exit(1);
  }
}

limpiarTurnos();
