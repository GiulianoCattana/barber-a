const pool = require('../config/database');

// Función auxiliar para sumar minutos a una hora
const sumarMinutos = (hora, minutos) => {
  const [h, m] = hora.split(':').map(Number);
  const totalMinutos = h * 60 + m + minutos;
  const nuevaHora = Math.floor(totalMinutos / 60);
  const nuevosMinutos = totalMinutos % 60;
  return `${String(nuevaHora).padStart(2, '0')}:${String(nuevosMinutos).padStart(2, '0')}`;
};

// Función auxiliar para obtener todos los slots que ocuparía un turno
const obtenerSlotsOcupados = (horaInicio, duracionMinutos) => {
  const slots = [];
  let horaActual = horaInicio;
  let minutosRestantes = duracionMinutos;

  while (minutosRestantes > 0) {
    slots.push(horaActual);
    horaActual = sumarMinutos(horaActual, 30);
    minutosRestantes -= 30;
  }

  return slots;
};

// Función para marcar turnos pasados como completados
const marcarTurnosPasadosComoCompletados = async () => {
  try {
    const hoy = new Date();
    const fechaHoy = hoy.toISOString().split('T')[0];
    const horaActual = `${String(hoy.getHours()).padStart(2, '0')}:${String(hoy.getMinutes()).padStart(2, '0')}`;

    // Marcar como completados los turnos confirmados que ya pasaron
    await pool.query(`
      UPDATE turnos
      SET estado = 'completado'
      WHERE estado = 'confirmado'
        AND (
          fecha < $1
          OR (fecha = $1 AND hora < $2)
        )
    `, [fechaHoy, horaActual]);
  } catch (error) {
    console.error('Error al marcar turnos como completados:', error);
  }
};

// Obtener todos los turnos (para admin) o turnos del cliente
const obtenerTurnos = async (req, res) => {
  try {
    // Marcar turnos pasados como completados antes de obtener la lista
    await marcarTurnosPasadosComoCompletados();

    let query;
    let params = [];

    if (req.usuario.rol === 'admin') {
      // Admin ve todos los turnos con información del cliente y servicio
      query = `
        SELECT t.*,
               u.nombre as cliente_nombre,
               u.email as cliente_email,
               u.telefono as cliente_telefono,
               s.nombre as servicio_nombre,
               s.duracion_minutos
        FROM turnos t
        LEFT JOIN usuarios u ON t.cliente_id = u.id
        LEFT JOIN servicios s ON t.servicio_id = s.id
        WHERE t.estado != 'completado'
        ORDER BY t.fecha ASC, t.hora ASC
      `;
    } else {
      // Cliente solo ve sus propios turnos activos (no completados)
      query = `
        SELECT t.*,
               s.nombre as servicio_nombre,
               s.duracion_minutos
        FROM turnos t
        LEFT JOIN servicios s ON t.servicio_id = s.id
        WHERE t.cliente_id = $1 AND t.estado != 'completado'
        ORDER BY t.fecha ASC, t.hora ASC
      `;
      params = [req.usuario.id];
    }

    const resultado = await pool.query(query, params);
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener turnos' });
  }
};

// Obtener turnos disponibles de un día específico considerando duraciones
const obtenerTurnosDisponibles = async (req, res) => {
  const { fecha, servicio_id, duracion_total } = req.query;

  try {
    console.log('Buscando turnos para fecha:', fecha, 'servicio_id:', servicio_id, 'duracion_total:', duracion_total);

    // Obtener información del servicio o usar duración total
    let duracionRequerida = 30; // Por defecto 30 minutos

    if (duracion_total) {
      // Si viene duracion_total, usarla (para servicios combinados)
      duracionRequerida = parseInt(duracion_total);
    } else if (servicio_id) {
      // Si solo viene servicio_id, buscar su duración
      const servicioResult = await pool.query(
        'SELECT duracion_minutos FROM servicios WHERE id = $1',
        [servicio_id]
      );
      if (servicioResult.rows.length > 0) {
        duracionRequerida = servicioResult.rows[0].duracion_minutos;
      }
    }

    console.log('Duración requerida:', duracionRequerida, 'minutos');

    // Horarios disponibles (de 9:00 a 22:00, cada 30 minutos)
    let horariosDisponibles = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
      '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
      '21:00', '21:30', '22:00'
    ];

    // Si es el día de hoy, filtrar horarios que ya pasaron
    const [year, month, day] = fecha.split('-').map(Number);
    const fechaSeleccionada = new Date(year, month - 1, day);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada.getTime() === hoy.getTime()) {
      const ahora = new Date();
      const horaActual = ahora.getHours();
      const minutosActuales = ahora.getMinutes();

      horariosDisponibles = horariosDisponibles.filter(hora => {
        const [horas, minutos] = hora.split(':').map(Number);
        return horas > horaActual || (horas === horaActual && minutos > minutosActuales);
      });
    }

    // Obtener todos los turnos reservados para esa fecha con sus duraciones
    const turnosReservados = await pool.query(
      `SELECT t.hora, t.duracion_minutos
       FROM turnos t
       WHERE t.fecha = $1 AND t.estado != $2`,
      [fecha, 'cancelado']
    );

    console.log('Turnos reservados encontrados:', turnosReservados.rows.length);

    // Crear un Set con todos los slots ocupados
    const slotsOcupados = new Set();
    turnosReservados.rows.forEach(turno => {
      const horaStr = turno.hora.toString().substring(0, 5);
      const duracion = turno.duracion_minutos || 30;
      const slots = obtenerSlotsOcupados(horaStr, duracion);
      slots.forEach(slot => slotsOcupados.add(slot));
    });

    console.log('Slots ocupados:', Array.from(slotsOcupados));

    // Filtrar horarios donde cabe el servicio completo
    const horarios = horariosDisponibles.map(hora => {
      // Verificar si hay espacio suficiente para este servicio
      const slotsNecesarios = obtenerSlotsOcupados(hora, duracionRequerida);

      // Verificar que todos los slots necesarios estén disponibles
      const todosDisponibles = slotsNecesarios.every(slot => {
        // El slot debe estar dentro del horario de trabajo (hasta 22:30)
        const [h, m] = slot.split(':').map(Number);
        const minutosDelDia = h * 60 + m;
        const finDia = 22 * 60 + 30; // 22:30

        return minutosDelDia <= finDia && !slotsOcupados.has(slot);
      });

      return {
        hora: hora,
        disponible: todosDisponibles
      };
    });

    console.log('Enviando', horarios.length, 'horarios');
    res.json({ horarios });
  } catch (error) {
    console.error('Error en obtenerTurnosDisponibles:', error);
    res.status(500).json({ mensaje: 'Error al obtener turnos disponibles', error: error.message });
  }
};

// Crear un nuevo turno con bloqueo de múltiples slots
const crearTurno = async (req, res) => {
  const { fecha, hora, servicio_id, servicio, duracion_total, notas } = req.body;
  const clienteId = req.usuario.id;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Determinar la duración: usar duracion_total si viene (servicios combinados), sino buscar el servicio
    let duracionMinutos;
    let nombreServicio;

    if (duracion_total) {
      // Servicios combinados
      duracionMinutos = parseInt(duracion_total);
      nombreServicio = servicio || 'Servicios combinados';
    } else {
      // Un solo servicio
      const servicioResult = await client.query(
        'SELECT nombre, duracion_minutos FROM servicios WHERE id = $1',
        [servicio_id]
      );

      if (servicioResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ mensaje: 'Servicio no válido' });
      }

      const servicioData = servicioResult.rows[0];
      duracionMinutos = servicioData.duracion_minutos;
      nombreServicio = servicio || servicioData.nombre;
    }

    console.log('Creando turno:', { fecha, hora, servicio: nombreServicio, duracion: duracionMinutos });

    // Validar la fecha del turno
    const [year, month, day] = fecha.split('-').map(Number);
    const fechaTurno = new Date(year, month - 1, day);
    const ahora = new Date();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const diaSemana = fechaTurno.getDay();

    // Verificar que la fecha no sea en el pasado
    if (fechaTurno < hoy) {
      await client.query('ROLLBACK');
      return res.status(400).json({ mensaje: 'No se pueden reservar turnos en fechas pasadas' });
    }

    // Si es el día de hoy, verificar que la hora no haya pasado
    if (fechaTurno.getTime() === hoy.getTime()) {
      const [horasTurno, minutosTurno] = hora.split(':').map(Number);
      const horaActual = ahora.getHours();
      const minutosActuales = ahora.getMinutes();

      if (horasTurno < horaActual || (horasTurno === horaActual && minutosTurno <= minutosActuales)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ mensaje: 'No se pueden reservar turnos en horarios que ya pasaron' });
      }
    }

    // Verificar que no sea domingo o lunes
    if (diaSemana === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ mensaje: 'No se pueden reservar turnos los domingos' });
    }

    if (diaSemana === 1) {
      await client.query('ROLLBACK');
      return res.status(400).json({ mensaje: 'No se pueden reservar turnos los lunes (día de descanso)' });
    }

    // Obtener todos los slots que necesita este turno
    const slotsNecesarios = obtenerSlotsOcupados(hora, duracionMinutos);
    console.log('Slots necesarios:', slotsNecesarios);

    // Verificar que TODOS los slots necesarios estén libres
    for (const slot of slotsNecesarios) {
      const turnoExistente = await client.query(
        `SELECT t.id, t.hora, t.duracion_minutos
         FROM turnos t
         WHERE t.fecha = $1 AND t.estado != $2`,
        [fecha, 'cancelado']
      );

      // Verificar si algún turno existente ocupa este slot
      for (const turno of turnoExistente.rows) {
        const horaExistente = turno.hora.toString().substring(0, 5);
        const duracionExistente = turno.duracion_minutos || 30;
        const slotsExistentes = obtenerSlotsOcupados(horaExistente, duracionExistente);

        if (slotsExistentes.includes(slot)) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            mensaje: `El horario ${hora} no está disponible para un servicio de ${duracionMinutos} minutos. Algunos slots ya están ocupados.`
          });
        }
      }
    }

    // Crear el turno principal
    const nuevoTurno = await client.query(
      `INSERT INTO turnos (cliente_id, fecha, hora, servicio, servicio_id, duracion_minutos, notas, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [clienteId, fecha, hora, nombreServicio, servicio_id, duracionMinutos, notas, 'pendiente']
    );

    await client.query('COMMIT');

    res.status(201).json({
      mensaje: 'Turno creado exitosamente',
      turno: nuevoTurno.rows[0],
      slots_bloqueados: slotsNecesarios
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear turno:', error);
    res.status(500).json({ mensaje: 'Error al crear turno', error: error.message });
  } finally {
    client.release();
  }
};

// Actualizar estado del turno (solo admin)
const actualizarEstadoTurno = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!['pendiente', 'confirmado', 'cancelado', 'completado'].includes(estado)) {
    return res.status(400).json({ mensaje: 'Estado inválido' });
  }

  try {
    const turnoActualizado = await pool.query(
      'UPDATE turnos SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );

    if (turnoActualizado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Turno no encontrado' });
    }

    res.json({
      mensaje: 'Estado del turno actualizado',
      turno: turnoActualizado.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar turno' });
  }
};

// Cancelar turno (cliente puede cancelar sus propios turnos)
const cancelarTurno = async (req, res) => {
  const { id } = req.params;

  try {
    let query;
    let params;

    if (req.usuario.rol === 'admin') {
      query = 'UPDATE turnos SET estado = $1 WHERE id = $2 RETURNING *';
      params = ['cancelado', id];
    } else {
      query = 'UPDATE turnos SET estado = $1 WHERE id = $2 AND cliente_id = $3 RETURNING *';
      params = ['cancelado', id, req.usuario.id];
    }

    const resultado = await pool.query(query, params);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Turno no encontrado o no tienes permiso' });
    }

    res.json({
      mensaje: 'Turno cancelado exitosamente',
      turno: resultado.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al cancelar turno' });
  }
};

module.exports = {
  obtenerTurnos,
  obtenerTurnosDisponibles,
  crearTurno,
  actualizarEstadoTurno,
  cancelarTurno
};
