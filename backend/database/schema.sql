-- Crear base de datos
-- CREATE DATABASE peluqueria_db;

-- Conectarse a la base de datos y ejecutar lo siguiente:

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol VARCHAR(20) NOT NULL DEFAULT 'cliente', -- 'cliente' o 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de turnos
CREATE TABLE IF NOT EXISTS turnos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    servicio VARCHAR(100),
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente', -- 'pendiente', 'confirmado', 'cancelado'
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(fecha, hora)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_turnos_fecha ON turnos(fecha);
CREATE INDEX idx_turnos_cliente ON turnos(cliente_id);
CREATE INDEX idx_turnos_estado ON turnos(estado);

-- Insertar un usuario administrador por defecto (password: admin123)
INSERT INTO usuarios (nombre, email, password, rol)
VALUES ('Administrador', 'admin@peluqueria.com', '$2a$10$G6GVHyfwiXiWxC12rEfN9.su3i2NHpWGGp72cg2vxYbOiWHVW2aJK', 'admin')
ON CONFLICT (email) DO NOTHING;
