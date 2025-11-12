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

      // Verificar si tiene la columna creado_en
      const columnExists = await pool.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'dias_bloqueados' AND column_name = 'creado_en'
      `);

      if (columnExists.rows.length === 0) {
        console.log('🔄 Agregando columna creado_en a dias_bloqueados...');
        await pool.query(`
          ALTER TABLE dias_bloqueados
          ADD COLUMN creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `);
        console.log('✅ Columna creado_en agregada exitosamente');
      }
    }
  } catch (error) {
    console.error('❌ Error al migrar tabla dias_bloqueados:', error.message);
  }
}

module.exports = createDiasBloqueadosTable;
