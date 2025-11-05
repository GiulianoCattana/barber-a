import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService
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

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.usuario.rol === 'admin') {
          this.router.navigate(['/dashboard-admin']);
        } else {
          this.router.navigate(['/dashboard-cliente']);
        }
      },
      error: (error) => {
        this.loading = false;

        // Si el email no está verificado, redirigir a verificación
        if (error.status === 403 && error.error?.requiresVerification) {
          this.router.navigate(['/verificar-email'], {
            queryParams: { email: error.error.email || this.email }
          });
        } else {
          this.errorMessage = error.error?.mensaje || 'Error al iniciar sesión';
        }
      }
    });
  }
}
