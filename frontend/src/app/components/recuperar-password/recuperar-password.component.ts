import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RecoveryService } from '../../services/recovery.service';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recuperar-password.component.html',
  styleUrl: './recuperar-password.component.css'
})
export class RecuperarPasswordComponent {
  paso = 1; // 1: email, 2: código verificación, 3: nueva contraseña
  email = '';
  codigoVerificacion = '';
  nuevaPassword = '';
  confirmarPassword = '';
  mensaje = '';
  error = '';
  cargando = false;

  constructor(
    private recoveryService: RecoveryService,
    private router: Router
  ) {}

  enviarCodigoEmail() {
    if (!this.email) {
      this.error = 'Por favor ingresa tu email';
      return;
    }

    this.cargando = true;
    this.error = '';
    this.mensaje = '';

    this.recoveryService.enviarCodigoEmail(this.email).subscribe({
      next: (response) => {
        this.mensaje = 'Código enviado a tu email. Revisa tu bandeja de entrada.';
        this.paso = 2;
        this.cargando = false;
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Email no encontrado o error al enviar';
        this.cargando = false;
      }
    });
  }

  verificarCodigo() {
    if (!this.codigoVerificacion) {
      this.error = 'Por favor ingresa el código';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.recoveryService.verificarCodigoEmail(this.email, this.codigoVerificacion).subscribe({
      next: () => {
        this.paso = 3;
        this.cargando = false;
        this.mensaje = '';
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Código incorrecto o expirado';
        this.cargando = false;
      }
    });
  }

  resetearPassword() {
    if (this.nuevaPassword !== this.confirmarPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    if (this.nuevaPassword.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.recoveryService.resetearPasswordConCodigo(this.email, this.nuevaPassword, this.codigoVerificacion).subscribe({
      next: () => {
        this.mensaje = '¡Contraseña actualizada exitosamente!';
        this.cargando = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al resetear contraseña';
        this.cargando = false;
      }
    });
  }

  volver() {
    if (this.paso > 1) {
      this.paso--;
      this.error = '';
    } else {
      this.router.navigate(['/login']);
    }
  }
}
