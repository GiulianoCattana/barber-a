import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface HorarioBloqueado {
  id?: number;
  fecha: string;
  hora: string;
  motivo?: string;
  creado_en?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BloqueadosService {
  private apiUrl = `${environment.apiUrl}/bloqueados`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtener todos los horarios bloqueados
  obtenerBloqueados(): Observable<HorarioBloqueado[]> {
    return this.http.get<HorarioBloqueado[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  // Obtener horarios bloqueados por fecha
  obtenerBloqueadosPorFecha(fecha: string): Observable<HorarioBloqueado[]> {
    return this.http.get<HorarioBloqueado[]>(`${this.apiUrl}/fecha/${fecha}`);
  }

  // Bloquear un horario
  bloquearHorario(fecha: string, hora: string, motivo?: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/bloquear`,
      { fecha, hora, motivo },
      { headers: this.getHeaders() }
    );
  }

  // Desbloquear un horario por ID
  desbloquearHorario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Desbloquear por fecha y hora
  desbloquearPorFechaHora(fecha: string, hora: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/desbloquear`,
      { fecha, hora },
      { headers: this.getHeaders() }
    );
  }

  // Verificar si un horario está bloqueado
  verificarBloqueado(fecha: string, hora: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verificar?fecha=${fecha}&hora=${hora}`);
  }
}
