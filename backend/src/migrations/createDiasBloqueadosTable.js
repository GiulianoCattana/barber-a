const pool = require('../config/database');

async function createDiasBloqueadosTable() {
  try {
    // Verificar si la tabla existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'dias_bloqueados'
      )
    `);

    if (!tableExists.rows[0].exists) {
      console.log('🔄 Creando tabla dias_bloqueados...');

      await pool.query(`
        CREATE TABLE dias_bloqueados (
          id SERIAL PRIMARY KEY,
          fecha DATE NOT NULL UNIQUE,
          motivo TEXT,
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✅ Tabla dias_bloqueados creada exitosamente');
    } else {
      console.log('✓ La tabla dias_bloqueados ya existe');
    }
  } catch (error) {
    console.error('❌ Error al crear tabla dias_bloqueados:', error.message);
  }
}

module.exports = createDiasBloqueadosTable;
