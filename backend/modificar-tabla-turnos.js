const pool = require('./src/config/database');

async function modificarTablaTurnos() {
  try {
    console.log('Modificando tabla turnos...\n');

    // Agregar columna servicio_id si no existe
    const agregarColumnaServicioId = `
      ALTER TABLE turnos
      ADD COLUMN IF NOT EXISTS servicio_id INTEGER REFERENCES servicios(id);
    `;
    await pool.query(agregarColumnaServicioId);
    console.log('✅ Columna servicio_id agregada');

    // Agregar columna duracion_minutos si no existe
    const agregarColumnaDuracion = `
      ALTER TABLE turnos
      ADD COLUMN IF NOT EXISTS duracion_minutos INTEGER DEFAULT 30;
    `;
    await pool.query(agregarColumnaDuracion);
    console.log('✅ Columna duracion_minutos agregada');

    // Migrar datos existentes: asignar servicio "Corte de cabello" a turnos sin servicio_id
    const migrarDatos = `
      UPDATE turnos
      SET servicio_id = (SELECT id FROM servicios WHERE nombre = 'Corte de cabello' LIMIT 1),
          duracion_minutos = 30
      WHERE servicio_id IS NULL;
    `;
    const result = await pool.query(migrarDatos);
    console.log(`✅ ${result.rowCount} turnos actualizados con servicio por defecto`);

    // Verificar estructura de la tabla
    const verificar = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'turnos'
      ORDER BY ordinal_position
    `);

    console.log('\n=== ESTRUCTURA DE LA TABLA TURNOS ===\n');
    verificar.rows.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

modificarTablaTurnos();
