const pool = require('./src/config/database');

async function verGaleria() {
  try {
    const resultado = await pool.query('SELECT * FROM galeria ORDER BY created_at DESC');

    console.log('\n=== ITEMS EN LA GALERÍA ===\n');

    if (resultado.rows.length === 0) {
      console.log('No hay items en la galería');
    } else {
      resultado.rows.forEach((item, index) => {
        console.log(`Item ${index + 1}:`);
        console.log(`  ID: ${item.id}`);
        console.log(`  Título: ${item.titulo}`);
        console.log(`  Descripción: ${item.descripcion}`);
        console.log(`  URL Imagen: ${item.url_imagen}`);
        console.log(`  Creado: ${item.created_at}`);
        console.log('');
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error al consultar galería:', error);
    process.exit(1);
  }
}

verGaleria();
