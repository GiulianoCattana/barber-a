const pool = require('../config/database');

async function addLinkMercadopagoToConfiguracion() {
  try {
    console.log('🔄 Verificando columna link_mercadopago en configuracion_pagos...');

    // Verificar si la columna ya existe
    const columnExists = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'configuracion_pagos' AND column_name = 'link_mercadopago'
    `);

    if (columnExists.rows.length === 0) {
      console.log('🔄 Agregando columna link_mercadopago a configuracion_pagos...');

      // Agregar la columna
      await pool.query(`
        ALTER TABLE configuracion_pagos
        ADD COLUMN link_mercadopago TEXT
      `);

      console.log('✅ Columna link_mercadopago agregada correctamente');
    } else {
      console.log('✓ La columna link_mercadopago ya existe');
    }
  } catch (error) {
    console.error('❌ Error al agregar columna link_mercadopago:', error.message);
  }
}

module.exports = addLinkMercadopagoToConfiguracion;
