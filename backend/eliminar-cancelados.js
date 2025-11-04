const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '123',
    database: 'peluqueria_db'
});

async function eliminarCancelados() {
    try {
        console.log('Eliminando turnos cancelados...');

        const result = await pool.query('DELETE FROM turnos WHERE estado = $1 RETURNING *', ['cancelado']);

        console.log(`\n✓ Se eliminaron ${result.rows.length} turnos cancelados:\n`);

        result.rows.forEach(turno => {
            console.log(`  - Fecha: ${turno.fecha}, Hora: ${turno.hora}`);
        });

        console.log('\n✓ Ahora esos horarios están disponibles para reservar de nuevo!');

        await pool.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

eliminarCancelados();
