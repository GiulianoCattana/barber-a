import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GaleriaService, ItemGaleria } from '../../services/galeria.service';
import { SliderService, SliderImagen } from '../../services/slider.service';
import { HomeServiciosService, HomeServicio } from '../../services/home-servicios.service';

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

  // Slider
  currentSlide = 0;
  slides: SliderImagen[] = [];

  servicios: HomeServicio[] = [];

  constructor(
    private galeriaService: GaleriaService,
    private sliderService: SliderService,
    private homeServiciosService: HomeServiciosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarGaleria();
    this.cargarSlider();
    this.cargarServicios();
  }

  iniciarSlider(): void {
    setInterval(() => {
      this.nextSlide();
    }, 12000); // Cambiar cada 12 segundos
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide(): void {
    this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  cargarSlider(): void {
    this.sliderService.obtenerImagenes().subscribe({
      next: (data) => {
        this.slides = data.filter(img => img.activo !== false);
        if (this.slides.length > 0) {
          this.iniciarSlider();
        }
      },
      error: (error) => {
        console.error('Error al cargar slider:', error);
      }
    });
  }

  cargarServicios(): void {
    this.homeServiciosService.obtenerServicios().subscribe({
      next: (data) => {
        this.servicios = data.filter(s => s.activo !== false);
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
      }
    });
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
    if (!url) return '';
    // Si la URL ya es completa (http/https), devolverla tal cual
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Si es una ruta relativa, agregar la URL del backend
    return this.backendUrl + url;
  }

  onLogoError(): void {
    this.logoExists = false;
  }
}
