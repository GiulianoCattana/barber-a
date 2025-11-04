import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GaleriaService, ItemGaleria } from '../../services/galeria.service';

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './galeria.component.html',
  styleUrl: './galeria.component.css'
})
export class GaleriaComponent implements OnInit {
  usuario: any;
  items: ItemGaleria[] = [];
  mostrarFormulario: boolean = false;
  editando: boolean = false;
  itemActual: ItemGaleria = {
    titulo: '',
    descripcion: '',
    url_imagen: ''
  };
  archivoSeleccionado: File | null = null;
  mensaje: string = '';
  error: string = '';

  constructor(
    private authService: AuthService,
    private galeriaService: GaleriaService,
    private router: Router
  ) {
    this.usuario = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.cargarItems();
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
      url_imagen: ''
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
      url_imagen: ''
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
}
