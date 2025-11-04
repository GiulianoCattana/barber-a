const pool = require('./src/config/database');

async function crearTablaGaleria() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS galeria (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT NOT NULL,
        url_imagen VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(query);
    console.log('Tabla galeria creada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al crear tabla galeria:', error);
    process.exit(1);
  }
}

crearTablaGaleria();
