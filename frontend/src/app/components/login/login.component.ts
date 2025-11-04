import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
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
        this.errorMessage = error.error?.mensaje || 'Error al iniciar sesión';
      }
    });
  }
}
