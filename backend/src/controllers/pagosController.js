const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

// Obtener configuración de pagos
const obtenerConfiguracion = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT tipo_pago, link_mercadopago, alias_transferencia, mensaje_transferencia, imagen_qr, activo FROM configuracion_pagos ORDER BY id DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Configuración no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ mensaje: 'Error al obtener configuración de pagos: ' + error.message });
  }
};

// Actualizar configuración de pagos (solo admin)
const actualizarConfiguracion = async (req, res) => {
  try {
    const { tipo_pago, link_mercadopago, alias_transferencia, mensaje_transferencia } = req.body;
    const imagenQR = req.file ? `/uploads/${req.file.filename}` : null;

    console.log('Datos recibidos:', {
      tipo_pago,
      link_mercadopago,
      alias_transferencia,
      mensaje_transferencia,
      imagenQR
    });

    if (!tipo_pago) {
      return res.status(400).json({ mensaje: 'El tipo de pago es requerido' });
    }

    // Construir la query dinámicamente para incluir imagen solo si se subió
    let updateQuery = `
      UPDATE configuracion_pagos
      SET tipo_pago = $1,
          link_mercadopago = $2,
          alias_transferencia = $3,
          mensaje_transferencia = $4,
          activo = true
    `;

    let params = [
      tipo_pago,
      link_mercadopago || null,
      alias_transferencia || null,
      mensaje_transferencia || null
    ];

    // Si se subió una imagen, agregarla al update
    if (imagenQR) {
      updateQuery += `, imagen_qr = $5`;
      params.push(imagenQR);
    }

    updateQuery += ` WHERE id = 1 RETURNING *`;

    const result = await pool.query(updateQuery, params);

    if (result.rows.length === 0) {
      // Si no existe, crear uno nuevo
      const insertQuery = imagenQR
        ? 'INSERT INTO configuracion_pagos (tipo_pago, link_mercadopago, alias_transferencia, mensaje_transferencia, imagen_qr, activo) VALUES ($1, $2, $3, $4, $5, true) RETURNING *'
        : 'INSERT INTO configuracion_pagos (tipo_pago, link_mercadopago, alias_transferencia, mensaje_transferencia, activo) VALUES ($1, $2, $3, $4, true) RETURNING *';

      const insertResult = await pool.query(insertQuery, params);
      return res.json({
        mensaje: 'Configuración creada correctamente',
        configuracion: insertResult.rows[0]
      });
    }

    res.json({
      mensaje: 'Configuración actualizada correctamente',
      configuracion: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({ mensaje: 'Error al actualizar configuración de pagos: ' + error.message });
  }
};

module.exports = {
  obtenerConfiguracion,
  actualizarConfiguracion
};
