import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TurnosService, Turno } from '../../services/turnos.service';

interface DiaDisponible {
  nombre: string;
  fecha: string;
  dia: number;
}

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css'
})
export class DashboardAdminComponent implements OnInit {
  usuario: any;
  turnos: Turno[] = [];
  turnosFiltrados: Turno[] = [];
  turnosDia: Turno[] = [];
  turnosDiaFiltrados: Turno[] = [];
  filtroEstado: string = 'todos';
  filtroFecha: string = '';
  mensaje: string = '';
  error: string = '';
  diasDisponibles: DiaDisponible[] = [];
  diaSeleccionado: string = '';
  fechaSeleccionada: string = '';

  estadisticas = {
    total: 0,
    pendientes: 0,
    confirmados: 0,
    cancelados: 0
  };

  constructor(
    private authService: AuthService,
    private turnosService: TurnosService,
    private router: Router
  ) {
    this.usuario = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.generarDiasSemana();
    this.cargarTurnos();
  }

  generarDiasSemana(): void {
    const hoy = new Date();
    const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const nombresDiasCortos = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    this.diasDisponibles = [];

    // Generar los próximos 7 días
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      const diaSemana = fecha.getDay();

      const esHoy = i === 0;
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
    }

    // Seleccionar automáticamente el día de hoy
    if (this.diasDisponibles.length > 0) {
      this.seleccionarDia(this.diasDisponibles[0]);
    }
  }

  seleccionarDia(dia: DiaDisponible): void {
    this.diaSeleccionado = dia.nombre;
    this.fechaSeleccionada = dia.fecha;
    this.filtrarTurnosPorDia();
  }

  filtrarTurnosPorDia(): void {
    if (!this.fechaSeleccionada) {
      this.turnosDia = [];
      this.turnosDiaFiltrados = [];
      return;
    }

    this.turnosDia = this.turnos.filter(turno => {
      const fechaTurno = turno.fecha.toString().split('T')[0];
      return fechaTurno === this.fechaSeleccionada;
    }).sort((a, b) => {
      // Ordenar por hora
      const horaA = a.hora.toString();
      const horaB = b.hora.toString();
      return horaA.localeCompare(horaB);
    });

    this.aplicarFiltroDia();
  }

  aplicarFiltroDia(): void {
    if (this.filtroEstado === 'todos') {
      this.turnosDiaFiltrados = [...this.turnosDia];
    } else {
      this.turnosDiaFiltrados = this.turnosDia.filter(t => t.estado === this.filtroEstado);
    }
  }

  cambiarFiltroDia(estado: string): void {
    this.filtroEstado = estado;
    this.aplicarFiltroDia();
  }

  cargarTurnos(): void {
    this.turnosService.obtenerTurnos().subscribe({
      next: (data) => {
        this.turnos = data;
        this.aplicarFiltro();
        this.calcularEstadisticas();
        this.filtrarTurnosPorDia();
      },
      error: (error) => {
        this.error = 'Error al cargar turnos';
        console.error('Error al cargar turnos:', error);
      }
    });
  }

  aplicarFiltro(): void {
    let resultado = [...this.turnos];

    // Filtrar por estado
    if (this.filtroEstado !== 'todos') {
      resultado = resultado.filter(t => t.estado === this.filtroEstado);
    }

    // Filtrar por fecha
    if (this.filtroFecha) {
      resultado = resultado.filter(t => {
        const fechaTurno = new Date(t.fecha).toISOString().split('T')[0];
        return fechaTurno === this.filtroFecha;
      });
    }

    this.turnosFiltrados = resultado;
  }

  cambiarFiltro(estado: string): void {
    this.filtroEstado = estado;
    this.aplicarFiltro();
  }

  cambiarFiltroFecha(): void {
    this.aplicarFiltro();
  }

  limpiarFiltroFecha(): void {
    this.filtroFecha = '';
    this.aplicarFiltro();
  }

  calcularEstadisticas(): void {
    this.estadisticas.total = this.turnos.length;
    this.estadisticas.pendientes = this.turnos.filter(t => t.estado === 'pendiente').length;
    this.estadisticas.confirmados = this.turnos.filter(t => t.estado === 'confirmado').length;
    this.estadisticas.cancelados = this.turnos.filter(t => t.estado === 'cancelado').length;
  }

  confirmarTurno(id: number): void {
    this.actualizarEstado(id, 'confirmado', 'Turno confirmado exitosamente');
  }

  cancelarTurno(id: number): void {
    if (confirm('¿Estás seguro de que deseas cancelar este turno?')) {
      this.actualizarEstado(id, 'cancelado', 'Turno cancelado exitosamente');
    }
  }

  actualizarEstado(id: number, estado: string, mensajeExito: string): void {
    this.error = '';
    this.mensaje = '';

    this.turnosService.actualizarEstadoTurno(id, estado).subscribe({
      next: () => {
        this.mensaje = mensajeExito;
        this.cargarTurnos();
      },
      error: (error) => {
        this.error = 'Error al actualizar el turno';
      }
    });
  }

  irGaleria(): void {
    this.router.navigate(['/galeria']);
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
}
