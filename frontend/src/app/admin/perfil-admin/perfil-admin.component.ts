import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-perfil-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-admin.component.html',
  styleUrl: './perfil-admin.component.css'
})
export class PerfilAdminComponent implements OnInit {
  @Output() volverDashboard = new EventEmitter<void>();

  usuario: any = null;
  emailRecuperacion = '';
  passwordActual = '';
  passwordNueva = '';
  passwordConfirmar = '';

  editandoEmail = false;
  cambiandoPassword = false;

  mensaje = '';
  error = '';
  cargando = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.cargarPerfil();
  }

  cargarPerfil() {
    const user = this.authService.getUsuario();
    if (user) {
      this.usuario = user;
      this.emailRecuperacion = user.email;
    }
  }

  guardarEmail() {
    if (!this.emailRecuperacion) {
      this.error = 'El email no puede estar vacío';
      return;
    }

    this.cargando = true;
    this.error = '';
    this.mensaje = '';

    this.authService.actualizarEmail(this.emailRecuperacion).subscribe({
      next: () => {
        this.mensaje = 'Email actualizado exitosamente';
        this.editandoEmail = false;
        this.cargando = false;

        // Actualizar el usuario en localStorage
        const user = this.authService.getUsuario();
        if (user) {
          user.email = this.emailRecuperacion;
          localStorage.setItem('usuario', JSON.stringify(user));
        }
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al actualizar email';
        this.cargando = false;
      }
    });
  }

  cambiarPassword() {
    if (this.passwordNueva !== this.passwordConfirmar) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    if (this.passwordNueva.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.cargando = true;
    this.error = '';
    this.mensaje = '';

    this.authService.cambiarPassword(this.passwordActual, this.passwordNueva).subscribe({
      next: () => {
        this.mensaje = 'Contraseña actualizada exitosamente';
        this.cambiandoPassword = false;
        this.passwordActual = '';
        this.passwordNueva = '';
        this.passwordConfirmar = '';
        this.cargando = false;
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al cambiar contraseña';
        this.cargando = false;
      }
    });
  }

  cancelarEdicionEmail() {
    this.editandoEmail = false;
    this.emailRecuperacion = this.usuario.email;
    this.error = '';
  }

  cancelarCambioPassword() {
    this.cambiandoPassword = false;
    this.passwordActual = '';
    this.passwordNueva = '';
    this.passwordConfirmar = '';
    this.error = '';
  }

  volver() {
    this.volverDashboard.emit();
  }
}
