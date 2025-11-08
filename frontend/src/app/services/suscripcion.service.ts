import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface EstadoSuscripcion {
  id: number;
  usuario_id: number;
  fecha_inicio: Date;
  fecha_vencimiento: Date;
  estado: 'activa' | 'vencida' | 'gracia' | 'bloqueada';
  es_periodo_prueba: boolean;
  monto_mensual: number;
  dias_restantes: number;
  puede_operar: boolean;
  mensaje: string;
}

export interface PagoSuscripcion {
  id: number;
  suscripcion_id: number;
  usuario_id: number;
  monto: number;
  fecha_pago: Date;
  metodo_pago: string;
  comprobante_url?: string;
  mercadopago_id?: string;
  estado: string;
  notas?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SuscripcionService {
  private apiUrl = `${environment.apiUrl}/suscripcion`;
  private estadoSuscripcionSubject = new BehaviorSubject<EstadoSuscripcion | null>(null);
  public estadoSuscripcion$ = this.estadoSuscripcionSubject.asObservable();

  constructor(private http: HttpClient) { }

  obtenerEstadoSuscripcion(): Observable<EstadoSuscripcion> {
    return this.http.get<EstadoSuscripcion>(`${this.apiUrl}/estado`).pipe(
      tap(estado => this.estadoSuscripcionSubject.next(estado))
    );
  }

  obtenerHistorialPagos(): Observable<PagoSuscripcion[]> {
    return this.http.get<PagoSuscripcion[]>(`${this.apiUrl}/historial`);
  }

  registrarPago(pago: {
    monto: number;
    comprobante_url?: string;
    mercadopago_id?: string;
    notas?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/pago`, pago);
  }

  confirmarPagoManual(): Observable<any> {
    return this.http.post(`${this.apiUrl}/confirmar-pago`, {});
  }

  generarLinkPago(): Observable<{ link_pago: string; monto: number; mensaje: string }> {
    return this.http.get<{ link_pago: string; monto: number; mensaje: string }>(`${this.apiUrl}/link-pago`);
  }

  // Método auxiliar para verificar si el admin puede realizar operaciones
  puedeOperar(estado: EstadoSuscripcion): boolean {
    return estado.puede_operar;
  }

  // Método auxiliar para obtener el color del badge según el estado
  obtenerColorEstado(estado: string): string {
    switch (estado) {
      case 'activa':
        return 'success';
      case 'gracia':
        return 'warning';
      case 'vencida':
      case 'bloqueada':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  // Método auxiliar para obtener el texto del estado
  obtenerTextoEstado(estado: string, esPrueba: boolean): string {
    if (esPrueba && estado === 'activa') {
      return 'Período de Prueba';
    }
    switch (estado) {
      case 'activa':
        return 'Activa';
      case 'gracia':
        return 'En Gracia';
      case 'vencida':
        return 'Vencida';
      case 'bloqueada':
        return 'Bloqueada';
      default:
        return 'Desconocido';
    }
  }
}
