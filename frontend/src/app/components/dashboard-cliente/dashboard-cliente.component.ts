import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TurnosService, Turno, Horario } from '../../services/turnos.service';
import { ServiciosService, Servicio } from '../../services/servicios.service';

interface DiaDisponible {
  nombre: string;
  fecha: string;
  dia: number;
}

@Component({
  selector: 'app-dashboard-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-cliente.component.html',
  styleUrl: './dashboard-cliente.component.css'
})
export class DashboardClienteComponent implements OnInit {
  usuario: any;
  turnos: Turno[] = [];
  servicios: Servicio[] = [];
  serviciosSeleccionados: Servicio[] = [];
  turnosDisponibles: string[] = [];
  todosLosHorarios: Horario[] = [];
  diasDisponibles: DiaDisponible[] = [];
  diaSeleccionado: string = '';

  nuevoTurno: Turno = {
    fecha: '',
    hora: '',
    servicio_id: undefined,
    notas: ''
  };

  mostrarFormulario: boolean = false;
  mostrarHorarios: boolean = false;
  fechaSeleccionada: string = '';
  fechaMinima: string = '';
  fechaMaxima: string = '';
  mensaje: string = '';
  error: string = '';
  horaSeleccionada: string = '';

  constructor(
    private authService: AuthService,
    private turnosService: TurnosService,
    private serviciosService: ServiciosService,
    private router: Router
  ) {
    this.usuario = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.cargarTurnos();
    this.cargarServicios();
    this.generarDiasSemana();
  }

  cargarServicios(): void {
    this.serviciosService.obtenerServicios().subscribe({
      next: (data) => {
        this.servicios = data;
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
        this.error = 'Error al cargar servicios';
      }
    });
  }

  seleccionarServicio(servicio: Servicio): void {
    // Verificar si ya está seleccionado
    const index = this.serviciosSeleccionados.findIndex(s => s.id === servicio.id);

    if (index > -1) {
      // Si ya está seleccionado, quitarlo
      this.serviciosSeleccionados.splice(index, 1);
    } else {
      // Si no está seleccionado, agregarlo
      this.serviciosSeleccionados.push(servicio);
    }

    // Mostrar formulario si hay al menos un servicio seleccionado
    this.mostrarFormulario = this.serviciosSeleccionados.length > 0;
    this.mostrarHorarios = false;
    this.horaSeleccionada = '';
    this.mensaje = '';
    this.error = '';

    // Limpiar selección de día y horarios si cambió la selección de servicios
    this.diaSeleccionado = '';
    this.fechaSeleccionada = '';
    this.todosLosHorarios = [];
    this.turnosDisponibles = [];
  }

  estaSeleccionado(servicio: Servicio): boolean {
    return this.serviciosSeleccionados.some(s => s.id === servicio.id);
  }

  getDuracionTotal(): number {
    return this.serviciosSeleccionados.reduce((total, s) => total + s.duracion_minutos, 0);
  }

  getPrecioTotal(): number {
    return this.serviciosSeleccionados.reduce((total, s) => total + (parseFloat(s.precio?.toString() || '0')), 0);
  }

  getNombresServicios(): string {
    return this.serviciosSeleccionados.map(s => s.nombre).join(' + ');
  }

  generarDiasSemana(): void {
    const hoy = new Date();
    const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const nombresDiasCortos = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    this.diasDisponibles = [];

    // Generar los próximos días disponibles, excluyendo domingos y lunes
    let diasAgregados = 0;
    let offset = 0;

    while (diasAgregados < 5) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + offset);
      const diaSemana = fecha.getDay();

      // Solo agregar si no es domingo (0) ni lunes (1)
      if (diaSemana !== 0 && diaSemana !== 1) {
        // Para el día de hoy, verificar si aún hay horarios disponibles
        // (el backend se encarga de filtrar los horarios pasados)
        const esHoy = offset === 0;
        const horaActual = hoy.getHours();

        // Incluir el día de hoy solo si no son más de las 22:00 (último turno)
        if (!esHoy || horaActual < 22) {
          const nombreDia = esHoy ? 'Hoy' : nombresDiasCortos[diaSemana];
          // Formatear la fecha correctamente sin conversión a UTC
          const year = fecha.getFullYear();
          const month = String(fecha.getMonth() + 1).padStart(2, '0');
          const day = String(fecha.getDate()).padStart(2, '0');
          const fechaFormateada = `${year}-${month}-${day}`;

          this.diasDisponibles.push({
            nombre: nombreDia,
            fecha: fechaFormateada,
            dia: diaSemana
          });
          diasAgregados++;
        }
      }
      offset++;
    }

    // NO seleccionar automáticamente el primer día
    // El usuario debe elegir servicio primero
  }

  seleccionarDia(dia: DiaDisponible): void {
    this.diaSeleccionado = dia.nombre;
    this.fechaSeleccionada = dia.fecha;
    this.nuevoTurno.fecha = dia.fecha;

    // Solo buscar horarios si ya hay servicios seleccionados
    if (this.serviciosSeleccionados.length > 0) {
      this.buscarTurnosDisponibles();
    }
  }

  cargarTurnos(): void {
    this.turnosService.obtenerTurnos().subscribe({
      next: (data) => {
        this.turnos = data;
      },
      error: (error) => {
        console.error('Error al cargar turnos:', error);
      }
    });
  }

  buscarTurnosDisponibles(): void {
    this.error = '';
    this.mensaje = '';
    this.mostrarHorarios = false;
    this.horaSeleccionada = '';

    if (!this.fechaSeleccionada) {
      this.error = 'Por favor selecciona una fecha';
      return;
    }

    if (this.serviciosSeleccionados.length === 0) {
      this.error = 'Por favor selecciona al menos un servicio';
      return;
    }

    // Calcular duración total
    const duracionTotal = this.getDuracionTotal();

    // Enviar la duración total al backend
    this.turnosService.obtenerTurnosDisponibles(this.fechaSeleccionada, this.serviciosSeleccionados[0].id, duracionTotal).subscribe({
      next: (data) => {
        console.log('Respuesta del servidor:', data);
        if (data && data.horarios && Array.isArray(data.horarios)) {
          this.todosLosHorarios = data.horarios;
          this.turnosDisponibles = data.horarios
            .filter((h: Horario) => h.disponible)
            .map((h: Horario) => h.hora);
          this.mostrarHorarios = true;
          this.nuevoTurno.fecha = this.fechaSeleccionada;

          if (this.todosLosHorarios.length === 0) {
            // No hay horarios porque ya pasó el horario de cierre
            this.mensaje = 'No hay horarios disponibles para hoy. Todos los horarios ya pasaron.';
            this.mostrarHorarios = false;
          } else if (this.turnosDisponibles.length === 0) {
            // Hay horarios pero todos están ocupados
            this.mensaje = `Todos los horarios están ocupados para ${this.getNombresServicios()} (${this.getDuracionTotal()} min) en esta fecha`;
          }
        } else {
          console.error('Formato de respuesta incorrecto:', data);
          this.error = 'Error: formato de respuesta incorrecto del servidor';
          this.todosLosHorarios = [];
          this.turnosDisponibles = [];
        }
      },
      error: (error) => {
        console.error('Error completo:', error);
        this.error = `Error al cargar horarios: ${error.error?.mensaje || error.message || 'Error desconocido'}`;
        this.todosLosHorarios = [];
        this.turnosDisponibles = [];
        this.mostrarHorarios = false;
      }
    });
  }

  seleccionarHorario(hora: string, disponible: boolean): void {
    if (disponible) {
      this.horaSeleccionada = hora;
      this.nuevoTurno.hora = hora;
    }
  }

  isHorarioSeleccionado(hora: string): boolean {
    return this.horaSeleccionada === hora;
  }

  reservarTurno(): void {
    this.error = '';
    this.mensaje = '';

    // Asignar el primer servicio ID y la duración total
    this.nuevoTurno.servicio_id = this.serviciosSeleccionados[0].id;
    this.nuevoTurno.servicio = this.getNombresServicios(); // Nombre combinado para mostrar
    this.nuevoTurno.duracion_total = this.getDuracionTotal(); // Duración total de todos los servicios

    this.turnosService.crearTurno(this.nuevoTurno).subscribe({
      next: (response) => {
        this.mensaje = 'Turno reservado exitosamente';
        this.cargarTurnos();

        // Guardar el día seleccionado actual
        const diaActual = this.diasDisponibles.find(d => d.nombre === this.diaSeleccionado);

        // Limpiar el formulario y la selección de hora
        this.horaSeleccionada = '';
        this.nuevoTurno = {
          fecha: this.fechaSeleccionada,
          hora: '',
          servicio_id: this.serviciosSeleccionados[0]?.id,
          notas: ''
        };

        // Volver a buscar horarios disponibles para el mismo día
        if (diaActual && this.serviciosSeleccionados.length > 0) {
          this.buscarTurnosDisponibles();
        }
      },
      error: (error) => {
        this.error = error.error?.mensaje || 'Error al reservar turno';
      }
    });
  }

  cancelarTurno(id: number): void {
    if (confirm('¿Estás seguro de que deseas cancelar este turno?')) {
      this.turnosService.cancelarTurno(id).subscribe({
        next: () => {
          this.mensaje = 'Turno cancelado exitosamente';
          this.cargarTurnos();
        },
        error: (error) => {
          this.error = 'Error al cancelar turno';
        }
      });
    }
  }

  resetFormulario(): void {
    this.nuevoTurno = {
      fecha: '',
      hora: '',
      servicio_id: undefined,
      notas: ''
    };
    this.fechaSeleccionada = '';
    this.serviciosSeleccionados = [];
    this.turnosDisponibles = [];
    this.todosLosHorarios = [];
    this.horaSeleccionada = '';
    this.mostrarFormulario = false;
    this.mostrarHorarios = false;
    this.diaSeleccionado = '';
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getEstadoClass(estado: string): string {
    switch(estado) {
      case 'confirmado': return 'estado-confirmado';
      case 'pendiente': return 'estado-pendiente';
      case 'cancelado': return 'estado-cancelado';
      case 'completado': return 'estado-completado';
      default: return '';
    }
  }

  isMondayOrSunday(dateString: string): boolean {
    if (!dateString) return false;
    // Parsear correctamente en zona horaria local
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 1; // 0 = Domingo, 1 = Lunes
  }
}
