const pool = require('../config/database');

// Obtener estado de suscripción del usuario
const obtenerEstadoSuscripcion = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const result = await pool.query(`
      SELECT
        s.*,
        CASE
          WHEN s.fecha_vencimiento > NOW() THEN EXTRACT(DAY FROM (s.fecha_vencimiento - NOW()))::INTEGER
          ELSE 0
        END as dias_restantes,
        CASE
          WHEN s.fecha_vencimiento > NOW() THEN true
          WHEN s.fecha_vencimiento <= NOW() AND s.fecha_vencimiento > (NOW() - INTERVAL '3 days') THEN true
          ELSE false
        END as puede_operar
      FROM suscripciones s
      WHERE s.usuario_id = $1
    `, [usuarioId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontró suscripción' });
    }

    const suscripcion = result.rows[0];

    // Actualizar estado automáticamente según las fechas
    let estadoActual = suscripcion.estado;
    const diasRestantes = suscripcion.dias_restantes;

    if (suscripcion.fecha_vencimiento > new Date()) {
      estadoActual = 'activa';
    } else if (suscripcion.fecha_vencimiento <= new Date()) {
      const diasDesdeVencimiento = Math.floor((new Date() - new Date(suscripcion.fecha_vencimiento)) / (1000 * 60 * 60 * 24));

      if (diasDesdeVencimiento <= 3) {
        estadoActual = 'gracia';
      } else {
        estadoActual = 'bloqueada';
      }
    }

    // Actualizar estado en BD si cambió
    if (estadoActual !== suscripcion.estado) {
      await pool.query(`
        UPDATE suscripciones
        SET estado = $1, updated_at = CURRENT_TIMESTAMP
        WHERE usuario_id = $2
      `, [estadoActual, usuarioId]);
      suscripcion.estado = estadoActual;
    }

    res.json({
      ...suscripcion,
      dias_restantes: diasRestantes,
      puede_operar: suscripcion.puede_operar,
      mensaje: obtenerMensajeEstado(estadoActual, diasRestantes, suscripcion.es_periodo_prueba)
    });

  } catch (error) {
    console.error('Error al obtener estado de suscripción:', error);
    res.status(500).json({ mensaje: 'Error al obtener estado de suscripción' });
  }
};

// Obtener historial de pagos
const obtenerHistorialPagos = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const result = await pool.query(`
      SELECT * FROM pagos_suscripcion
      WHERE usuario_id = $1
      ORDER BY fecha_pago DESC
      LIMIT 50
    `, [usuarioId]);

    res.json(result.rows);

  } catch (error) {
    console.error('Error al obtener historial de pagos:', error);
    res.status(500).json({ mensaje: 'Error al obtener historial de pagos' });
  }
};

// Registrar un pago manual
const registrarPago = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { monto, comprobante_url, mercadopago_id, notas } = req.body;

    // Validar que el monto sea correcto
    if (monto !== 25000) {
      return res.status(400).json({ mensaje: 'El monto debe ser $25,000' });
    }

    // Obtener suscripción actual
    const suscripcionResult = await pool.query(`
      SELECT * FROM suscripciones WHERE usuario_id = $1
    `, [usuarioId]);

    if (suscripcionResult.rows.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontró suscripción' });
    }

    const suscripcion = suscripcionResult.rows[0];

    // Registrar el pago
    await pool.query(`
      INSERT INTO pagos_suscripcion
      (suscripcion_id, usuario_id, monto, comprobante_url, mercadopago_id, estado, notas)
      VALUES ($1, $2, $3, $4, $5, 'completado', $6)
    `, [suscripcion.id, usuarioId, monto, comprobante_url, mercadopago_id, notas]);

    // Extender la suscripción 30 días desde la fecha de vencimiento
    // Si está vencida, desde hoy. Si está activa, desde la fecha de vencimiento
    let nuevaFechaVencimiento;
    if (new Date(suscripcion.fecha_vencimiento) > new Date()) {
      // Todavía está activa, extender desde fecha de vencimiento
      nuevaFechaVencimiento = new Date(suscripcion.fecha_vencimiento);
    } else {
      // Ya venció, extender desde hoy
      nuevaFechaVencimiento = new Date();
    }
    nuevaFechaVencimiento.setDate(nuevaFechaVencimiento.getDate() + 30);

    await pool.query(`
      UPDATE suscripciones
      SET
        fecha_vencimiento = $1,
        estado = 'activa',
        es_periodo_prueba = FALSE,
        updated_at = CURRENT_TIMESTAMP
      WHERE usuario_id = $2
    `, [nuevaFechaVencimiento, usuarioId]);

    res.json({
      mensaje: 'Pago registrado correctamente. Suscripción renovada por 30 días',
      nueva_fecha_vencimiento: nuevaFechaVencimiento
    });

  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({ mensaje: 'Error al registrar pago' });
  }
};

// Confirmar pago manual (sin necesidad de mercadopago_id, solo confirma que pagó)
const confirmarPagoManual = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    // Obtener suscripción actual
    const suscripcionResult = await pool.query(`
      SELECT * FROM suscripciones WHERE usuario_id = $1
    `, [usuarioId]);

    if (suscripcionResult.rows.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontró suscripción' });
    }

    const suscripcion = suscripcionResult.rows[0];

    // Registrar el pago
    await pool.query(`
      INSERT INTO pagos_suscripcion
      (suscripcion_id, usuario_id, monto, estado, notas)
      VALUES ($1, $2, $3, 'completado', 'Pago confirmado manualmente por el administrador')
    `, [suscripcion.id, usuarioId, 25000]);

    // Extender la suscripción 30 días
    let nuevaFechaVencimiento;
    if (new Date(suscripcion.fecha_vencimiento) > new Date()) {
      nuevaFechaVencimiento = new Date(suscripcion.fecha_vencimiento);
    } else {
      nuevaFechaVencimiento = new Date();
    }
    nuevaFechaVencimiento.setDate(nuevaFechaVencimiento.getDate() + 30);

    await pool.query(`
      UPDATE suscripciones
      SET
        fecha_vencimiento = $1,
        estado = 'activa',
        es_periodo_prueba = FALSE,
        updated_at = CURRENT_TIMESTAMP
      WHERE usuario_id = $2
    `, [nuevaFechaVencimiento, usuarioId]);

    res.json({
      mensaje: '¡Suscripción renovada exitosamente! Gracias por tu pago',
      nueva_fecha_vencimiento: nuevaFechaVencimiento,
      dias_agregados: 30
    });

  } catch (error) {
    console.error('Error al confirmar pago:', error);
    res.status(500).json({ mensaje: 'Error al confirmar pago' });
  }
};

// Renovar suscripción (genera link de pago de Mercado Pago)
const generarLinkPago = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    // Obtener configuración de Mercado Pago
    const configResult = await pool.query(`
      SELECT link_mercadopago FROM configuracion_pagos WHERE id = 1
    `);

    if (configResult.rows.length === 0 || !configResult.rows[0].link_mercadopago) {
      return res.status(404).json({
        mensaje: 'No se ha configurado el link de Mercado Pago. Contacta al soporte.'
      });
    }

    res.json({
      link_pago: configResult.rows[0].link_mercadopago,
      monto: 25000,
      mensaje: 'Realiza el pago y luego registra el comprobante en el sistema'
    });

  } catch (error) {
    console.error('Error al generar link de pago:', error);
    res.status(500).json({ mensaje: 'Error al generar link de pago' });
  }
};

// Funciones auxiliares
function obtenerMensajeEstado(estado, diasRestantes, esPrueba) {
  switch (estado) {
    case 'activa':
      if (esPrueba) {
        if (diasRestantes > 7) {
          return `Período de prueba gratis activo. Te quedan ${diasRestantes} días`;
        } else if (diasRestantes > 0) {
          return `⚠️ Tu período de prueba vence en ${diasRestantes} días. Suscríbete para continuar`;
        }
      } else {
        if (diasRestantes > 7) {
          return `Suscripción activa. Próxima renovación en ${diasRestantes} días`;
        } else if (diasRestantes > 0) {
          return `⚠️ Tu suscripción vence en ${diasRestantes} días. Renueva pronto`;
        }
      }
      break;
    case 'gracia':
      return `⚠️ Tu suscripción ha vencido. Tienes ${3 - Math.floor((new Date() - new Date()) / (1000 * 60 * 60 * 24))} días de gracia`;
    case 'bloqueada':
      return '🚫 Suscripción vencida. Renueva para seguir operando';
    default:
      return 'Estado desconocido';
  }
}

module.exports = {
  obtenerEstadoSuscripcion,
  obtenerHistorialPagos,
  registrarPago,
  generarLinkPago,
  confirmarPagoManual
};
