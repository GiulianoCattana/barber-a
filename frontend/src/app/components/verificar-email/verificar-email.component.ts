import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verificar-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verificar-email.component.html',
  styleUrl: './verificar-email.component.css'
})
export class VerificarEmailComponent implements OnInit {
  email: string = '';
  codigo: string = '';
  mensaje: string = '';
  error: string = '';
  cargando: boolean = false;
  codigoEnviado: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Obtener email de los parámetros de la ruta
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  verificarCodigo(): void {
    if (!this.codigo || this.codigo.length !== 6) {
      this.error = 'Por favor ingresa el código de 6 dígitos';
      return;
    }

    this.cargando = true;
    this.error = '';
    this.mensaje = '';

    this.authService.verificarEmail(this.email, this.codigo).subscribe({
      next: (response) => {
        this.mensaje = response.mensaje;
        this.cargando = false;

        // Guardar el token y usuario
        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.usuario));

        // Redirigir según el rol
        setTimeout(() => {
          if (response.usuario.rol === 'admin') {
            this.router.navigate(['/dashboard-admin']);
          } else {
            this.router.navigate(['/dashboard-cliente']);
          }
        }, 2000);
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al verificar código';
        this.cargando = false;
      }
    });
  }

  reenviarCodigo(): void {
    if (!this.email) {
      this.error = 'Email no disponible';
      return;
    }

    this.cargando = true;
    this.error = '';
    this.mensaje = '';

    this.authService.reenviarCodigoVerificacion(this.email).subscribe({
      next: (response) => {
        this.mensaje = response.mensaje;
        this.codigoEnviado = true;
        this.cargando = false;
        setTimeout(() => {
          this.mensaje = '';
          this.codigoEnviado = false;
        }, 3000);
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al reenviar código';
        this.cargando = false;
      }
    });
  }

  volverLogin(): void {
    this.router.navigate(['/login']);
  }
}
