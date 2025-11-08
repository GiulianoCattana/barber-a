const { Client } = require('pg');

const client = new Client({
  host: 'dpg-d46kgj0dl3ps73bp02o0-a.oregon-postgres.render.com',
  port: 5432,
  database: 'peluqueria_db_5hwu',
  user: 'peluqueria_db_5hwu_user',
  password: 'lJE1qtz0s05mu5GIZ08px8a6sH741GaB',
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  try {
    console.log('Conectando a la base de datos de Render...');
    await client.connect();
    console.log('✓ Conectado exitosamente\n');

    console.log('Creando tablas...');

    // Tabla de usuarios
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
        email_verificado BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tabla usuarios creada');

    // Tabla de turnos
    await client.query(`
      CREATE TABLE IF NOT EXISTS turnos (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        fecha DATE NOT NULL,
        hora TIME NOT NULL,
        servicio VARCHAR(100),
        estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
        notas TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fecha, hora)
      );
    `);
    console.log('✓ Tabla turnos creada');

    // Índices para turnos
    await client.query(`CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON turnos(fecha);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_turnos_cliente ON turnos(cliente_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos(estado);`);
    console.log('✓ Índices de turnos creados');

    // Tabla de servicios
    await client.query(`
      CREATE TABLE IF NOT EXISTS servicios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        duracion INTEGER NOT NULL,
        precio DECIMAL(10, 2) NOT NULL,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tabla servicios creada');

    // Tabla de galería
    await client.query(`
      CREATE TABLE IF NOT EXISTS galeria (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(200),
        imagen_url VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tabla galeria creada');

    // Tabla de horarios bloqueados
    await client.query(`
      CREATE TABLE IF NOT EXISTS horarios_bloqueados (
        id SERIAL PRIMARY KEY,
        fecha DATE NOT NULL,
        hora TIME NOT NULL,
        motivo VARCHAR(200),
        bloqueado_por INTEGER REFERENCES usuarios(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fecha, hora)
      );
    `);
    console.log('✓ Tabla horarios_bloqueados creada');

    // Tabla de días bloqueados
    await client.query(`
      CREATE TABLE IF NOT EXISTS dias_bloqueados (
        id SERIAL PRIMARY KEY,
        fecha DATE NOT NULL UNIQUE,
        motivo VARCHAR(200),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tabla dias_bloqueados creada');

    // Tabla de slider
    await client.query(`
      CREATE TABLE IF NOT EXISTS slider_imagenes (
        id SERIAL PRIMARY KEY,
        imagen_url VARCHAR(500) NOT NULL,
        orden INTEGER DEFAULT 0,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tabla slider_imagenes creada');

    // Tabla de home servicios
    await client.query(`
      CREATE TABLE IF NOT EXISTS home_servicios (
        id SERIAL PRIMARY KEY,
        servicio_id INTEGER REFERENCES servicios(id) ON DELETE CASCADE,
        orden INTEGER DEFAULT 0,
        mostrar BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tabla home_servicios creada');

    console.log('\nInsertando datos iniciales...');

    // Insertar usuario admin
    await client.query(`
      INSERT INTO usuarios (nombre, email, password, rol)
      VALUES ('Administrador', 'wonderbarber2025@gmail.com', '$2a$10$GdrzA5AoEc1idCHcOH/w7OrlsFLyFoMfHZkQP4nNJxHhF8JL2.3u.', 'admin')
      ON CONFLICT (email) DO NOTHING;
    `);
    console.log('✓ Usuario administrador creado');

    // Insertar servicios básicos
    await client.query(`
      INSERT INTO servicios (nombre, descripcion, duracion, precio) VALUES
      ('Corte de pelo', 'Corte y estilo profesional', 30, 10000),
      ('Barba', 'Arreglo de barba', 25, 5000),
      ('Corte + Barba', 'Combo completo', 45, 14000)
      ON CONFLICT DO NOTHING;
    `);
    console.log('✓ Servicios básicos insertados');

    console.log('\n✅ ¡Base de datos configurada exitosamente!');
    console.log('\nCredenciales del administrador:');
    console.log('Email: wonderbarber2025@gmail.com');
    console.log('Password: admin123');

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

setupDatabase();
