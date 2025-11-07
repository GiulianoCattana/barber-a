import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DiaBloqueado {
  id?: number;
  fecha: string;
  motivo?: string;
  creado_en?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DiasBloqueadosService {
  private apiUrl = `${environment.apiUrl}/dias-bloqueados`;

  constructor(private http: HttpClient) { }

  obtenerDiasBloqueados(): Observable<DiaBloqueado[]> {
    return this.http.get<DiaBloqueado[]>(this.apiUrl);
  }

  verificarDiaBloqueado(fecha: string): Observable<{ bloqueado: boolean; motivo?: string }> {
    return this.http.get<{ bloqueado: boolean; motivo?: string }>(`${this.apiUrl}/verificar/${fecha}`);
  }

  bloquearDia(fecha: string, motivo?: string): Observable<any> {
    return this.http.post(this.apiUrl, { fecha, motivo });
  }

  desbloquearDia(fecha: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${fecha}`);
  }
}
