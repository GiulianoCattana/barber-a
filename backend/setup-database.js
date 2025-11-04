const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    // Primero conectar a la base de datos postgres por defecto para crear nuestra BD
    const defaultPool = new Pool({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: '123',
        database: 'postgres'
    });

    try {
        console.log('Conectando a PostgreSQL...');

        // Verificar si la base de datos existe
        const checkDb = await defaultPool.query(
            "SELECT 1 FROM pg_database WHERE datname = 'peluqueria_db'"
        );

        if (checkDb.rows.length === 0) {
            console.log('Creando base de datos peluqueria_db...');
            await defaultPool.query('CREATE DATABASE peluqueria_db');
            console.log('✓ Base de datos creada exitosamente');
        } else {
            console.log('✓ La base de datos peluqueria_db ya existe');
        }

        await defaultPool.end();

        // Ahora conectar a la nueva base de datos para crear las tablas
        const appPool = new Pool({
            host: 'localhost',
            port: 5432,
            user: 'postgres',
            password: '123',
            database: 'peluqueria_db'
        });

        console.log('\nCreando tablas...');
        const schemaSQL = fs.readFileSync(
            path.join(__dirname, 'database', 'schema.sql'),
            'utf8'
        );

        await appPool.query(schemaSQL);
        console.log('✓ Tablas creadas exitosamente');

        // Verificar que todo esté bien
        const tables = await appPool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
        `);

        console.log('\nTablas en la base de datos:');
        tables.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });

        // Verificar usuario admin
        const adminCheck = await appPool.query(
            "SELECT email, rol FROM usuarios WHERE rol = 'admin'"
        );

        if (adminCheck.rows.length > 0) {
            console.log('\n✓ Usuario administrador creado:');
            console.log(`  Email: ${adminCheck.rows[0].email}`);
            console.log(`  Password: admin123`);
        }

        await appPool.end();

        console.log('\n¡Base de datos configurada exitosamente! ✓');
        console.log('\nPuedes iniciar sesión con:');
        console.log('  Admin: admin@peluqueria.com / admin123');

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

setupDatabase();
