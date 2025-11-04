import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Turno {
  id?: number;
  cliente_id?: number;
  fecha: string;
  hora: string;
  servicio?: string;
  servicio_id?: number;
  servicio_nombre?: string;
  duracion_minutos?: number;
  duracion_total?: number;
  estado?: string;
  notas?: string;
  cliente_nombre?: string;
  cliente_email?: string;
  cliente_telefono?: string;
  created_at?: string;
}

export interface Horario {
  hora: string;
  disponible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private apiUrl = 'http://localhost:3000/api/turnos';

  constructor(private http: HttpClient) { }

  obtenerTurnos(): Observable<Turno[]> {
    return this.http.get<Turno[]>(this.apiUrl);
  }

  obtenerTurnosDisponibles(fecha: string, servicioId?: number, duracionTotal?: number): Observable<{ horarios: Horario[] }> {
    let url = `${this.apiUrl}/disponibles?fecha=${fecha}`;
    if (servicioId) {
      url += `&servicio_id=${servicioId}`;
    }
    if (duracionTotal) {
      url += `&duracion_total=${duracionTotal}`;
    }
    return this.http.get<{ horarios: Horario[] }>(url);
  }

  crearTurno(turno: Turno): Observable<any> {
    return this.http.post(`${this.apiUrl}`, turno);
  }

  actualizarEstadoTurno(id: number, estado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/estado`, { estado });
  }

  cancelarTurno(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
