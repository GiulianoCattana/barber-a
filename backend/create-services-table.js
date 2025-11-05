const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function createServicesTable() {
  const client = await pool.connect();
  try {
    // Eliminar tabla si existe para recrearla
    await client.query(`DROP TABLE IF EXISTS servicios CASCADE`);

    // Crear tabla de servicios
    await client.query(`
      CREATE TABLE servicios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10, 2) NOT NULL,
        duracion INTEGER NOT NULL DEFAULT 30,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tabla servicios creada exitosamente');

    // Insertar servicios por defecto
    await client.query(`
      INSERT INTO servicios (nombre, descripcion, precio, duracion) VALUES
      ('Corte de Cabello', 'Corte de cabello tradicional', 15.00, 30),
      ('Afeitado', 'Afeitado con navaja', 10.00, 20),
      ('Barba', 'Arreglo de barba', 12.00, 25),
      ('Corte + Barba', 'Combo de corte y barba', 25.00, 45),
      ('Tinte', 'Tinte de cabello', 35.00, 60)
    `);

    console.log('Servicios por defecto insertados');

    // Actualizar tabla turnos para usar servicio_id en lugar de servicio
    await client.query(`
      ALTER TABLE turnos
      ADD COLUMN IF NOT EXISTS servicio_id INTEGER REFERENCES servicios(id)
    `);

    console.log('Tabla turnos actualizada');

  } catch (error) {
    console.error('Error al crear tabla de servicios:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createServicesTable();
