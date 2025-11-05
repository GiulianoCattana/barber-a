import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent implements OnInit {
  nombre: string = '';
  email: string = '';
  password: string = '';
  telefono: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Si ya está autenticado, redirigir a su dashboard
    if (this.authService.isAuthenticated()) {
      const user = this.authService.currentUserValue;
      if (user?.rol === 'admin') {
        this.router.navigate(['/dashboard-admin']);
      } else {
        this.router.navigate(['/dashboard-cliente']);
      }
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.loading = true;

    this.authService.registro(this.nombre, this.email, this.password, this.telefono).subscribe({
      next: (response) => {
        this.loading = false;
        // Redirigir a la pantalla de verificación de email
        this.router.navigate(['/verificar-email'], {
          queryParams: { email: this.email }
        });
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.mensaje || 'Error al registrar usuario';
      }
    });
  }
}
