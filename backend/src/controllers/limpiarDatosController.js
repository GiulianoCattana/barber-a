const pool = require('../config/database');

// Endpoint temporal para limpiar datos de producción
const limpiarDatos = async (req, res) => {
  try {
    console.log('🗑️  Iniciando limpieza de datos...');

    // 1. Ver usuarios actuales
    const usuarios = await pool.query('SELECT id, nombre, email, rol FROM usuarios ORDER BY rol, id');
    console.log('📋 Usuarios actuales:', usuarios.rows);

    // 2. Ver turnos actuales
    const turnos = await pool.query('SELECT COUNT(*) as total FROM turnos');
    console.log(`📋 Turnos actuales: ${turnos.rows[0].total}`);

    // 3. Eliminar turnos
    const deletedTurnos = await pool.query('DELETE FROM turnos RETURNING id');
    console.log(`✅ ${deletedTurnos.rowCount} turnos eliminados`);

    // 4. Eliminar clientes (mantener admin)
    const deletedClientes = await pool.query("DELETE FROM usuarios WHERE rol = 'cliente' RETURNING id, nombre, email");
    console.log(`✅ ${deletedClientes.rowCount} clientes eliminados`);

    if (deletedClientes.rows.length > 0) {
      console.log('Clientes eliminados:', deletedClientes.rows);
    }

    // 5. Verificar resultado final
    const usuariosFinales = await pool.query('SELECT id, nombre, email, rol FROM usuarios ORDER BY rol, id');
    const turnosFinales = await pool.query('SELECT COUNT(*) as total FROM turnos');

    res.json({
      mensaje: 'Base de datos limpiada exitosamente',
      eliminados: {
        turnos: deletedTurnos.rowCount,
        clientes: deletedClientes.rowCount,
        clientesEliminados: deletedClientes.rows
      },
      resultado: {
        usuariosRestantes: usuariosFinales.rows,
        turnosRestantes: turnosFinales.rows[0].total
      }
    });

  } catch (error) {
    console.error('❌ Error al limpiar datos:', error);
    res.status(500).json({ mensaje: 'Error al limpiar datos', error: error.message });
  }
};

module.exports = { limpiarDatos };
