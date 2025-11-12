const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

// Obtener configuración de pagos
const obtenerConfiguracion = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT tipo_pago, link_pago, activo FROM configuracion_pagos ORDER BY id DESC LIMIT 1'
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
    const { tipo_pago, link_pago, link_mercadopago } = req.body;

    // Usar link_mercadopago si viene, si no usar link_pago para retrocompatibilidad
    const linkPago = link_mercadopago || link_pago;

    console.log('Datos recibidos:', { tipo_pago, link_pago: linkPago });

    if (!tipo_pago) {
      return res.status(400).json({ mensaje: 'El tipo de pago es requerido' });
    }

    const result = await pool.query(
      `UPDATE configuracion_pagos
       SET tipo_pago = $1,
           link_pago = $2,
           activo = true
       WHERE id = 1
       RETURNING *`,
      [tipo_pago, linkPago || null]
    );

    if (result.rows.length === 0) {
      // Si no existe, crear uno nuevo
      const insertResult = await pool.query(
        'INSERT INTO configuracion_pagos (tipo_pago, link_pago, activo) VALUES ($1, $2, true) RETURNING *',
        [tipo_pago, linkPago || null]
      );
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
