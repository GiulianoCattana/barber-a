const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'peluqueria_db',
  password: '123',
  port: 5432,
});

async function insertarImagenesSlider() {
  try {
    // Primero verificamos si ya existen imágenes
    const verificar = await pool.query('SELECT COUNT(*) FROM slider_imagenes');
    console.log('Imágenes actuales en slider:', verificar.rows[0].count);

    // Insertar imágenes de ejemplo usando las mismas que están en assets
    const imagenes = [
      { url: 'assets/images/barbershop1.jpg', alt: 'Barbería Moderna', orden: 1 },
      { url: 'assets/images/barbershop2.jpg', alt: 'Cortes Profesionales', orden: 2 },
      { url: 'assets/images/barbershop3.jpg', alt: 'Ambiente Acogedor', orden: 3 }
    ];

    for (const img of imagenes) {
      await pool.query(
        'INSERT INTO slider_imagenes (imagen_url, alt_text, orden, activo) VALUES ($1, $2, $3, $4)',
        [img.url, img.alt, img.orden, true]
      );
      console.log(`✓ Insertada imagen: ${img.alt}`);
    }

    // Verificar resultado
    const resultado = await pool.query('SELECT * FROM slider_imagenes ORDER BY orden');
    console.log('\n=== IMÁGENES EN SLIDER ===');
    resultado.rows.forEach(row => {
      console.log(`ID: ${row.id}, URL: ${row.imagen_url}, Alt: ${row.alt_text}, Orden: ${row.orden}`);
    });

    pool.end();
  } catch (error) {
    console.error('Error:', error);
    pool.end();
  }
}

insertarImagenesSlider();
