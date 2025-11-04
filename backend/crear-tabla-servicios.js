const pool = require('./src/config/database');

async function crearTablaServicios() {
  try {
    // Crear tabla de servicios
    const crearTabla = `
      CREATE TABLE IF NOT EXISTS servicios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        duracion_minutos INTEGER NOT NULL,
        precio DECIMAL(10, 2),
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(crearTabla);
    console.log('✅ Tabla servicios creada exitosamente');

    // Insertar servicios predefinidos
    const insertarServicios = `
      INSERT INTO servicios (nombre, descripcion, duracion_minutos, precio) VALUES
      ('Corte de cabello', 'Corte moderno y clásico adaptado a tu estilo', 30, 5000),
      ('Tinte', 'Coloración profesional con productos de primera calidad', 90, 15000),
      ('Peinado', 'Peinados para eventos especiales y día a día', 45, 8000),
      ('Barba', 'Cuidado y diseño de barba profesional', 30, 4000),
      ('Tratamiento capilar', 'Tratamientos especializados para el cuidado de tu cabello', 60, 12000)
      ON CONFLICT DO NOTHING;
    `;

    await pool.query(insertarServicios);
    console.log('✅ Servicios predefinidos insertados');

    // Verificar servicios insertados
    const result = await pool.query('SELECT * FROM servicios ORDER BY id');
    console.log('\n=== SERVICIOS EN LA BASE DE DATOS ===\n');
    result.rows.forEach(servicio => {
      console.log(`${servicio.id}. ${servicio.nombre}`);
      console.log(`   Duración: ${servicio.duracion_minutos} minutos`);
      console.log(`   Precio: $${servicio.precio}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

crearTablaServicios();
