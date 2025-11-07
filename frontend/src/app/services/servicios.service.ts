import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Servicio {
  id?: number;
  nombre: string;
  descripcion?: string;
  duracion: number;
  precio: number;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {
  private apiUrl = `${environment.apiUrl}/servicios`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  obtenerServicios(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(this.apiUrl);
  }

  obtenerTodosServicios(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.apiUrl}/admin/todos`, {
      headers: this.getHeaders()
    });
  }

  obtenerServicioPorId(id: number): Observable<Servicio> {
    return this.http.get<Servicio>(`${this.apiUrl}/${id}`);
  }

  crearServicio(servicio: Servicio): Observable<Servicio> {
    return this.http.post<Servicio>(this.apiUrl, servicio, {
      headers: this.getHeaders()
    });
  }

  actualizarServicio(id: number, servicio: Partial<Servicio>): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.apiUrl}/${id}`, servicio, {
      headers: this.getHeaders()
    });
  }

  eliminarServicio(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}
