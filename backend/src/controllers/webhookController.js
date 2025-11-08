const pool = require('../config/database');

// Webhook de Mercado Pago para suscripciones
const webhookMercadoPago = async (req, res) => {
  try {
    console.log('Webhook recibido de Mercado Pago:', req.body);

    const { type, data } = req.body;

    // Mercado Pago envía notificaciones de tipo "payment"
    if (type === 'payment') {
      const paymentId = data.id;

      // Aquí deberías hacer una petición a la API de Mercado Pago para verificar el pago
      // Por ahora, procesamos directamente
      console.log('Payment ID recibido:', paymentId);

      // TODO: Implementar verificación con API de Mercado Pago
      // const paymentInfo = await verificarPagoMercadoPago(paymentId);

      // Por ahora, respondemos 200 para que MP sepa que recibimos el webhook
      res.status(200).send('OK');
    } else {
      // Otros tipos de notificaciones
      console.log('Tipo de notificación no manejado:', type);
      res.status(200).send('OK');
    }

  } catch (error) {
    console.error('Error en webhook de Mercado Pago:', error);
    res.status(500).send('Error');
  }
};

// Procesar pago de suscripción desde webhook
const procesarPagoSuscripcion = async (paymentData) => {
  try {
    // Extraer información del pago
    const { id: mercadopagoId, transaction_amount, status, payer } = paymentData;

    // Validar que el pago esté aprobado
    if (status !== 'approved') {
      console.log('Pago no aprobado, estado:', status);
      return;
    }

    // Validar que el monto sea correcto (25000)
    if (transaction_amount !== 25000) {
      console.log('Monto incorrecto:', transaction_amount);
      return;
    }

    // Buscar usuario por email (asumimos que el payer email es el mismo que el usuario)
    const userResult = await pool.query(`
      SELECT id FROM usuarios WHERE email = $1 AND rol = 'admin'
    `, [payer.email]);

    if (userResult.rows.length === 0) {
      console.log('Usuario no encontrado:', payer.email);
      return;
    }

    const usuarioId = userResult.rows[0].id;

    // Verificar si ya existe este pago registrado
    const pagoExistente = await pool.query(`
      SELECT id FROM pagos_suscripcion WHERE mercadopago_id = $1
    `, [mercadopagoId]);

    if (pagoExistente.rows.length > 0) {
      console.log('Pago ya registrado:', mercadopagoId);
      return;
    }

    // Obtener suscripción del usuario
    const suscripcionResult = await pool.query(`
      SELECT * FROM suscripciones WHERE usuario_id = $1
    `, [usuarioId]);

    if (suscripcionResult.rows.length === 0) {
      console.log('Suscripción no encontrada para usuario:', usuarioId);
      return;
    }

    const suscripcion = suscripcionResult.rows[0];

    // Registrar el pago
    await pool.query(`
      INSERT INTO pagos_suscripcion
      (suscripcion_id, usuario_id, monto, mercadopago_id, estado, notas)
      VALUES ($1, $2, $3, $4, 'completado', 'Pago procesado automáticamente vía webhook de Mercado Pago')
    `, [suscripcion.id, usuarioId, transaction_amount, mercadopagoId]);

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

    console.log('Suscripción renovada exitosamente para usuario:', usuarioId);
    console.log('Nueva fecha de vencimiento:', nuevaFechaVencimiento);

  } catch (error) {
    console.error('Error al procesar pago de suscripción:', error);
    throw error;
  }
};

module.exports = {
  webhookMercadoPago,
  procesarPagoSuscripcion
};
