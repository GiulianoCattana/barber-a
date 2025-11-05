import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TurnosService, Turno } from '../../services/turnos.service';
import { BloqueadosService, HorarioBloqueado } from '../../services/bloqueados.service';
import { ServiciosManagerComponent } from '../../admin/servicios-manager/servicios-manager.component';
import { PerfilAdminComponent } from '../../admin/perfil-admin/perfil-admin.component';
import { ThemeService } from '../../services/theme.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

interface DiaDisponible {
  nombre: string;
  fecha: string;
  dia: number;
}

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ServiciosManagerComponent, PerfilAdminComponent],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css',
  encapsulation: ViewEncapsulation.None
})
export class DashboardAdminComponent implements OnInit, OnDestroy {
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
  vistaActual: string = 'turnos'; // 'turnos', 'servicios', 'clientes' o 'perfil'
  horariosBloqueados: HorarioBloqueado[] = [];
  horariosBloqueadosSet: Set<string> = new Set();

  // Variables para búsqueda de clientes
  busquedaCliente: string = '';
  clienteBuscado: any = null;
  historialCliente: Turno[] = [];
  filtroHistorial: string = 'todos';
  busquedaRealizada: boolean = false;
  clientesSugeridos: any[] = [];
  mostrarSugerencias: boolean = false;
  buscando: boolean = false;
  private searchSubject = new Subject<string>();

  estadisticas = {
    total: 0,
    pendientes: 0,
    confirmados: 0,
    cancelados: 0
  };

  constructor(
    private authService: AuthService,
    private turnosService: TurnosService,
    private bloqueadosService: BloqueadosService,
    private router: Router,
    public themeService: ThemeService
  ) {
    this.usuario = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.generarDiasSemana();
    this.cargarTurnos();
    this.configurarBusquedaTiempoReal();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  configurarBusquedaTiempoReal(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query: string) => {
        if (query.trim().length < 2) {
          this.clientesSugeridos = [];
          this.mostrarSugerencias = false;
          this.buscando = false;
          return [];
        }
        this.buscando = true;
        return this.turnosService.buscarClientes(query);
      })
    ).subscribe({
      next: (result: any) => {
        this.clientesSugeridos = result.clientes || [];
        this.mostrarSugerencias = this.clientesSugeridos.length > 0;
        this.buscando = false;
      },
      error: (err) => {
        console.error('Error en búsqueda:', err);
        this.clientesSugeridos = [];
        this.mostrarSugerencias = false;
        this.buscando = false;
      }
    });
  }

  generarDiasSemana(): void {
    const hoy = new Date();
    const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const nombresDiasCortos = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    this.diasDisponibles = [];

    // Generar los próximos 14 días para asegurar que tengamos suficientes días laborables
    for (let i = 0; i < 14; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      const diaSemana = fecha.getDay();

      // Saltar domingos (0) y lunes (1) - Solo martes a sábado
      if (diaSemana === 0 || diaSemana === 1) {
        continue;
      }

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

      // Detener cuando tengamos 5 días laborables (Mar-Sáb)
      if (this.diasDisponibles.length >= 5) {
        break;
      }
    }

    // Seleccionar automáticamente el día de hoy si es un día laborable
    if (this.diasDisponibles.length > 0) {
      this.seleccionarDia(this.diasDisponibles[0]);
    }
  }

  seleccionarDia(dia: DiaDisponible): void {
    this.diaSeleccionado = dia.nombre;
    this.fechaSeleccionada = dia.fecha;
    this.cargarHorariosBloqueados();
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

  cambiarVista(vista: string): void {
    this.vistaActual = vista;
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getEstadoClass(estado: string | undefined): string {
    if (!estado) return '';
    switch(estado) {
      case 'confirmado': return 'estado-confirmado';
      case 'pendiente': return 'estado-pendiente';
      case 'cancelado': return 'estado-cancelado';
      case 'completado': return 'estado-completado';
      default: return '';
    }
  }

  // Funciones para manejo de horarios bloqueados
  cargarHorariosBloqueados(): void {
    if (!this.fechaSeleccionada) return;

    this.bloqueadosService.obtenerBloqueadosPorFecha(this.fechaSeleccionada).subscribe({
      next: (data) => {
        this.horariosBloqueados = data;
        // Crear un Set para búsquedas rápidas
        this.horariosBloqueadosSet = new Set(
          data.map(b => b.hora.substring(0, 5))
        );
      },
      error: (err) => {
        console.error('Error al cargar horarios bloqueados:', err);
      }
    });
  }

  estaHorarioBloqueado(hora: string): boolean {
    const horaFormateada = hora.substring(0, 5);
    return this.horariosBloqueadosSet.has(horaFormateada);
  }

  bloquearHorario(hora: string): void {
    if (!this.fechaSeleccionada) return;

    const motivo = prompt('Motivo del bloqueo (opcional):');
    if (motivo === null) return; // Usuario canceló

    this.bloqueadosService.bloquearHorario(
      this.fechaSeleccionada,
      hora,
      motivo || 'No disponible'
    ).subscribe({
      next: () => {
        this.mensaje = `Horario ${hora} bloqueado exitosamente`;
        this.cargarHorariosBloqueados();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al bloquear horario';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  desbloquearHorario(hora: string): void {
    if (!this.fechaSeleccionada) return;

    if (!confirm(`¿Desbloquear el horario ${hora}?`)) return;

    this.bloqueadosService.desbloquearPorFechaHora(
      this.fechaSeleccionada,
      hora
    ).subscribe({
      next: () => {
        this.mensaje = `Horario ${hora} desbloqueado exitosamente`;
        this.cargarHorariosBloqueados();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al desbloquear horario';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  obtenerHorariosTrabajo(): string[] {
    const horarios: string[] = [];
    for (let hora = 9; hora <= 22; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horaStr = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
        horarios.push(horaStr);
      }
    }
    return horarios;
  }

  tieneTurnoEnHorario(hora: string): boolean {
    // Buscar en TODOS los turnos del día (sin filtrar) para mostrar correctamente los ocupados
    return this.turnosDia.some(turno => {
      // Excluir turnos cancelados, ya que esos horarios quedan disponibles
      if (turno.estado === 'cancelado') {
        return false;
      }
      const horaTurno = turno.hora.toString().substring(0, 5);
      return horaTurno === hora;
    });
  }

  // Funciones para búsqueda de clientes
  onBusquedaChange(): void {
    this.searchSubject.next(this.busquedaCliente);
    if (this.busquedaCliente.trim().length === 0) {
      this.clienteBuscado = null;
      this.historialCliente = [];
      this.busquedaRealizada = false;
    }
  }

  seleccionarCliente(cliente: any): void {
    this.busquedaCliente = cliente.nombre;
    this.mostrarSugerencias = false;
    this.cargarHistorialCliente(cliente.id);
  }

  cargarHistorialCliente(clienteId: number): void {
    this.busquedaRealizada = true;
    this.turnosService.obtenerHistorialCliente(clienteId).subscribe({
      next: (data) => {
        this.clienteBuscado = data.cliente;
        this.historialCliente = data.turnos;
        this.filtroHistorial = 'todos';
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
        this.clienteBuscado = null;
        this.historialCliente = [];
        this.error = 'Error al cargar historial del cliente';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  buscarCliente(): void {
    if (!this.busquedaCliente.trim()) {
      this.error = 'Por favor ingresa un criterio de búsqueda';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    // Si ya tenemos sugerencias, seleccionar la primera
    if (this.clientesSugeridos.length > 0) {
      this.seleccionarCliente(this.clientesSugeridos[0]);
    }
  }

  cerrarSugerencias(): void {
    setTimeout(() => {
      this.mostrarSugerencias = false;
    }, 200);
  }

  historialFiltrado(): Turno[] {
    if (this.filtroHistorial === 'todos') {
      return this.historialCliente;
    }
    return this.historialCliente.filter(t => t.estado === this.filtroHistorial);
  }

  contarPorEstado(estado: string): number {
    return this.historialCliente.filter(t => t.estado === estado).length;
  }
}
 
