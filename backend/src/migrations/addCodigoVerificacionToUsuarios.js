const pool = require('../config/database');

async function addCodigoVerificacionToUsuarios() {
  try {
    console.log('🔄 Verificando columnas de verificación en usuarios...');

    // Verificar si codigo_verificacion existe
    const codigoExists = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'usuarios' AND column_name = 'codigo_verificacion'
    `);

    if (codigoExists.rows.length === 0) {
      console.log('🔄 Agregando columna codigo_verificacion...');
      await pool.query(`
        ALTER TABLE usuarios
        ADD COLUMN codigo_verificacion VARCHAR(6)
      `);
      console.log('✅ Columna codigo_verificacion agregada');
    } else {
      console.log('✓ La columna codigo_verificacion ya existe');
    }

    // Verificar si codigo_expiracion existe
    const expiracionExists = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'usuarios' AND column_name = 'codigo_expiracion'
    `);

    if (expiracionExists.rows.length === 0) {
      console.log('🔄 Agregando columna codigo_expiracion...');
      await pool.query(`
        ALTER TABLE usuarios
        ADD COLUMN codigo_expiracion TIMESTAMP
      `);
      console.log('✅ Columna codigo_expiracion agregada');
    } else {
      console.log('✓ La columna codigo_expiracion ya existe');
    }

  } catch (error) {
    console.error('❌ Error al agregar columnas de verificación:', error.message);
  }
}

module.exports = addCodigoVerificacionToUsuarios;
