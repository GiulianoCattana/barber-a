import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TurnosService, Turno } from '../../services/turnos.service';
import { BloqueadosService, HorarioBloqueado } from '../../services/bloqueados.service';
import { DiasBloqueadosService, DiaBloqueado } from '../../services/dias-bloqueados.service';
import { PagosService, ConfiguracionPagos } from '../../services/pagos.service';
import { ServiciosManagerComponent } from '../../admin/servicios-manager/servicios-manager.component';
import { PerfilAdminComponent } from '../../admin/perfil-admin/perfil-admin.component';
import { EstadoSuscripcionComponent } from '../estado-suscripcion/estado-suscripcion.component';
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
  imports: [CommonModule, FormsModule, ServiciosManagerComponent, PerfilAdminComponent, EstadoSuscripcionComponent],
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

  turnosProximos: Turno[] = [];
  mostrarNotificaciones: boolean = true;

  diasBloqueados: DiaBloqueado[] = [];
  diasBloqueadosSet: Set<string> = new Set();

  // Variables para configuración de pagos
  configuracionPagos: ConfiguracionPagos = {
    alias_transferencia: '',
    mensaje_transferencia: '',
    tipo_pago: 'alias'
  };
  guardandoConfiguracion: boolean = false;
  archivoQR: File | null = null;
  previewQR: string | null = null;

  constructor(
    private authService: AuthService,
    private turnosService: TurnosService,
    private bloqueadosService: BloqueadosService,
    private diasBloqueadosService: DiasBloqueadosService,
    private pagosService: PagosService,
    private router: Router,
    public themeService: ThemeService
  ) {
    this.usuario = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.generarDiasSemana();
    this.cargarTurnos();
    this.configurarBusquedaTiempoReal();
    this.cargarDiasBloqueados();
    this.cargarConfiguracionPagos();
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

    // Hacer scroll automático hacia los turnos
    // En móviles/tablets es más necesario, pero también funciona bien en escritorio
    setTimeout(() => {
      const turnosSection = document.querySelector('.turnos-dia-container') as HTMLElement;
      if (turnosSection) {
        const isMobile = window.innerWidth <= 992;

        // En móviles/tablets, scroll más agresivo hacia el inicio
        // En escritorio, scroll más suave
        turnosSection.scrollIntoView({
          behavior: 'smooth',
          block: isMobile ? 'start' : 'nearest'
        });

        // Agregar efecto de highlight en móviles para que sea más visible
        if (isMobile) {
          turnosSection.classList.add('highlight');
          setTimeout(() => {
            turnosSection.classList.remove('highlight');
          }, 1000);
        }
      }
    }, 100);
  }

  filtrarTurnosPorDia(): void {
    if (!this.fechaSeleccionada) {
      this.turnosDia = [];
      this.turnosDiaFiltrados = [];
      return;
    }

    const hoy = new Date();
    const fechaHoy = hoy.getFullYear() + '-' +
                     String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
                     String(hoy.getDate()).padStart(2, '0');
    const esHoy = this.fechaSeleccionada === fechaHoy;
    const horaActual = hoy.getHours() * 60 + hoy.getMinutes(); // Convertir a minutos

    this.turnosDia = this.turnos.filter(turno => {
      const fechaTurno = turno.fecha.toString().split('T')[0];

      if (fechaTurno !== this.fechaSeleccionada) {
        return false;
      }

      // Si es hoy, filtrar turnos que ya pasaron
      if (esHoy) {
        const [hora, minuto] = turno.hora.toString().split(':').map(Number);
        const minutosTurno = hora * 60 + minuto;

        // Solo mostrar turnos futuros o que están a punto de comenzar
        return minutosTurno >= horaActual;
      }

      return true;
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
        this.verificarTurnosProximos();
      },
      error: (error) => {
        this.error = 'Error al cargar turnos';
        console.error('Error al cargar turnos:', error);
      }
    });
  }

  verificarTurnosProximos(): void {
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);

    const mananaStr = manana.getFullYear() + '-' +
                      String(manana.getMonth() + 1).padStart(2, '0') + '-' +
                      String(manana.getDate()).padStart(2, '0');

    this.turnosProximos = this.turnos.filter(turno => {
      const fechaTurno = turno.fecha.toString().split('T')[0];
      return fechaTurno === mananaStr && turno.estado !== 'cancelado';
    }).sort((a, b) => {
      return a.hora.toString().localeCompare(b.hora.toString());
    });
  }

  cerrarNotificaciones(): void {
    this.mostrarNotificaciones = false;
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

  volverAlHome(): void {
    this.router.navigate(['/home']);
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

    // Usar motivo genérico sin preguntar al usuario
    const motivo = 'No disponible';

    this.bloqueadosService.bloquearHorario(
      this.fechaSeleccionada,
      hora,
      motivo
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
    const hoy = new Date();
    const fechaHoy = hoy.getFullYear() + '-' +
                     String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
                     String(hoy.getDate()).padStart(2, '0');
    const esHoy = this.fechaSeleccionada === fechaHoy;
    const horaActual = hoy.getHours() * 60 + hoy.getMinutes();

    const horarios: string[] = [];
    for (let hora = 9; hora <= 22; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horaStr = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;

        // Si es hoy, solo mostrar horarios futuros
        if (esHoy) {
          const minutosTurno = hora * 60 + minuto;
          if (minutosTurno >= horaActual) {
            horarios.push(horaStr);
          }
        } else {
          horarios.push(horaStr);
        }
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

  obtenerEstadoTurnoEnHorario(hora: string): string {
    const turno = this.turnosDia.find(turno => {
      if (turno.estado === 'cancelado') {
        return false;
      }
      const horaTurno = turno.hora.toString().substring(0, 5);
      return horaTurno === hora;
    });
    return turno ? turno.estado || 'pendiente' : '';
  }

  obtenerTextoEstadoTurno(hora: string): string {
    const estado = this.obtenerEstadoTurnoEnHorario(hora);
    switch(estado) {
      case 'pendiente': return 'Turno Pendiente';
      case 'confirmado': return 'Turno Confirmado';
      case 'completado': return 'Turno Completado';
      default: return 'Turno Reservado';
    }
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

  limpiarBusqueda(): void {
    this.busquedaCliente = '';
    this.clienteBuscado = null;
    this.historialCliente = [];
    this.busquedaRealizada = false;
    this.clientesSugeridos = [];
    this.mostrarSugerencias = false;
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

  contarTurnosPorDia(fecha: string): number {
    const hoy = new Date();
    const fechaHoy = hoy.getFullYear() + '-' +
                     String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
                     String(hoy.getDate()).padStart(2, '0');
    const esHoy = fecha === fechaHoy;
    const horaActual = hoy.getHours() * 60 + hoy.getMinutes();

    return this.turnos.filter(turno => {
      const fechaTurno = turno.fecha.toString().split('T')[0];

      if (fechaTurno !== fecha || turno.estado === 'cancelado') {
        return false;
      }

      // Si es hoy, solo contar turnos futuros
      if (esHoy) {
        const [hora, minuto] = turno.hora.toString().split(':').map(Number);
        const minutosTurno = hora * 60 + minuto;
        return minutosTurno >= horaActual;
      }

      return true;
    }).length;
  }

  // Funciones para gestión de días bloqueados
  cargarDiasBloqueados(): void {
    this.diasBloqueadosService.obtenerDiasBloqueados().subscribe({
      next: (data) => {
        this.diasBloqueados = data;
        this.diasBloqueadosSet = new Set(data.map(d => d.fecha));
      },
      error: (err) => {
        console.error('Error al cargar días bloqueados:', err);
      }
    });
  }

  estaDiaBloqueado(fecha: string): boolean {
    return this.diasBloqueadosSet.has(fecha);
  }

  bloquearDiaCompleto(): void {
    if (!this.fechaSeleccionada) return;

    if (this.estaDiaBloqueado(this.fechaSeleccionada)) {
      this.error = 'Este día ya está bloqueado';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    if (!confirm(`¿Bloquear el día ${this.diaSeleccionado}? Los clientes no podrán reservar turnos.`)) {
      return;
    }

    // Usar un motivo genérico sin preguntar al usuario
    const motivo = 'Día no disponible';

    this.diasBloqueadosService.bloquearDia(this.fechaSeleccionada, motivo).subscribe({
      next: (response) => {
        // Agregar inmediatamente el día al Set local para actualización instantánea
        this.diasBloqueadosSet.add(this.fechaSeleccionada);

        this.mensaje = `Día ${this.diaSeleccionado} bloqueado exitosamente.`;

        // Recargar lista completa de días bloqueados
        this.diasBloqueadosService.obtenerDiasBloqueados().subscribe({
          next: (data) => {
            this.diasBloqueados = data;
            this.diasBloqueadosSet = new Set(data.map(d => d.fecha));
            console.log('Días bloqueados actualizados:', Array.from(this.diasBloqueadosSet));

            setTimeout(() => {
              this.mensaje = '';
            }, 2000);
          },
          error: (err) => {
            console.error('Error al recargar días bloqueados:', err);
          }
        });
      },
      error: (err) => {
        console.error('Error al bloquear:', err);
        this.error = err.error?.mensaje || 'Error al bloquear día';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  desbloquearDiaCompleto(): void {
    if (!this.fechaSeleccionada) return;

    if (!this.estaDiaBloqueado(this.fechaSeleccionada)) {
      this.error = 'Este día no está bloqueado';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    if (!confirm(`¿Desbloquear el día ${this.diaSeleccionado}? Los clientes podrán volver a reservar turnos.`)) {
      return;
    }

    this.diasBloqueadosService.desbloquearDia(this.fechaSeleccionada).subscribe({
      next: () => {
        // Eliminar inmediatamente el día del Set local para actualización instantánea
        this.diasBloqueadosSet.delete(this.fechaSeleccionada);

        this.mensaje = `Día ${this.diaSeleccionado} desbloqueado exitosamente`;

        // Recargar lista completa de días bloqueados
        this.diasBloqueadosService.obtenerDiasBloqueados().subscribe({
          next: (data) => {
            this.diasBloqueados = data;
            this.diasBloqueadosSet = new Set(data.map(d => d.fecha));
            console.log('Días bloqueados actualizados:', Array.from(this.diasBloqueadosSet));

            setTimeout(() => {
              this.mensaje = '';
            }, 2000);
          },
          error: (err) => {
            console.error('Error al recargar días bloqueados:', err);
          }
        });
      },
      error: (err) => {
        console.error('Error al desbloquear:', err);
        this.error = err.error?.mensaje || 'Error al desbloquear día';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  // Funciones para configuración de pagos
  cargarConfiguracionPagos(): void {
    this.pagosService.obtenerConfiguracion().subscribe({
      next: (data) => {
        this.configuracionPagos = {
          ...data,
          mensaje_transferencia: data.mensaje_transferencia || '',
          alias_transferencia: data.alias_transferencia || ''
        };
        // Establecer preview del QR si existe
        if (data.imagen_qr) {
          this.previewQR = `http://localhost:3000${data.imagen_qr}`;
        }
      },
      error: (err) => {
        console.error('Error al cargar configuración de pagos:', err);
        // Mantener valores por defecto si hay error
      }
    });
  }

  onArchivoQRSeleccionado(event: any): void {
    const archivo = event.target.files[0];
    if (archivo) {
      // Validar que sea una imagen
      if (!archivo.type.startsWith('image/')) {
        this.error = 'Por favor selecciona un archivo de imagen válido';
        setTimeout(() => this.error = '', 3000);
        return;
      }

      // Validar tamaño (5MB máximo)
      if (archivo.size > 5 * 1024 * 1024) {
        this.error = 'La imagen no debe superar los 5MB';
        setTimeout(() => this.error = '', 3000);
        return;
      }

      this.archivoQR = archivo;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewQR = e.target.result;
      };
      reader.readAsDataURL(archivo);
    }
  }

  cancelarSeleccionQR(): void {
    this.archivoQR = null;
    // Si hay una imagen guardada previamente, restaurar su preview
    if (this.configuracionPagos.imagen_qr) {
      this.previewQR = `http://localhost:3000${this.configuracionPagos.imagen_qr}`;
    } else {
      this.previewQR = null;
    }
    // Limpiar el input file
    const fileInput = document.getElementById('qr') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  guardarConfiguracionPagos(): void {
    // Validación relajada: solo avisar si falta información crítica pero permitir guardar
    // Esto permite al admin configurar parcialmente o limpiar campos

    this.guardandoConfiguracion = true;
    this.error = '';
    this.mensaje = '';

    console.log('Enviando configuración:', this.configuracionPagos);
    console.log('Archivo QR:', this.archivoQR);

    this.pagosService.actualizarConfiguracion(this.configuracionPagos, this.archivoQR || undefined).subscribe({
      next: (response) => {
        console.log('Respuesta del backend:', response);
        this.mensaje = 'Configuración actualizada correctamente';
        this.guardandoConfiguracion = false;
        this.archivoQR = null;

        // Actualizar con los datos de la respuesta del backend
        if (response.configuracion) {
          this.configuracionPagos = {
            ...response.configuracion,
            mensaje_transferencia: response.configuracion.mensaje_transferencia || '',
            alias_transferencia: response.configuracion.alias_transferencia || ''
          };

          // Actualizar preview del QR si existe
          if (response.configuracion.imagen_qr) {
            this.previewQR = `http://localhost:3000${response.configuracion.imagen_qr}`;
          }
        }

        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (err) => {
        console.error('Error del backend:', err);
        this.error = err.error?.mensaje || 'Error al actualizar configuración';
        this.guardandoConfiguracion = false;
        setTimeout(() => this.error = '', 3000);
      }
    });
  }
}

