const pool = require('../config/database');

async function addTransferenciaColumnsToConfiguracion() {
  try {
    console.log('🔄 Verificando columnas de transferencia en configuracion_pagos...');

    // Verificar si alias_transferencia existe
    const aliasExists = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'configuracion_pagos' AND column_name = 'alias_transferencia'
    `);

    if (aliasExists.rows.length === 0) {
      console.log('🔄 Agregando columna alias_transferencia...');
      await pool.query(`
        ALTER TABLE configuracion_pagos
        ADD COLUMN alias_transferencia VARCHAR(100)
      `);
      console.log('✅ Columna alias_transferencia agregada');
    } else {
      console.log('✓ La columna alias_transferencia ya existe');
    }

    // Verificar si mensaje_transferencia existe
    const mensajeExists = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'configuracion_pagos' AND column_name = 'mensaje_transferencia'
    `);

    if (mensajeExists.rows.length === 0) {
      console.log('🔄 Agregando columna mensaje_transferencia...');
      await pool.query(`
        ALTER TABLE configuracion_pagos
        ADD COLUMN mensaje_transferencia TEXT
      `);
      console.log('✅ Columna mensaje_transferencia agregada');
    } else {
      console.log('✓ La columna mensaje_transferencia ya existe');
    }

    // Verificar si imagen_qr existe
    const imagenExists = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'configuracion_pagos' AND column_name = 'imagen_qr'
    `);

    if (imagenExists.rows.length === 0) {
      console.log('🔄 Agregando columna imagen_qr...');
      await pool.query(`
        ALTER TABLE configuracion_pagos
        ADD COLUMN imagen_qr VARCHAR(500)
      `);
      console.log('✅ Columna imagen_qr agregada');
    } else {
      console.log('✓ La columna imagen_qr ya existe');
    }

  } catch (error) {
    console.error('❌ Error al agregar columnas de transferencia:', error.message);
  }
}

module.exports = addTransferenciaColumnsToConfiguracion;
