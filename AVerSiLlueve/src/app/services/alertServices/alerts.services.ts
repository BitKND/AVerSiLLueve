// src/app/services/alertsServices/alerts.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs'; // Importa BehaviorSubject y throwError
import { catchError, tap } from 'rxjs/operators'; // Importa tap

// Define la interfaz de tus alertas si no la tienes ya
export interface UserAlert {
  userId: string;
  timestamp: number; // o string, dependiendo de cómo lo devuelva tu API/DB
  city: string;
  message: string;
  read: boolean;
  probabilityOfPrecipitation?: number; // Opcional, para el estilo en el frontend
  forecastDateTime?: string; // <-- ¡AÑADIDO! Fecha y hora del pronóstico (ISO string)
  alertGeneratedDateTime?: string; // <-- ¡AÑADIDO! Fecha y hora de generación de la alerta (ISO string)
  expirationTime?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlertsService {
  private apiUrl = 'https://gj5q3ulwi8.execute-api.us-east-1.amazonaws.com/dev'; // Asegúrate de que esta URL sea correcta

  // **NUEVO: BehaviorSubject para mantener el estado de las alertas**
  private _userAlerts = new BehaviorSubject<UserAlert[]>([]);
  public readonly userAlerts$: Observable<UserAlert[]> = this._userAlerts.asObservable();

  constructor(private http: HttpClient) { }

  getAlerts(userId: string): Observable<UserAlert[]> {
    if (!userId) {
      console.error('AlertsService: userId es nulo o indefinido.');
      this._userAlerts.next([]); // Limpia las alertas si no hay usuario
      return throwError(() => new Error('El ID de usuario es requerido para obtener alertas.'));
    }

    const url = `${this.apiUrl}/usuarios/${userId}/alerts`;
    console.log(`AlertsService: Llamando a la API para obtener alertas: ${url}`);

    return this.http.get<UserAlert[]>(url).pipe(
      tap(alerts => {
        // Cuando se reciben nuevas alertas, las emitimos a través del BehaviorSubject
        this._userAlerts.next(alerts);
        console.log('AlertsService: Alertas recibidas y actualizadas en BehaviorSubject:', alerts);
      }),
      catchError(error => {
        console.error('AlertsService: Error al obtener alertas:', error);
        this._userAlerts.next([]); // En caso de error, limpiar o mantener el estado anterior
        return throwError(() => new Error('Error al cargar las alertas del servidor.'));
      })
    );
  }

  // Si implementas marcar alertas como leídas, necesitarás un método PUT/POST en tu API Gateway/Lambda
  // markAlertAsRead(userId: string, alertId: string): Observable<any> {
  //   const url = `${this.apiUrl}/usuarios/${userId}/alerts/${alertId}/read`;
  //   return this.http.put(url, {}).pipe(
  //     tap(() => {
  //       // Opcional: Actualizar el estado localmente después de marcar como leída
  //       const currentAlerts = this._userAlerts.getValue();
  //       const updatedAlerts = currentAlerts.map(alert =>
  //         alert.timestamp === parseInt(alertId) ? { ...alert, read: true } : alert // Asumiendo alertId es timestamp
  //       );
  //       this._userAlerts.next(updatedAlerts);
  //     }),
  //     catchError(error => {
  //       console.error('Error al marcar alerta como leída:', error);
  //       return throwError(() => new Error('No se pudo marcar la alerta como leída.'));
  //     })
  //   );
  // }
}