const pool = require('./src/config/database');

async function checkTables() {
  try {
    const result = await pool.query(`
      SELECT tablename
      FROM pg_catalog.pg_tables
      WHERE schemaname = 'public'
    `);

    console.log('\n=== TABLAS EN LA BASE DE DATOS ===\n');

    if (result.rows.length === 0) {
      console.log('No hay tablas en la base de datos');
    } else {
      result.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.tablename}`);
      });
    }

    console.log('');
    process.exit(0);
  } catch (error) {
    console.error('Error al consultar tablas:', error.message);
    process.exit(1);
  }
}

checkTables();
