const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'peluqueria_db',
  password: '123',
  port: 5432,
});

async function crearSistemaSuscripciones() {
  try {
    console.log('Creando sistema de suscripciones...\n');

    // Crear tabla de suscripciones
    await pool.query(`
      CREATE TABLE IF NOT EXISTS suscripciones (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
        fecha_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        fecha_vencimiento TIMESTAMP NOT NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'activa', -- 'activa', 'vencida', 'gracia', 'bloqueada'
        es_periodo_prueba BOOLEAN DEFAULT TRUE,
        monto_mensual DECIMAL(10,2) DEFAULT 25000.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tabla suscripciones creada');

    // Crear tabla de pagos de suscripción
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pagos_suscripcion (
        id SERIAL PRIMARY KEY,
        suscripcion_id INTEGER REFERENCES suscripciones(id) ON DELETE CASCADE,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        monto DECIMAL(10,2) NOT NULL,
        fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metodo_pago VARCHAR(50) DEFAULT 'mercadopago',
        comprobante_url TEXT,
        mercadopago_id VARCHAR(255),
        estado VARCHAR(20) DEFAULT 'completado', -- 'pendiente', 'completado', 'fallido'
        notas TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tabla pagos_suscripcion creada');

    // Crear índices
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_suscripciones_usuario ON suscripciones(usuario_id);
      CREATE INDEX IF NOT EXISTS idx_suscripciones_estado ON suscripciones(estado);
      CREATE INDEX IF NOT EXISTS idx_suscripciones_vencimiento ON suscripciones(fecha_vencimiento);
      CREATE INDEX IF NOT EXISTS idx_pagos_suscripcion_usuario ON pagos_suscripcion(usuario_id);
      CREATE INDEX IF NOT EXISTS idx_pagos_suscripcion_fecha ON pagos_suscripcion(fecha_pago);
    `);
    console.log('✓ Índices creados');

    // Crear suscripción para el admin existente (30 días de prueba)
    const adminResult = await pool.query(`
      SELECT id FROM usuarios WHERE rol = 'admin' LIMIT 1
    `);

    if (adminResult.rows.length > 0) {
      const adminId = adminResult.rows[0].id;
      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

      await pool.query(`
        INSERT INTO suscripciones (usuario_id, fecha_vencimiento, es_periodo_prueba, estado)
        VALUES ($1, $2, TRUE, 'activa')
        ON CONFLICT (usuario_id) DO NOTHING
      `, [adminId, fechaVencimiento]);

      console.log(`✓ Suscripción de prueba creada para admin (vence: ${fechaVencimiento.toLocaleDateString()})`);
    }

    console.log('\n✅ Sistema de suscripciones configurado correctamente!');
    console.log('Configuración:');
    console.log('- Período de prueba: 30 días');
    console.log('- Período de gracia: 3 días');
    console.log('- Costo mensual: $25,000');

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

crearSistemaSuscripciones();
