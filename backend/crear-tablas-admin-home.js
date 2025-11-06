const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'peluqueria_db',
  password: '123',
  port: 5432,
});

async function crearTablas() {
  try {
    // Tabla para las imágenes del slider
    await pool.query(`
      CREATE TABLE IF NOT EXISTS slider_imagenes (
        id SERIAL PRIMARY KEY,
        imagen_url VARCHAR(500) NOT NULL,
        alt_text VARCHAR(255),
        orden INTEGER DEFAULT 0,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla slider_imagenes creada');

    // Tabla para los servicios del home
    await pool.query(`
      CREATE TABLE IF NOT EXISTS home_servicios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        icono VARCHAR(50),
        orden INTEGER DEFAULT 0,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla home_servicios creada');

    // Insertar las imágenes actuales del slider
    const sliderCheck = await pool.query('SELECT COUNT(*) FROM slider_imagenes');
    if (parseInt(sliderCheck.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO slider_imagenes (imagen_url, alt_text, orden) VALUES
        ('assets/images/WhatsApp Image 2025-11-05 at 11.29.23 PM.jpeg', 'Wonder Barbershop', 1),
        ('assets/images/wonder-logo.jpg', 'Wonder Logo', 2);
      `);
      console.log('✅ Imágenes del slider insertadas');
    }

    // Insertar los servicios actuales
    const serviciosCheck = await pool.query('SELECT COUNT(*) FROM home_servicios');
    if (parseInt(serviciosCheck.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO home_servicios (nombre, descripcion, icono, orden) VALUES
        ('Corte de Cabello', 'Cortes modernos y clásicos adaptados a tu estilo', '✂️', 1),
        ('Tinte', 'Coloración profesional con productos de primera calidad', '🎨', 2),
        ('Peinado', 'Peinados para eventos especiales y día a día', '💇', 3),
        ('Barba', 'Cuidado y diseño de barba profesional', '🧔', 4),
        ('Tratamiento Capilar', 'Tratamientos especializados para el cuidado de tu cabello', '✨', 5);
      `);
      console.log('✅ Servicios del home insertados');
    }

    console.log('\n🎉 Todas las tablas fueron creadas exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear las tablas:', error);
    process.exit(1);
  }
}

crearTablas();
