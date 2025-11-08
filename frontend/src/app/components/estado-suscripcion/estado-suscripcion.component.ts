import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuscripcionService, EstadoSuscripcion } from '../../services/suscripcion.service';

@Component({
  selector: 'app-estado-suscripcion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estado-suscripcion.component.html',
  styleUrl: './estado-suscripcion.component.css'
})
export class EstadoSuscripcionComponent implements OnInit {
  estadoSuscripcion: EstadoSuscripcion | null = null;
  cargando = true;
  linkPago: string | null = null;
  mostrarModalPago = false;
  mostrarConfirmacionPago = false;
  procesandoPago = false;
  pagoId: string = '';
  mostrarFormularioPago = false;

  constructor(public suscripcionService: SuscripcionService) { }

  ngOnInit(): void {
    this.cargarEstadoSuscripcion();
  }

  cargarEstadoSuscripcion(): void {
    this.cargando = true;
    this.suscripcionService.obtenerEstadoSuscripcion().subscribe({
      next: (estado) => {
        this.estadoSuscripcion = estado;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar estado de suscripción:', error);
        this.cargando = false;
      }
    });
  }

  abrirPago(): void {
    this.suscripcionService.generarLinkPago().subscribe({
      next: (response) => {
        this.linkPago = response.link_pago;
        if (this.linkPago) {
          window.open(this.linkPago, '_blank');
          // Mostrar formulario después de abrir el link
          setTimeout(() => {
            this.mostrarFormularioPago = true;
          }, 2000);
        } else {
          alert('No se ha configurado el link de pago de Mercado Pago. Ve a Configuración > Pagos para configurarlo.');
        }
      },
      error: (error) => {
        console.error('Error al obtener link de pago:', error);
        alert('Error al obtener link de pago');
      }
    });
  }

  confirmarPago(): void {
    if (!this.pagoId || this.pagoId.trim() === '') {
      alert('Por favor, ingresá el ID de pago de Mercado Pago');
      return;
    }

    this.procesandoPago = true;

    this.suscripcionService.registrarPago({
      monto: 25000,
      mercadopago_id: this.pagoId.trim(),
      notas: 'Pago registrado por el administrador'
    }).subscribe({
      next: (response) => {
        this.procesandoPago = false;
        this.mostrarFormularioPago = false;
        this.pagoId = '';
        alert('¡Suscripción renovada exitosamente! Tu suscripción está activa por 30 días más.');
        this.cargarEstadoSuscripcion();
      },
      error: (error) => {
        this.procesandoPago = false;
        console.error('Error al confirmar pago:', error);
        const mensaje = error.error?.mensaje || 'Error al confirmar el pago. Verificá el ID de pago e intentá nuevamente.';
        alert(mensaje);
      }
    });
  }

  cancelarConfirmacion(): void {
    this.mostrarFormularioPago = false;
    this.pagoId = '';
  }

  obtenerClaseAlerta(): string {
    if (!this.estadoSuscripcion) return 'alert-secondary';

    switch (this.estadoSuscripcion.estado) {
      case 'activa':
        if (this.estadoSuscripcion.dias_restantes <= 7) {
          return 'alert-warning';
        }
        return 'alert-success';
      case 'gracia':
        return 'alert-warning';
      case 'bloqueada':
      case 'vencida':
        return 'alert-danger';
      default:
        return 'alert-secondary';
    }
  }

  mostrarBotonPago(): boolean {
    if (!this.estadoSuscripcion) return false;
    return this.estadoSuscripcion.dias_restantes <= 7 || !this.estadoSuscripcion.puede_operar;
  }
}
