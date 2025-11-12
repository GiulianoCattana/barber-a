const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { enviarEmailVerificacion } = require('../services/emailService');

const registro = async (req, res) => {
  const { nombre, email, password, telefono } = req.body;

  try {
    // Verificar si el usuario ya existe
    const usuarioExistente = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ mensaje: 'El email ya está registrado' });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear el usuario SIN verificar (email_verificado = FALSE)
    const nuevoUsuario = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, telefono, rol, email_verificado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nombre, email, telefono, rol',
      [nombre, email, passwordHash, telefono, 'cliente', false]
    );

    const usuario = nuevoUsuario.rows[0];

    // Enviar código de verificación por email
    try {
      await enviarEmailVerificacion(email, nombre);
      console.log(`✅ Código de verificación enviado a ${email}`);
    } catch (emailError) {
      console.error('Error al enviar email:', emailError);
      // Eliminar el usuario si falla el envío del email
      await pool.query('DELETE FROM usuarios WHERE id = $1', [usuario.id]);
      return res.status(500).json({
        mensaje: 'Error al enviar el código de verificación. Por favor intenta nuevamente.'
      });
    }

    // NO devolver token, solo confirmar que debe verificar email
    res.status(201).json({
      mensaje: '¡Registro exitoso! Revisa tu email para verificar tu cuenta.',
      requiresVerification: true,
      email: usuario.email
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al registrar usuario' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar el usuario
    const resultado = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const usuario = resultado.rows[0];

    // Verificar la contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    // Verificar si el email está verificado
    if (!usuario.email_verificado) {
      return res.status(403).json({
        mensaje: 'Por favor verifica tu email antes de iniciar sesión',
        requiresVerification: true,
        email: usuario.email
      });
    }

    // Generar token
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al iniciar sesión' });
  }
};

const actualizarEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const usuarioId = req.usuario.id;

    // Verificar que el nuevo email no esté en uso por otro usuario
    const emailExistente = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1 AND id != $2',
      [email, usuarioId]
    );

    if (emailExistente.rows.length > 0) {
      return res.status(400).json({ mensaje: 'Este email ya está en uso' });
    }

    // Actualizar email
    await pool.query(
      'UPDATE usuarios SET email = $1 WHERE id = $2',
      [email, usuarioId]
    );

    res.json({ mensaje: 'Email actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar email:', error);
    res.status(500).json({ mensaje: 'Error al actualizar email' });
  }
};

const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;
    const usuarioId = req.usuario.id;

    // Obtener el usuario
    const resultado = await pool.query(
      'SELECT password FROM usuarios WHERE id = $1',
      [usuarioId]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const usuario = resultado.rows[0];

    // Verificar contraseña actual
    const passwordValida = await bcrypt.compare(passwordActual, usuario.password);

    if (!passwordValida) {
      return res.status(400).json({ mensaje: 'Contraseña actual incorrecta' });
    }

    // Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordNueva, salt);

    // Actualizar contraseña
    await pool.query(
      'UPDATE usuarios SET password = $1 WHERE id = $2',
      [passwordHash, usuarioId]
    );

    res.json({ mensaje: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ mensaje: 'Error al cambiar contraseña' });
  }
};

// Verificar código de email para activar cuenta
const verificarEmailCodigo = async (req, res) => {
  const { email, codigo } = req.body;

  try {
    // Buscar el usuario
    const resultado = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const usuario = resultado.rows[0];

    // Verificar si ya está verificado
    if (usuario.email_verificado) {
      return res.status(400).json({ mensaje: 'El email ya está verificado' });
    }

    // Verificar el código
    if (!usuario.codigo_verificacion || usuario.codigo_verificacion !== codigo) {
      return res.status(400).json({ mensaje: 'Código incorrecto' });
    }

    // Verificar expiración
    const ahora = new Date();
    const expiracion = new Date(usuario.codigo_expiracion);

    if (ahora > expiracion) {
      return res.status(400).json({ mensaje: 'El código ha expirado. Solicita uno nuevo.' });
    }

    // Marcar el email como verificado y limpiar código
    await pool.query(
      'UPDATE usuarios SET email_verificado = true, codigo_verificacion = NULL, codigo_expiracion = NULL WHERE id = $1',
      [usuario.id]
    );

    // Generar token para login automático
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      mensaje: '¡Email verificado exitosamente! Ya puedes usar tu cuenta.',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error al verificar código:', error);
    res.status(500).json({ mensaje: 'Error al verificar código' });
  }
};

// Reenviar código de verificación
const reenviarCodigoVerificacion = async (req, res) => {
  const { email } = req.body;

  try {
    // Buscar el usuario
    const resultado = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const usuario = resultado.rows[0];

    // Verificar si ya está verificado
    if (usuario.email_verificado) {
      return res.status(400).json({ mensaje: 'El email ya está verificado' });
    }

    // Enviar nuevo código
    await enviarEmailVerificacion(email, usuario.nombre);

    res.json({ mensaje: 'Código enviado nuevamente a tu email' });
  } catch (error) {
    console.error('Error al reenviar código:', error);
    res.status(500).json({ mensaje: 'Error al reenviar código' });
  }
};

module.exports = {
  registro,
  login,
  actualizarEmail,
  cambiarPassword,
  verificarEmailCodigo,
  reenviarCodigoVerificacion
};
