import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GaleriaService, ItemGaleria } from '../../services/galeria.service';
import { SliderService, SliderImagen } from '../../services/slider.service';
import { HomeServiciosService, HomeServicio } from '../../services/home-servicios.service';

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './galeria.component.html',
  styleUrl: './galeria.component.css'
})
export class GaleriaComponent implements OnInit {
  usuario: any;
  vistaActual: string = 'galeria'; // 'galeria', 'slider', 'servicios'

  // Galería
  items: ItemGaleria[] = [];
  mostrarFormulario: boolean = false;
  editando: boolean = false;
  itemActual: ItemGaleria = {
    titulo: '',
    descripcion: '',
    imagen_url: ''
  };
  archivoSeleccionado: File | null = null;
  mensaje: string = '';
  error: string = '';

  // Slider
  sliderImagenes: SliderImagen[] = [];
  mostrarFormSlider: boolean = false;
  editandoSlider: boolean = false;
  sliderActual: SliderImagen = {
    imagen_url: '',
    alt_text: '',
    orden: 0
  };
  archivoSlider: File | null = null;

  // Servicios
  homeServicios: HomeServicio[] = [];
  mostrarFormServicio: boolean = false;
  editandoServicio: boolean = false;
  servicioActual: HomeServicio = {
    nombre: '',
    descripcion: '',
    icono: '✨',
    orden: 0
  };

  constructor(
    private authService: AuthService,
    private galeriaService: GaleriaService,
    private sliderService: SliderService,
    private homeServiciosService: HomeServiciosService,
    private router: Router
  ) {
    this.usuario = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.cargarItems();
    this.cargarSlider();
    this.cargarServicios();
  }

  cambiarVista(vista: string): void {
    this.vistaActual = vista;
    this.mensaje = '';
    this.error = '';
  }

  cargarItems(): void {
    this.galeriaService.obtenerItems().subscribe({
      next: (data) => {
        this.items = data;
      },
      error: (error) => {
        console.error('Error al cargar items:', error);
        this.error = 'Error al cargar la galería';
      }
    });
  }

  abrirFormulario(): void {
    this.mostrarFormulario = true;
    this.editando = false;
    this.itemActual = {
      titulo: '',
      descripcion: '',
      imagen_url: ''
    };
    this.archivoSeleccionado = null;
  }

  editarItem(item: ItemGaleria): void {
    this.mostrarFormulario = true;
    this.editando = true;
    this.itemActual = { ...item };
    this.archivoSeleccionado = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        this.archivoSeleccionado = file;
      } else {
        this.error = 'Por favor selecciona un archivo de imagen válido';
        event.target.value = '';
      }
    }
  }

  guardarItem(): void {
    this.error = '';
    this.mensaje = '';

    if (!this.itemActual.titulo || !this.itemActual.descripcion) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    if (!this.editando && !this.archivoSeleccionado) {
      this.error = 'Por favor selecciona una imagen';
      return;
    }

    const formData = new FormData();
    formData.append('titulo', this.itemActual.titulo);
    formData.append('descripcion', this.itemActual.descripcion);

    if (this.archivoSeleccionado) {
      formData.append('imagen', this.archivoSeleccionado);
    }

    if (this.editando && this.itemActual.id) {
      this.galeriaService.actualizarItem(this.itemActual.id, formData).subscribe({
        next: () => {
          this.mensaje = 'Item actualizado exitosamente';
          this.cargarItems();
          this.cerrarFormulario();
        },
        error: (error) => {
          this.error = error.error?.mensaje || 'Error al actualizar item';
        }
      });
    } else {
      this.galeriaService.crearItem(formData).subscribe({
        next: () => {
          this.mensaje = 'Item creado exitosamente';
          this.cargarItems();
          this.cerrarFormulario();
        },
        error: (error) => {
          this.error = error.error?.mensaje || 'Error al crear item';
        }
      });
    }
  }

  eliminarItem(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este item?')) {
      this.galeriaService.eliminarItem(id).subscribe({
        next: () => {
          this.mensaje = 'Item eliminado exitosamente';
          this.cargarItems();
        },
        error: (error) => {
          this.error = 'Error al eliminar item';
        }
      });
    }
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.editando = false;
    this.itemActual = {
      titulo: '',
      descripcion: '',
      imagen_url: ''
    };
    this.archivoSeleccionado = null;
  }

  volverDashboard(): void {
    this.router.navigate(['/dashboard-admin']);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // ============ MÉTODOS PARA SLIDER ============
  cargarSlider(): void {
    this.sliderService.obtenerImagenes().subscribe({
      next: (data) => {
        this.sliderImagenes = data;
      },
      error: (error) => {
        console.error('Error al cargar slider:', error);
      }
    });
  }

  abrirFormSlider(): void {
    this.mostrarFormSlider = true;
    this.editandoSlider = false;
    this.sliderActual = {
      imagen_url: '',
      alt_text: '',
      orden: this.sliderImagenes.length + 1
    };
    this.archivoSlider = null;
  }

  editarSlider(slider: SliderImagen): void {
    this.mostrarFormSlider = true;
    this.editandoSlider = true;
    this.sliderActual = { ...slider };
    this.archivoSlider = null;
  }

  onFileSlider(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        this.archivoSlider = file;
      } else {
        this.error = 'Por favor selecciona un archivo de imagen válido';
        event.target.value = '';
      }
    }
  }

  guardarSlider(): void {
    this.error = '';
    this.mensaje = '';

    if (!this.archivoSlider && !this.editandoSlider) {
      this.error = 'Por favor selecciona una imagen';
      return;
    }

    if (this.archivoSlider) {
      const formData = new FormData();
      formData.append('imagen', this.archivoSlider);
      formData.append('alt_text', this.sliderActual.alt_text);
      formData.append('orden', this.sliderActual.orden.toString());

      this.sliderService.subirImagen(formData).subscribe({
        next: () => {
          this.mensaje = 'Imagen agregada exitosamente';
          this.cargarSlider();
          this.cerrarFormSlider();
        },
        error: (error) => {
          this.error = error.error?.mensaje || 'Error al subir imagen';
        }
      });
    } else if (this.editandoSlider && this.sliderActual.id) {
      this.sliderService.actualizarImagen(this.sliderActual.id, this.sliderActual).subscribe({
        next: () => {
          this.mensaje = 'Imagen actualizada exitosamente';
          this.cargarSlider();
          this.cerrarFormSlider();
        },
        error: (error) => {
          this.error = error.error?.mensaje || 'Error al actualizar imagen';
        }
      });
    }
  }

  eliminarSlider(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta imagen del slider?')) {
      this.sliderService.eliminarImagen(id).subscribe({
        next: () => {
          this.mensaje = 'Imagen eliminada exitosamente';
          this.cargarSlider();
        },
        error: (error) => {
          this.error = 'Error al eliminar imagen';
        }
      });
    }
  }

  cerrarFormSlider(): void {
    this.mostrarFormSlider = false;
    this.editandoSlider = false;
    this.sliderActual = {
      imagen_url: '',
      alt_text: '',
      orden: 0
    };
    this.archivoSlider = null;
  }

  // ============ MÉTODOS PARA SERVICIOS ============
  cargarServicios(): void {
    this.homeServiciosService.obtenerServicios().subscribe({
      next: (data) => {
        this.homeServicios = data;
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
      }
    });
  }

  abrirFormServicio(): void {
    this.mostrarFormServicio = true;
    this.editandoServicio = false;
    this.servicioActual = {
      nombre: '',
      descripcion: '',
      icono: '✨',
      orden: this.homeServicios.length + 1
    };
  }

  editarServicio(servicio: HomeServicio): void {
    this.mostrarFormServicio = true;
    this.editandoServicio = true;
    this.servicioActual = { ...servicio };
  }

  guardarServicio(): void {
    this.error = '';
    this.mensaje = '';

    if (!this.servicioActual.nombre || !this.servicioActual.descripcion) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    if (this.editandoServicio && this.servicioActual.id) {
      this.homeServiciosService.actualizarServicio(this.servicioActual.id, this.servicioActual).subscribe({
        next: () => {
          this.mensaje = 'Servicio actualizado exitosamente';
          this.cargarServicios();
          this.cerrarFormServicio();
        },
        error: (error) => {
          this.error = error.error?.mensaje || 'Error al actualizar servicio';
        }
      });
    } else {
      this.homeServiciosService.crearServicio(this.servicioActual).subscribe({
        next: () => {
          this.mensaje = 'Servicio creado exitosamente';
          this.cargarServicios();
          this.cerrarFormServicio();
        },
        error: (error) => {
          this.error = error.error?.mensaje || 'Error al crear servicio';
        }
      });
    }
  }

  eliminarServicio(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      this.homeServiciosService.eliminarServicio(id).subscribe({
        next: () => {
          this.mensaje = 'Servicio eliminado exitosamente';
          this.cargarServicios();
        },
        error: (error) => {
          this.error = 'Error al eliminar servicio';
        }
      });
    }
  }

  cerrarFormServicio(): void {
    this.mostrarFormServicio = false;
    this.editandoServicio = false;
    this.servicioActual = {
      nombre: '',
      descripcion: '',
      icono: '✨',
      orden: 0
    };
  }

  // Obtener URL de imagen (para slider y galería)
  getImageUrl(url: string): string {
    if (!url) return '';
    // Si la URL ya es completa (http/https) o es de assets, devolverla tal cual
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('assets/')) {
      return url;
    }
    // Si es una ruta relativa (como /uploads/...), agregar la URL del backend
    return 'http://localhost:3000' + url;
  }
}
