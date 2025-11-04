import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GaleriaService, ItemGaleria } from '../../services/galeria.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  items: ItemGaleria[] = [];
  error: string = '';
  backendUrl = 'http://localhost:3000';
  logoExists: boolean = true;

  servicios = [
    {
      nombre: 'Corte de Cabello',
      descripcion: 'Cortes modernos y clásicos adaptados a tu estilo',
      icono: '✂️'
    },
    {
      nombre: 'Tinte',
      descripcion: 'Coloración profesional con productos de primera calidad',
      icono: '🎨'
    },
    {
      nombre: 'Peinado',
      descripcion: 'Peinados para eventos especiales y día a día',
      icono: '💇'
    },
    {
      nombre: 'Barba',
      descripcion: 'Cuidado y diseño de barba profesional',
      icono: '🧔'
    },
    {
      nombre: 'Tratamiento Capilar',
      descripcion: 'Tratamientos especializados para el cuidado de tu cabello',
      icono: '✨'
    }
  ];

  constructor(
    private galeriaService: GaleriaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarGaleria();
  }

  cargarGaleria(): void {
    this.galeriaService.obtenerItems().subscribe({
      next: (data) => {
        this.items = data;
      },
      error: (error) => {
        console.error('Error al cargar galería:', error);
      }
    });
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }

  irARegistro(): void {
    this.router.navigate(['/registro']);
  }

  getImageUrl(url: string): string {
    return this.backendUrl + url;
  }

  onLogoError(): void {
    this.logoExists = false;
  }
}
