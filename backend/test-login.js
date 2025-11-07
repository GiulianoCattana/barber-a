const http = require('http');

// Test login del administrador
const testAdminLogin = () => {
    const data = JSON.stringify({
        email: 'wonderbarber2025@gmail.com',
        password: 'admin123'
    });

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        let body = '';

        res.on('data', (chunk) => {
            body += chunk;
        });

        res.on('end', () => {
            console.log('\n=== TEST LOGIN ADMINISTRADOR ===');
            console.log('Status:', res.statusCode);
            console.log('Response:', JSON.parse(body));

            if (res.statusCode === 200) {
                const response = JSON.parse(body);
                console.log('\n✓ Login exitoso!');
                console.log('Token:', response.token.substring(0, 20) + '...');
                console.log('Usuario:', response.usuario.email);
                console.log('Rol:', response.usuario.rol);
            } else {
                console.log('\n✗ Error en login');
            }
        });
    });

    req.on('error', (error) => {
        console.error('Error:', error);
    });

    req.write(data);
    req.end();
};

// Esperar un momento y luego probar
setTimeout(() => {
    testAdminLogin();
}, 1000);
