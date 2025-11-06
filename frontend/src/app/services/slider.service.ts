import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SliderImagen {
  id?: number;
  imagen_url: string;
  alt_text: string;
  orden: number;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SliderService {
  private apiUrl = 'http://localhost:3000/api/slider';

  constructor(private http: HttpClient) { }

  obtenerImagenes(): Observable<SliderImagen[]> {
    return this.http.get<SliderImagen[]>(this.apiUrl);
  }

  crearImagen(imagen: SliderImagen): Observable<SliderImagen> {
    return this.http.post<SliderImagen>(this.apiUrl, imagen);
  }

  subirImagen(formData: FormData): Observable<SliderImagen> {
    return this.http.post<SliderImagen>(`${this.apiUrl}/upload`, formData);
  }

  actualizarImagen(id: number, imagen: SliderImagen): Observable<SliderImagen> {
    return this.http.put<SliderImagen>(`${this.apiUrl}/${id}`, imagen);
  }

  eliminarImagen(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
