const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '123',
    database: 'peluqueria_db'
});

async function limpiarTurnos() {
    try {
        console.log('Consultando turnos existentes...');

        const result = await pool.query('SELECT * FROM turnos ORDER BY fecha, hora');

        console.log(`\nTotal de turnos en la BD: ${result.rows.length}\n`);

        result.rows.forEach(turno => {
            console.log(`ID: ${turno.id}, Fecha: ${turno.fecha}, Hora: ${turno.hora}, Estado: ${turno.estado}`);
        });

        console.log('\n¿Deseas eliminar los turnos cancelados? (Esto liberará esos horarios)');
        console.log('Ejecuta: DELETE FROM turnos WHERE estado = \'cancelado\';');

        console.log('\n¿O prefieres eliminar TODOS los turnos de prueba?');
        console.log('Ejecuta: DELETE FROM turnos;');

        await pool.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

limpiarTurnos();
