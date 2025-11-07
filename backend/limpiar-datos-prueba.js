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

    // 1. Eliminar todos los turnos
    const turnosResult = await pool.query("DELETE FROM turnos WHERE id IS NOT NULL");
    console.log(`✓ ${turnosResult.rowCount} turnos eliminados`);

    // 2. Eliminar todos los clientes (usuarios que no son admin)
    const clientesResult = await pool.query("DELETE FROM usuarios WHERE rol != 'admin'");
    console.log(`✓ ${clientesResult.rowCount} clientes eliminados`);

    // 3. Limpiar horarios bloqueados
    const bloqueados = await pool.query('DELETE FROM horarios_bloqueados');
    console.log(`✓ ${bloqueados.rowCount} horarios bloqueados eliminados`);

    // 4. Verificar qué quedó
    console.log('\n--- Estado actual de la base de datos ---');

    const usuariosRestantes = await pool.query("SELECT id, nombre, email, rol FROM usuarios");
    console.log('\nUsuarios restantes:');
    console.table(usuariosRestantes.rows);

    const turnosRestantes = await pool.query("SELECT COUNT(*) as total FROM turnos");
    console.log(`Turnos restantes: ${turnosRestantes.rows[0].total}`);

    const serviciosRestantes = await pool.query("SELECT COUNT(*) as total FROM servicios");
    console.log(`Servicios: ${serviciosRestantes.rows[0].total} (conservados)`);

    console.log('\n✓ Limpieza completada exitosamente');

    await pool.end();
  } catch (error) {
    console.error('Error al limpiar datos:', error);
    await pool.end();
    process.exit(1);
  }
}

limpiarDatosPrueba();
