import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HomeServicio {
  id?: number;
  nombre: string;
  descripcion: string;
  icono: string;
  orden: number;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HomeServiciosService {
  private apiUrl = 'http://localhost:3000/api/home-servicios';

  constructor(private http: HttpClient) { }

  obtenerServicios(): Observable<HomeServicio[]> {
    return this.http.get<HomeServicio[]>(this.apiUrl);
  }

  crearServicio(servicio: HomeServicio): Observable<HomeServicio> {
    return this.http.post<HomeServicio>(this.apiUrl, servicio);
  }

  actualizarServicio(id: number, servicio: HomeServicio): Observable<HomeServicio> {
    return this.http.put<HomeServicio>(`${this.apiUrl}/${id}`, servicio);
  }

  eliminarServicio(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
