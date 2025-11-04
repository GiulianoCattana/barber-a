const pool = require('./src/config/database');

async function verUsuarios() {
  try {
    const resultado = await pool.query('SELECT id, nombre, email, rol FROM usuarios ORDER BY id');

    console.log('\n=== USUARIOS REGISTRADOS ===\n');

    if (resultado.rows.length === 0) {
      console.log('No hay usuarios registrados.\n');
    } else {
      resultado.rows.forEach(usuario => {
        console.log(`ID: ${usuario.id}`);
        console.log(`Nombre: ${usuario.nombre}`);
        console.log(`Email: ${usuario.email}`);
        console.log(`Rol: ${usuario.rol}`);
        console.log('----------------------------');
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error al consultar usuarios:', error);
    process.exit(1);
  }
}

verUsuarios();
