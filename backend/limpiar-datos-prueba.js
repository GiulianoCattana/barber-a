const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'peluqueria_db',
  password: '123',
  port: 5432,
});

async function limpiarDatosPrueba() {
  try {
    console.log('Limpiando datos de prueba...\n');

    // Limpiar horarios bloqueados
    const bloqueados = await pool.query('DELETE FROM horarios_bloqueados RETURNING *');
    console.log(`✓ Se eliminaron ${bloqueados.rowCount} horarios bloqueados`);

    // Verificar horarios bloqueados
    const verBloqueados = await pool.query('SELECT COUNT(*) FROM horarios_bloqueados');
    console.log(`  Horarios bloqueados restantes: ${verBloqueados.rows[0].count}`);

    console.log('\n✓ Limpieza completada exitosamente');
    console.log('\nResumen:');
    console.log('- Turnos: Limpiados previamente (0 restantes)');
    console.log(`- Horarios bloqueados: ${bloqueados.rowCount} eliminados`);
    console.log('- Servicios: Conservados (no eliminados)');
    console.log('- Usuarios: Conservados (no eliminados)');

    await pool.end();
  } catch (error) {
    console.error('Error al limpiar datos:', error);
    await pool.end();
    process.exit(1);
  }
}

limpiarDatosPrueba();
