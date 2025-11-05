import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecoveryService {
  private apiUrl = 'http://localhost:3000/api/recovery';

  constructor(private http: HttpClient) { }

  // Nuevo método: Enviar código por email
  enviarCodigoEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar-codigo`, { email });
  }

  // Nuevo método: Verificar código de email
  verificarCodigoEmail(email: string, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verificar-codigo-email`, { email, codigo });
  }

  // Nuevo método: Resetear password con código
  resetearPasswordConCodigo(email: string, nuevaPassword: string, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resetear-password`, {
      email,
      nuevaPassword,
      codigo
    });
  }

  // Métodos LEGACY (antiguos - para compatibilidad)
  verificarEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verificar-email`, { email });
  }

  verificarRespuestaSeguridad(email: string, respuesta: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verificar-respuesta`, { email, respuesta });
  }

  verificarCodigoRecuperacion(email: string, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verificar-codigo`, { email, codigo });
  }

  resetearPassword(email: string, nuevaPassword: string, metodo: string, valor: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resetear-password`, {
      email,
      nuevaPassword,
      metodo,
      valor
    });
  }

  configurarPreguntaSeguridad(pregunta: string, respuesta: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.apiUrl}/configurar-pregunta`,
      { pregunta, respuesta },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
  }

  obtenerCodigoRecuperacion(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.apiUrl}/codigo-recuperacion`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
  }
}
