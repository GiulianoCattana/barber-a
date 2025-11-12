const nodemailer = require('nodemailer');

// Configuración del transportador de email con configuración robusta para Gmail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'tu-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'tu-contraseña-de-aplicacion'
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  },
  connectionTimeout: 10000, // 10 segundos
  greetingTimeout: 10000,
  socketTimeout: 10000,
  debug: true, // Mostrar logs de debug
  logger: true // Mostrar logs en consola
});

// Verificar conexión al iniciar
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Error al conectar con el servidor de email:', error);
  } else {
    console.log('✅ Servidor de email listo para enviar mensajes');
  }
});

// Función para generar código de 6 dígitos
const generarCodigoVerificacion = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Función para enviar código de verificación
const enviarCodigoVerificacion = async (email, codigo) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'tu-email@gmail.com',
    to: email,
    subject: 'Código de Recuperación de Contraseña - Peluquería',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 50px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .code-box {
            background: #f8f9fa;
            border: 2px dashed #667eea;
            border-radius: 10px;
            padding: 20px;
            margin: 30px 0;
          }
          .code {
            font-size: 36px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
          }
          .warning {
            color: #666;
            font-size: 14px;
            margin-top: 20px;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Recuperación de Contraseña</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px; color: #333;">
              Hemos recibido una solicitud para recuperar tu contraseña.
            </p>
            <p style="font-size: 16px; color: #333;">
              Usa el siguiente código de verificación:
            </p>
            <div class="code-box">
              <div class="code">${codigo}</div>
            </div>
            <p class="warning">
              ⏱️ Este código expira en <strong>15 minutos</strong>
            </p>
            <p class="warning">
              Si no solicitaste este código, ignora este mensaje.
            </p>
          </div>
          <div class="footer">
            <p>Sistema de Gestión de Peluquería</p>
            <p>Este es un correo automático, por favor no respondas.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Código enviado a ${email}: ${codigo}`);
    return true;
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw new Error('No se pudo enviar el email');
  }
};

// Función para enviar email de verificación de cuenta
const enviarEmailVerificacion = async (email, nombre) => {
  const pool = require('../config/database');
  const crypto = require('crypto');

  // Generar código de verificación
  const codigo = generarCodigoVerificacion();

  // Guardar código en la base de datos con expiración de 15 minutos
  const expiracion = new Date(Date.now() + 15 * 60 * 1000);

  await pool.query(
    'UPDATE usuarios SET codigo_verificacion = $1, codigo_expiracion = $2 WHERE email = $3',
    [codigo, expiracion, email]
  );

  const mailOptions = {
    from: process.env.EMAIL_USER || 'tu-email@gmail.com',
    to: email,
    subject: '¡Bienvenido! Verifica tu cuenta - Wonder Barber',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 50px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .welcome-text {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
          }
          .code-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            margin: 30px 0;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          }
          .info-text {
            color: #666;
            font-size: 14px;
            margin: 20px 0;
            line-height: 1.6;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .warning p {
            margin: 0;
            color: #856404;
            font-size: 14px;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ ¡Bienvenido a Wonder Barber!</h1>
          </div>
          <div class="content">
            <p class="welcome-text">Hola <strong>${nombre}</strong>,</p>
            <p class="info-text">
              Estamos felices de que te unas a nuestra comunidad. Para completar tu registro
              y comenzar a reservar turnos, por favor verifica tu dirección de email.
            </p>

            <p class="info-text"><strong>Tu código de verificación es:</strong></p>
            <div class="code-box">${codigo}</div>

            <div class="warning">
              <p><strong>⏰ Importante:</strong> Este código expira en 15 minutos.</p>
            </div>

            <p class="info-text">
              Si no solicitaste este registro, puedes ignorar este email.
            </p>
          </div>
          <div class="footer">
            <p>Wonder Barber - Sistema de Reservas</p>
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Código de verificación enviado a ${email}: ${codigo}`);
    return true;
  } catch (error) {
    console.error('Error al enviar email de verificación:', error);
    throw new Error('No se pudo enviar el email de verificación');
  }
};

module.exports = {
  generarCodigoVerificacion,
  enviarCodigoVerificacion,
  enviarEmailVerificacion
};
