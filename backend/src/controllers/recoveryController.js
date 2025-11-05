const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const { generarCodigoVerificacion, enviarCodigoVerificacion } = require('../services/emailService');

// Enviar código de verificación por email
const enviarCodigoEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query(
      'SELECT id, email, email_contacto FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Email no encontrado' });
    }

    const usuario = result.rows[0];

    // Usar email_contacto si existe, sino usar el email principal
    const emailDestino = usuario.email_contacto || usuario.email;

    // Generar código de 6 dígitos
    const codigo = generarCodigoVerificacion();

    // Calcular tiempo de expiración (15 minutos)
    const expiracion = new Date(Date.now() + 15 * 60 * 1000);

    // Guardar código en base de datos
    await pool.query(
      'UPDATE usuarios SET codigo_verificacion = $1, codigo_expiracion = $2 WHERE id = $3',
      [codigo, expiracion, usuario.id]
    );

    // Enviar código al email de contacto
    await enviarCodigoVerificacion(emailDestino, codigo);

    res.json({
      mensaje: 'Código enviado a tu email',
      email: usuario.email
    });
  } catch (error) {
    console.error('Error al enviar código:', error);
    res.status(500).json({ mensaje: 'Error al enviar código de verificación' });
  }
};

// Verificar código de email
const verificarCodigoEmail = async (req, res) => {
  try {
    const { email, codigo } = req.body;

    const result = await pool.query(
      'SELECT id, codigo_verificacion, codigo_expiracion FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const usuario = result.rows[0];

    // Verificar si el código existe
    if (!usuario.codigo_verificacion) {
      return res.status(400).json({ mensaje: 'No hay código de verificación activo' });
    }

    // Verificar si el código expiró
    const ahora = new Date();
    const expiracion = new Date(usuario.codigo_expiracion);

    if (ahora > expiracion) {
      return res.status(400).json({ mensaje: 'El código ha expirado. Solicita uno nuevo.' });
    }

    // Verificar si el código es correcto
    if (usuario.codigo_verificacion === codigo) {
      res.json({ valido: true, mensaje: 'Código verificado correctamente' });
    } else {
      res.status(400).json({ valido: false, mensaje: 'Código incorrecto' });
    }
  } catch (error) {
    console.error('Error al verificar código:', error);
    res.status(500).json({ mensaje: 'Error al verificar código' });
  }
};

// Verificar si el email existe y obtener pregunta de seguridad (LEGACY - ya no se usa)
const verificarEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query(
      'SELECT id, email, pregunta_seguridad FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Email no encontrado' });
    }

    const usuario = result.rows[0];

    res.json({
      email: usuario.email,
      preguntaSeguridad: usuario.pregunta_seguridad,
      tienePregunta: !!usuario.pregunta_seguridad
    });
  } catch (error) {
    console.error('Error al verificar email:', error);
    res.status(500).json({ mensaje: 'Error al verificar email' });
  }
};

// Verificar respuesta de seguridad
const verificarRespuestaSeguridad = async (req, res) => {
  try {
    const { email, respuesta } = req.body;

    const result = await pool.query(
      'SELECT id, respuesta_seguridad FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const usuario = result.rows[0];

    // Comparar respuestas (case-insensitive y sin espacios extra)
    const respuestaGuardada = usuario.respuesta_seguridad?.trim().toLowerCase();
    const respuestaIngresada = respuesta?.trim().toLowerCase();

    if (respuestaGuardada === respuestaIngresada) {
      res.json({ valida: true, mensaje: 'Respuesta correcta' });
    } else {
      res.status(400).json({ valida: false, mensaje: 'Respuesta incorrecta' });
    }
  } catch (error) {
    console.error('Error al verificar respuesta:', error);
    res.status(500).json({ mensaje: 'Error al verificar respuesta' });
  }
};

// Verificar código de recuperación
const verificarCodigoRecuperacion = async (req, res) => {
  try {
    const { email, codigo } = req.body;

    const result = await pool.query(
      'SELECT id, codigo_recuperacion FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const usuario = result.rows[0];

    if (usuario.codigo_recuperacion === codigo.toUpperCase()) {
      res.json({ valido: true, mensaje: 'Código correcto' });
    } else {
      res.status(400).json({ valido: false, mensaje: 'Código incorrecto' });
    }
  } catch (error) {
    console.error('Error al verificar código:', error);
    res.status(500).json({ mensaje: 'Error al verificar código' });
  }
};

// Resetear contraseña (nuevo flujo con código de email)
const resetearPassword = async (req, res) => {
  try {
    const { email, nuevaPassword, codigo } = req.body;

    // Verificar el código de verificación
    const result = await pool.query(
      'SELECT id, codigo_verificacion, codigo_expiracion FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const usuario = result.rows[0];

    // Verificar si el código existe
    if (!usuario.codigo_verificacion) {
      return res.status(400).json({ mensaje: 'No hay código de verificación activo' });
    }

    // Verificar si el código expiró
    const ahora = new Date();
    const expiracion = new Date(usuario.codigo_expiracion);

    if (ahora > expiracion) {
      return res.status(400).json({ mensaje: 'El código ha expirado. Solicita uno nuevo.' });
    }

    // Verificar si el código es correcto
    if (usuario.codigo_verificacion !== codigo) {
      return res.status(400).json({ mensaje: 'Código incorrecto' });
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(nuevaPassword, salt);

    // Actualizar contraseña y limpiar código de verificación
    await pool.query(
      'UPDATE usuarios SET password = $1, codigo_verificacion = NULL, codigo_expiracion = NULL WHERE id = $2',
      [passwordHash, usuario.id]
    );

    res.json({ mensaje: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error al resetear contraseña:', error);
    res.status(500).json({ mensaje: 'Error al resetear contraseña' });
  }
};

// Configurar pregunta de seguridad
const configurarPreguntaSeguridad = async (req, res) => {
  try {
    const { pregunta, respuesta } = req.body;
    const usuarioId = req.usuario.id;

    if (!pregunta || !respuesta) {
      return res.status(400).json({ mensaje: 'Pregunta y respuesta son requeridas' });
    }

    await pool.query(
      'UPDATE usuarios SET pregunta_seguridad = $1, respuesta_seguridad = $2 WHERE id = $3',
      [pregunta, respuesta.trim().toLowerCase(), usuarioId]
    );

    res.json({ mensaje: 'Pregunta de seguridad configurada exitosamente' });
  } catch (error) {
    console.error('Error al configurar pregunta:', error);
    res.status(500).json({ mensaje: 'Error al configurar pregunta' });
  }
};

// Obtener código de recuperación (solo para el usuario autenticado)
const obtenerCodigoRecuperacion = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const result = await pool.query(
      'SELECT codigo_recuperacion FROM usuarios WHERE id = $1',
      [usuarioId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json({ codigoRecuperacion: result.rows[0].codigo_recuperacion });
  } catch (error) {
    console.error('Error al obtener código:', error);
    res.status(500).json({ mensaje: 'Error al obtener código' });
  }
};

module.exports = {
  enviarCodigoEmail,
  verificarCodigoEmail,
  resetearPassword,
  verificarEmail,
  verificarRespuestaSeguridad,
  verificarCodigoRecuperacion,
  configurarPreguntaSeguridad,
  obtenerCodigoRecuperacion
};
