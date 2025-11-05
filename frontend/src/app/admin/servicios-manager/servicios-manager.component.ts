import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiciosService } from '../../services/servicios.service';

interface Servicio {
  id?: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracion: number;
  activo?: boolean;
}

@Component({
  selector: 'app-servicios-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './servicios-manager.component.html',
  styleUrl: './servicios-manager.component.css'
})
export class ServiciosManagerComponent implements OnInit {
  @Output() volverDashboard = new EventEmitter<void>();

  servicios: Servicio[] = [];
  servicioEditando: Servicio | null = null;
  nuevoServicio: Servicio = {
    nombre: '',
    precio: 0,
    duracion: 30
  };
  mostrarFormulario = false;
  modoEdicion = false;

  constructor(private serviciosService: ServiciosService) {}

  ngOnInit() {
    this.cargarServicios();
  }

  cargarServicios() {
    this.serviciosService.obtenerTodosServicios().subscribe({
      next: (servicios) => {
        this.servicios = servicios;
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
        alert('Error al cargar servicios');
      }
    });
  }

  mostrarFormNuevo() {
    this.modoEdicion = false;
    this.mostrarFormulario = true;
    this.nuevoServicio = {
      nombre: '',
      precio: 0,
      duracion: 30
    };
  }

  editarServicio(servicio: Servicio) {
    this.modoEdicion = true;
    this.mostrarFormulario = true;
    this.nuevoServicio = { ...servicio };
  }

  guardarServicio() {
    if (!this.nuevoServicio.nombre || !this.nuevoServicio.precio) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (this.modoEdicion && this.nuevoServicio.id) {
      // Actualizar servicio existente
      this.serviciosService.actualizarServicio(this.nuevoServicio.id, this.nuevoServicio).subscribe({
        next: () => {
          this.cargarServicios();
          this.cancelar();
          alert('Servicio actualizado exitosamente');
        },
        error: (error) => {
          console.error('Error al actualizar servicio:', error);
          alert('Error al actualizar servicio');
        }
      });
    } else {
      // Crear nuevo servicio
      this.serviciosService.crearServicio(this.nuevoServicio).subscribe({
        next: () => {
          this.cargarServicios();
          this.cancelar();
          alert('Servicio creado exitosamente');
        },
        error: (error) => {
          console.error('Error al crear servicio:', error);
          alert('Error al crear servicio');
        }
      });
    }
  }

  eliminarServicio(id: number) {
    if (!confirm('¿Está seguro de que desea desactivar este servicio?')) {
      return;
    }

    this.serviciosService.eliminarServicio(id).subscribe({
      next: () => {
        this.cargarServicios();
        alert('Servicio desactivado exitosamente');
      },
      error: (error) => {
        console.error('Error al eliminar servicio:', error);
        alert('Error al eliminar servicio');
      }
    });
  }

  activarServicio(id: number) {
    const servicio = this.servicios.find(s => s.id === id);
    if (servicio) {
      servicio.activo = true;
      this.serviciosService.actualizarServicio(id, servicio).subscribe({
        next: () => {
          this.cargarServicios();
          alert('Servicio activado exitosamente');
        },
        error: (error) => {
          console.error('Error al activar servicio:', error);
          alert('Error al activar servicio');
        }
      });
    }
  }

  cancelar() {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.nuevoServicio = {
      nombre: '',
      precio: 0,
      duracion: 30
    };
  }

  volver() {
    this.volverDashboard.emit();
  }
}
