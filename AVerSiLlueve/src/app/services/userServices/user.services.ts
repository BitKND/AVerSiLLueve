// src/app/services/userServices/user.services.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Asegúrate de importar HttpHeaders
import { Observable, from, throwError, BehaviorSubject } from 'rxjs'; // Agrega BehaviorSubject
import { switchMap, catchError, tap } from 'rxjs/operators'; // Agrega tap

import { environment } from 'src/environments/environment';
import { fetchAuthSession } from 'aws-amplify/auth'; // <-- Importa fetchAuthSession de Amplify v6.x

export interface UserProfile {
  userId?: string; // Cognito sub
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  profilePictureUrl?: string | null;
  favoriteCities?: string[];
  // Agrega aquí cualquier otro campo que tu perfil pueda tener
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // apiUrl ahora ya incluye /usuarios
  private apiUrl = environment.lambdaApiUrl; 

  // Agregamos un BehaviorSubject para que los componentes puedan suscribirse
  // y obtener el perfil actualizado en todo momento.
  private _userProfile = new BehaviorSubject<UserProfile | null>(null);
  userProfile$ = this._userProfile.asObservable(); // Observable público

  constructor(private http: HttpClient) {
    console.log('UserService inicializado. URL de Lambda:', this.apiUrl);
  }

  // Método para cargar el perfil del usuario y emitirlo a través del BehaviorSubject
  loadUserProfile(): Observable<UserProfile> {
    return from(fetchAuthSession()).pipe(
      switchMap(session => {
        if (!session.tokens?.idToken) {
          console.error('No ID token found in session. User not authenticated or session expired.');
          // Emitir un perfil básico para evitar errores en la UI cuando no hay token
          this._userProfile.next({
            userId: 'guest',
            displayName: 'Invitado',
            favoriteCities: []
          });
          return throwError(() => new Error('No authentication token available.'));
        }

        const idToken = session.tokens.idToken.toString();
        const headers = new HttpHeaders().set('Authorization', idToken);

        console.log('UserService: Obteniendo perfil de usuario con token...');
        return this.http.get<UserProfile>(`${this.apiUrl}`, { headers }).pipe(
          tap(profile => {
            this._userProfile.next(profile); // Emitir el perfil cargado
            console.log('Perfil de usuario cargado y emitido:', profile);
          })
        );
      }),
      catchError(error => {
        console.error('UserService: Error fetching user profile with token:', error);
        // En caso de error al cargar (ej. lambda no devuelve perfil), emitir básico
        this._userProfile.next({
          userId: 'error', // Indicar que hubo un error
          displayName: 'Error al Cargar',
          favoriteCities: []
        });
        return throwError(() => error);
      })
    );
  }

  updateUserProfile(profile: UserProfile): Observable<any> {
    return from(fetchAuthSession()).pipe(
      switchMap(session => {
        if (!session.tokens?.idToken) {
          console.error('No ID token found in session. Cannot update profile.');
          return throwError(() => new Error('No authentication token available for update.'));
        }

        const idToken = session.tokens.idToken.toString();
        const headers = new HttpHeaders().set('Authorization', idToken);

        console.log('UserService: Actualizando perfil de usuario con token...');
        return this.http.put<any>(`${this.apiUrl}`, profile, { headers }).pipe(
          tap(updatedProfile => {
            this._userProfile.next(updatedProfile); // Emitir el perfil actualizado
            console.log('Perfil de usuario actualizado y emitido:', updatedProfile);
          })
        );
      }),
      catchError(error => {
        console.error('UserService: Error updating user profile with token:', error);
        return throwError(() => error);
      })
    );
  }

  // Nuevo método para obtener el perfil actual síncronamente (último emitido)
  getCurrentUserProfile(): UserProfile | null {
    return this._userProfile.getValue();
  }

  /**
   * Método para actualizar el array de ciudades favoritas y guardar el perfil.
   * @param newCities El nuevo array completo de ciudades favoritas.
   * @returns Un Observable que emite el perfil actualizado.
   */
  updateFavoriteCities(newCities: string[]): Observable<UserProfile> {
    const currentProfile = this.getCurrentUserProfile();
    if (!currentProfile) {
      // Si no hay perfil cargado, podrías forzar una carga o manejarlo
      console.warn('No user profile available to update favorite cities. Returning error.');
      return throwError(() => new Error('No user profile loaded. Cannot update favorite cities.'));
    }

    const updatedProfileData: UserProfile = {
      ...currentProfile,
      favoriteCities: newCities
    };
    
    // Llama a updateUserProfile con los datos actualizados.
    // Asegúrate de que el Observable de updateUserProfile emita el UserProfile actualizado
    // o mapea su resultado a UserProfile si la Lambda devuelve otra cosa.
    return this.updateUserProfile(updatedProfileData).pipe(
        switchMap(() => this.userProfile$) // Después de actualizar, retorna el Observable del perfil para mantener la reactividad
    );
  }
}