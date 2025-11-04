import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ItemGaleria {
  id?: number;
  titulo: string;
  descripcion: string;
  url_imagen: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GaleriaService {
  private apiUrl = 'http://localhost:3000/api/galeria';

  constructor(private http: HttpClient) { }

  obtenerItems(): Observable<ItemGaleria[]> {
    return this.http.get<ItemGaleria[]>(this.apiUrl);
  }

  crearItem(item: FormData): Observable<any> {
    return this.http.post(this.apiUrl, item);
  }

  eliminarItem(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  actualizarItem(id: number, item: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, item);
  }
}
