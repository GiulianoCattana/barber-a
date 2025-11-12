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

      // Verificar y agregar columnas faltantes
      const columns = await pool.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'horarios_bloqueados'
      `);

      const columnNames = columns.rows.map(row => row.column_name);

      // Agregar creado_por si no existe
      if (!columnNames.includes('creado_por')) {
        console.log('🔄 Agregando columna creado_por a horarios_bloqueados...');
        await pool.query(`
          ALTER TABLE horarios_bloqueados
          ADD COLUMN creado_por INTEGER REFERENCES usuarios(id)
        `);
        console.log('✅ Columna creado_por agregada exitosamente');
      }

      // Agregar creado_en si no existe
      if (!columnNames.includes('creado_en')) {
        console.log('🔄 Agregando columna creado_en a horarios_bloqueados...');
        await pool.query(`
          ALTER TABLE horarios_bloqueados
          ADD COLUMN creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `);
        console.log('✅ Columna creado_en agregada exitosamente');
      }

      // Verificar si existe la restricción UNIQUE(fecha, hora)
      const constraints = await pool.query(`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'horarios_bloqueados' AND constraint_type = 'UNIQUE'
      `);

      const hasUniqueConstraint = constraints.rows.some(row =>
        row.constraint_name.includes('fecha') || row.constraint_name.includes('hora')
      );

      if (!hasUniqueConstraint) {
        console.log('🔄 Agregando restricción UNIQUE(fecha, hora)...');
        await pool.query(`
          ALTER TABLE horarios_bloqueados
          ADD CONSTRAINT horarios_bloqueados_fecha_hora_key UNIQUE(fecha, hora)
        `);
        console.log('✅ Restricción UNIQUE agregada exitosamente');
      }
    }
  } catch (error) {
    console.error('❌ Error al migrar tabla horarios_bloqueados:', error.message);
  }
}

module.exports = createHorariosBloqueadosTable;
