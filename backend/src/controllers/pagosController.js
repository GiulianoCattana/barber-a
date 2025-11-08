const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

// Obtener configuración de pagos
const obtenerConfiguracion = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT alias_transferencia, mensaje_transferencia, tipo_pago, imagen_qr, link_mercadopago FROM configuracion_pagos ORDER BY id DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Configuración no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ mensaje: 'Error al obtener configuración de pagos' });
  }
};

// Actualizar configuración de pagos (solo admin)
const actualizarConfiguracion = async (req, res) => {
  try {
    const { alias_transferencia, mensaje_transferencia, tipo_pago, link_mercadopago } = req.body;
    const adminId = req.usuario.id;

    console.log('Datos recibidos:', { alias_transferencia, mensaje_transferencia, tipo_pago, link_mercadopago });

    // Validar según el tipo de pago
    if (tipo_pago === 'alias' && !alias_transferencia) {
      return res.status(400).json({ mensaje: 'El alias es requerido cuando el tipo de pago es alias' });
    }

    if (tipo_pago === 'qr' && !req.file) {
      // Verificar si ya existe una imagen QR
      const existente = await pool.query('SELECT imagen_qr FROM configuracion_pagos WHERE id = 1');
      if (!existente.rows[0]?.imagen_qr) {
        return res.status(400).json({ mensaje: 'Debes subir una imagen QR cuando el tipo de pago es QR' });
      }
    }

    // Obtener configuración actual para eliminar imagen anterior si es necesario
    const configActual = await pool.query('SELECT imagen_qr FROM configuracion_pagos WHERE id = 1');
    const imagenAnterior = configActual.rows[0]?.imagen_qr;

    // Preparar la ruta de la nueva imagen si se subió una
    let imagenQR = imagenAnterior;
    if (req.file) {
      imagenQR = '/uploads/' + req.file.filename;

      // Eliminar imagen anterior si existe y es diferente
      if (imagenAnterior && imagenAnterior !== imagenQR) {
        const rutaAnterior = path.join(__dirname, '../../', imagenAnterior);
        if (fs.existsSync(rutaAnterior)) {
          fs.unlinkSync(rutaAnterior);
        }
      }
    }

    // Permitir valores vacíos. Si no se envía nada (undefined/null), usar mensaje por defecto
    let mensajeFinal = mensaje_transferencia;
    if (mensaje_transferencia === undefined || mensaje_transferencia === null) {
      mensajeFinal = 'Por favor, realiza la transferencia y envía el comprobante';
    }

    // Permitir alias vacío (convertir string vacío a null para la BD)
    const aliasFinal = alias_transferencia && alias_transferencia.trim() !== '' ? alias_transferencia : null;

    // Permitir link vacío
    const linkFinal = link_mercadopago && link_mercadopago.trim() !== '' ? link_mercadopago : null;

    console.log('Mensaje final a guardar:', mensajeFinal);
    console.log('Alias final a guardar:', aliasFinal);
    console.log('Link final a guardar:', linkFinal);

    const result = await pool.query(
      `UPDATE configuracion_pagos
       SET alias_transferencia = $1,
           mensaje_transferencia = $2,
           tipo_pago = $3,
           imagen_qr = $4,
           link_mercadopago = $5,
           actualizado_por = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 1
       RETURNING *`,
      [
        aliasFinal,
        mensajeFinal,
        tipo_pago,
        imagenQR,
        linkFinal,
        adminId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Configuración no encontrada' });
    }

    res.json({
      mensaje: 'Configuración actualizada correctamente',
      configuracion: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({ mensaje: 'Error al actualizar configuración de pagos' });
  }
};

module.exports = {
  obtenerConfiguracion,
  actualizarConfiguracion
};
