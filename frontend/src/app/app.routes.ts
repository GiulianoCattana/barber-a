import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { DashboardClienteComponent } from './components/dashboard-cliente/dashboard-cliente.component';
import { DashboardAdminComponent } from './components/dashboard-admin/dashboard-admin.component';
import { GaleriaComponent } from './components/galeria/galeria.component';
import { RecuperarPasswordComponent } from './components/recuperar-password/recuperar-password.component';
import { VerificarEmailComponent } from './components/verificar-email/verificar-email.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'verificar-email', component: VerificarEmailComponent },
  { path: 'recuperar-password', component: RecuperarPasswordComponent },
  {
    path: 'dashboard-cliente',
    component: DashboardClienteComponent,
    canActivate: [authGuard]
  },
  {
    path: 'dashboard-admin',
    component: DashboardAdminComponent,
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'galeria',
    component: GaleriaComponent,
    canActivate: [authGuard, adminGuard]
  },
  { path: '**', redirectTo: '/' }
];
