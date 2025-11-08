const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'peluqueria_db',
  password: '123',
  port: 5432,
});

async function crearTablaConfiguracionPagos() {
  try {
    console.log('Creando tabla de configuración de pagos...\n');

    // Crear tabla para configuración de pagos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS configuracion_pagos (
        id SERIAL PRIMARY KEY,
        alias_transferencia VARCHAR(100) NOT NULL DEFAULT 'wonderbarbeia',
        mensaje_transferencia TEXT DEFAULT 'Por favor, realiza la transferencia y envía el comprobante',
        actualizado_por INTEGER REFERENCES usuarios(id),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tabla configuracion_pagos creada');

    // Insertar configuración por defecto
    await pool.query(`
      INSERT INTO configuracion_pagos (alias_transferencia)
      VALUES ('wonderbarbeia')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✓ Configuración por defecto insertada');

    // Agregar columna metodo_pago a la tabla turnos si no existe
    await pool.query(`
      ALTER TABLE turnos
      ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(20) DEFAULT 'efectivo';
    `);
    console.log('✓ Columna metodo_pago agregada a turnos');

    console.log('\n✅ Configuración de pagos lista!');
    console.log('Alias por defecto: wonderbarbeia');

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

crearTablaConfiguracionPagos();
