const http = require('http');

const fecha = '2025-11-02'; // Mañana

const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/turnos/disponibles?fecha=${fecha}`,
    method: 'GET'
};

const req = http.request(options, (res) => {
    let body = '';

    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('\n=== TEST HORARIOS DISPONIBLES ===');
        console.log('Fecha consultada:', fecha);
        console.log('Status:', res.statusCode);
        console.log('Response:', body);

        try {
            const data = JSON.parse(body);
            console.log('\nParsed data:', JSON.stringify(data, null, 2));
        } catch (e) {
            console.log('Error parsing JSON:', e.message);
        }
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.end();
