const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'peluqueria_db',
  password: '123',
  port: 5432,
});

async function agregarColumnaEmailVerificado() {
  try {
    // Verificar si la columna ya existe
    const checkColumn = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='usuarios' AND column_name='email_verificado'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('✓ La columna email_verificado ya existe');

      // Actualizar usuarios existentes para marcarlos como verificados
      await pool.query(`
        UPDATE usuarios
        SET email_verificado = true
        WHERE email_verificado IS NULL
      `);
      console.log('✓ Usuarios existentes marcados como verificados');

    } else {
      // Agregar la columna
      await pool.query(`
        ALTER TABLE usuarios
        ADD COLUMN email_verificado BOOLEAN DEFAULT false
      `);
      console.log('✓ Columna email_verificado agregada exitosamente');

      // Marcar usuarios existentes como verificados (para no afectar a los que ya están)
      await pool.query(`
        UPDATE usuarios
        SET email_verificado = true
      `);
      console.log('✓ Usuarios existentes marcados como verificados');
    }

    console.log('\n✓ Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error en la migración:', error);
    process.exit(1);
  }
}

agregarColumnaEmailVerificado();
