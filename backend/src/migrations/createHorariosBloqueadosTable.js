const pool = require('../config/database');

async function createHorariosBloqueadosTable() {
  try {
    // Verificar si la tabla existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'horarios_bloqueados'
      )
    `);

    if (!tableExists.rows[0].exists) {
      console.log('🔄 Creando tabla horarios_bloqueados...');

      await pool.query(`
        CREATE TABLE horarios_bloqueados (
          id SERIAL PRIMARY KEY,
          fecha DATE NOT NULL,
          hora TIME NOT NULL,
          motivo TEXT,
          creado_por INTEGER REFERENCES usuarios(id),
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(fecha, hora)
        )
      `);

      console.log('✅ Tabla horarios_bloqueados creada exitosamente');
    } else {
      console.log('✓ La tabla horarios_bloqueados ya existe');
    }
  } catch (error) {
    console.error('❌ Error al crear tabla horarios_bloqueados:', error.message);
  }
}

module.exports = createHorariosBloqueadosTable;
