import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ConfiguracionPagos {
  alias_transferencia?: string;
  mensaje_transferencia: string;
  tipo_pago: 'alias' | 'qr' | 'mercadopago';
  imagen_qr?: string;
  link_mercadopago?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PagosService {
  private apiUrl = `${environment.apiUrl}/pagos`;

  constructor(private http: HttpClient) { }

  obtenerConfiguracion(): Observable<ConfiguracionPagos> {
    return this.http.get<ConfiguracionPagos>(`${this.apiUrl}/configuracion`);
  }

  actualizarConfiguracion(configuracion: ConfiguracionPagos, imagenQR?: File): Observable<any> {
    const formData = new FormData();

    // Siempre enviar los campos, incluso si están vacíos
    formData.append('alias_transferencia', configuracion.alias_transferencia || '');
    formData.append('mensaje_transferencia', configuracion.mensaje_transferencia || '');
    formData.append('tipo_pago', configuracion.tipo_pago);
    formData.append('link_mercadopago', configuracion.link_mercadopago || '');

    if (imagenQR) {
      formData.append('imagen_qr', imagenQR);
    }

    console.log('FormData que se va a enviar:');
    console.log('- alias_transferencia:', configuracion.alias_transferencia);
    console.log('- mensaje_transferencia:', configuracion.mensaje_transferencia);
    console.log('- tipo_pago:', configuracion.tipo_pago);
    console.log('- link_mercadopago:', configuracion.link_mercadopago);
    console.log('- imagenQR:', imagenQR);

    return this.http.put(`${this.apiUrl}/configuracion`, formData);
  }
}
