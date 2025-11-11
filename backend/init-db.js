const { Client } = require('pg');

async function initDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // Crear tabla usuarios
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        telefono VARCHAR(20),
        rol VARCHAR(20) NOT NULL DEFAULT 'cliente',
        codigo_recuperacion VARCHAR(6),
        codigo_expiracion TIMESTAMP,
        email_verificado BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla usuarios');

    // Crear tabla servicios
    await client.query(`
      CREATE TABLE IF NOT EXISTS servicios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        duracion INTEGER NOT NULL,
        precio DECIMAL(10, 2) NOT NULL,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla servicios');

    // Crear tabla turnos
    await client.query(`
      CREATE TABLE IF NOT EXISTS turnos (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        fecha DATE NOT NULL,
        hora TIME NOT NULL,
        servicio VARCHAR(100),
        servicio_id INTEGER REFERENCES servicios(id),
        estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
        notas TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fecha, hora)
      )
    `);
    console.log('✅ Tabla turnos');

    // Crear tabla suscripciones
    await client.query(`
      CREATE TABLE IF NOT EXISTS suscripciones (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        fecha_inicio TIMESTAMP DEFAULT NOW(),
        fecha_vencimiento TIMESTAMP NOT NULL,
        es_periodo_prueba BOOLEAN DEFAULT TRUE,
        estado VARCHAR(20) DEFAULT 'activa',
        monto_mensual DECIMAL(10,2) DEFAULT 25000.00,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Tabla suscripciones');

    // Crear tabla configuracion_pagos
    await client.query(`
      CREATE TABLE IF NOT EXISTS configuracion_pagos (
        id SERIAL PRIMARY KEY,
        alias_transferencia VARCHAR(100),
        mensaje_transferencia TEXT,
        tipo_pago VARCHAR(50),
        imagen_qr VARCHAR(500),
        link_mercadopago TEXT,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Tabla configuracion_pagos');

    // Crear tabla pagos_suscripcion
    await client.query(`
      CREATE TABLE IF NOT EXISTS pagos_suscripcion (
        id SERIAL PRIMARY KEY,
        suscripcion_id INTEGER REFERENCES suscripciones(id),
        monto DECIMAL(10,2) NOT NULL,
        fecha_pago TIMESTAMP DEFAULT NOW(),
        metodo_pago VARCHAR(50),
        transaction_id VARCHAR(255),
        estado VARCHAR(20) DEFAULT 'completado'
      )
    `);
    console.log('✅ Tabla pagos_suscripcion');

    // Crear tabla galeria
    await client.query(`
      CREATE TABLE IF NOT EXISTS galeria (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(200),
        imagen_url VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla galeria');

    // Crear tabla horarios_bloqueados
    await client.query(`
      CREATE TABLE IF NOT EXISTS horarios_bloqueados (
        id SERIAL PRIMARY KEY,
        fecha DATE NOT NULL,
        hora TIME NOT NULL,
        motivo VARCHAR(200),
        bloqueado_por INTEGER REFERENCES usuarios(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fecha, hora)
      )
    `);
    console.log('✅ Tabla horarios_bloqueados');

    // Crear tabla dias_bloqueados
    await client.query(`
      CREATE TABLE IF NOT EXISTS dias_bloqueados (
        id SERIAL PRIMARY KEY,
        fecha DATE NOT NULL UNIQUE,
        motivo VARCHAR(200),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla dias_bloqueados');

    // Crear tabla slider_imagenes
    await client.query(`
      CREATE TABLE IF NOT EXISTS slider_imagenes (
        id SERIAL PRIMARY KEY,
        imagen_url VARCHAR(500) NOT NULL,
        orden INTEGER DEFAULT 0,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla slider_imagenes');

    // Crear tabla home_servicios
    await client.query(`
      CREATE TABLE IF NOT EXISTS home_servicios (
        id SERIAL PRIMARY KEY,
        servicio_id INTEGER REFERENCES servicios(id) ON DELETE CASCADE,
        orden INTEGER DEFAULT 0,
        mostrar BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla home_servicios');

    // Insertar configuración de pagos si no existe
    const configCheck = await client.query('SELECT id FROM configuracion_pagos LIMIT 1');
    if (configCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO configuracion_pagos (tipo_pago, link_mercadopago, activo)
        VALUES ('mercadopago', 'https://mpago.la/2Cf9bkf', true)
      `);
      console.log('✅ Configuración de pagos insertada');
    } else {
      console.log('✅ Configuración de pagos ya existe');
    }

    // Verificar si existe admin
    const adminCheck = await client.query(`SELECT id FROM usuarios WHERE email = 'wonderbarber2025@gmail.com'`);

    if (adminCheck.rows.length === 0) {
      // Crear admin (password: admin123)
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);

      await client.query(`
        INSERT INTO usuarios (nombre, email, password, rol, email_verificado)
        VALUES ('Admin', 'wonderbarber2025@gmail.com', $1, 'admin', true)
      `, [hashedPassword]);

      console.log('✅ Usuario admin creado');

      // Obtener ID del admin recién creado
      const admin = await client.query(`SELECT id FROM usuarios WHERE email = 'wonderbarber2025@gmail.com'`);

      // Crear suscripción para admin
      await client.query(`
        INSERT INTO suscripciones (usuario_id, fecha_vencimiento, es_periodo_prueba, estado)
        VALUES ($1, NOW() + INTERVAL '30 days', TRUE, 'activa')
      `, [admin.rows[0].id]);

      console.log('✅ Suscripción admin creada (30 días)');
    } else {
      console.log('✅ Usuario admin ya existe');

      // Actualizar/crear suscripción
      const susCheck = await client.query(`SELECT id FROM suscripciones WHERE usuario_id = $1`, [adminCheck.rows[0].id]);

      if (susCheck.rows.length === 0) {
        await client.query(`
          INSERT INTO suscripciones (usuario_id, fecha_vencimiento, es_periodo_prueba, estado)
          VALUES ($1, NOW() + INTERVAL '30 days', TRUE, 'activa')
        `, [adminCheck.rows[0].id]);
        console.log('✅ Suscripción admin creada (30 días)');
      } else {
        await client.query(`
          UPDATE suscripciones
          SET fecha_vencimiento = NOW() + INTERVAL '30 days',
              fecha_inicio = NOW(),
              es_periodo_prueba = TRUE,
              estado = 'activa'
          WHERE usuario_id = $1
        `, [adminCheck.rows[0].id]);
        console.log('✅ Suscripción admin actualizada (30 días)');
      }
    }

    console.log('\n🎉 Base de datos inicializada correctamente\n');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    await client.end();
    process.exit(1);
  }
}

initDatabase();
