// src/app/services/authServices/auth.service.ts
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, from, Observable } from 'rxjs';
import {
  signUp,
  signIn,
  confirmSignUp,
  fetchAuthSession,
  signOut,
  getCurrentUser,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  fetchUserAttributes,
  signInWithRedirect 
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

// Interfaz para el usuario autenticado que emitiremos
export interface AuthenticatedUser {
  userId: string | null; // El 'sub' de Cognito
  email: string | null;
  // Puedes añadir otras propiedades aquí si las necesitas, como displayName de Cognito
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated = this._isAuthenticated.asObservable();

  // NUEVO: BehaviorSubject para el usuario autenticado completo (incluyendo email)
  private _authenticatedUser = new BehaviorSubject<AuthenticatedUser | null>(null);
  authenticatedUser$: Observable<AuthenticatedUser | null> = this._authenticatedUser.asObservable();

  constructor(
    private router: Router,
    private ngZone: NgZone
  ) {
    Hub.listen('auth', ({ payload }) => {
      this.ngZone.run(() => {
        switch (payload.event) {
          case 'signedIn':
            this._isAuthenticated.next(true);
            // Al firmar, también actualiza el BehaviorSubject del usuario autenticado
            this.updateAuthenticatedUser(); 
            this.router.navigateByUrl('/tabs', { replaceUrl: true }).catch(error => {
              console.error('ERROR de navegación a /tabs (Hub signedIn):', error);
            });
            break;
          case 'signedOut':
            this._isAuthenticated.next(false);
            this._authenticatedUser.next(null); // Limpiar el usuario al cerrar sesión
            this.router.navigateByUrl('/sign-in', { replaceUrl: true });
            break;
          case 'signInWithRedirect_failure':
            this._isAuthenticated.next(false);
            this._authenticatedUser.next(null);
            this.router.navigateByUrl('/sign-in', { replaceUrl: true });
            break;
          case 'signInWithRedirect':
            break;
          default:
            break;
        }
      });
    });
    this.checkAuthState();
  }

  async checkAuthState() {
    try {
      const { tokens } = await fetchAuthSession();
      this.ngZone.run(() => {
        if (tokens && tokens.accessToken) {
          this._isAuthenticated.next(true);
          this.updateAuthenticatedUser(); // Actualiza el usuario autenticado si ya está logueado
          if (this.router.url.startsWith('/sign-in') || this.router.url.startsWith('/sign-up') || this.router.url.startsWith('/reset-password') || this.router.url.startsWith('/auth/confirm-sign-up')) {
            this.router.navigateByUrl('/tabs', { replaceUrl: true }).catch(error => {
              console.error('ERROR de navegación a /tabs (checkAuthState):', error);
            });
          }
        } else {
          this._isAuthenticated.next(false);
          this._authenticatedUser.next(null);
          if (!this.router.url.startsWith('/sign-in') && !this.router.url.startsWith('/sign-up') && !this.router.url.startsWith('/reset-password') && !this.router.url.startsWith('/auth/confirm-sign-up')) {
            this.router.navigateByUrl('/sign-in', { replaceUrl: true });
          }
        }
      });
    } catch (error) {
      this.ngZone.run(() => {
        this._isAuthenticated.next(false);
        this._authenticatedUser.next(null);
        console.error('AuthService: Error al verificar sesión o no hay sesión:', error);
        if (!this.router.url.startsWith('/sign-in') && !this.router.url.startsWith('/sign-up') && !this.router.url.startsWith('/reset-password') && !this.router.url.startsWith('/auth/confirm-sign-up')) {
          this.router.navigateByUrl('/sign-in', { replaceUrl: true });
        }
      });
    }
  }

  // NUEVO MÉTODO para actualizar el _authenticatedUser BehaviorSubject
  private async updateAuthenticatedUser(): Promise<void> {
    try {
      const user = await getCurrentUser();
      const userAttributes = await fetchUserAttributes(); // La forma más fiable de obtener atributos
      
      this._authenticatedUser.next({
        userId: user.userId, // El 'sub' de Cognito
        email: userAttributes.email || null // Obtener el email del atributo
      });
    } catch (error) {
      console.error('AuthService: Error al obtener y actualizar info de usuario autenticado:', error);
      this._authenticatedUser.next(null);
    }
  }

  async userSignUp(email: string, password: string): Promise<any> {
    return signUp({
      username: email,
      password: password,
      options: {
        userAttributes: {
          email: email,
        },
      },
    });
  }

  async userConfirmSignUp(username: string, code: string): Promise<any> {
    return confirmSignUp({ username: username, confirmationCode: code });
  }

  async resendSignUpCode(username: string): Promise<any> {
    return resendSignUpCode({ username: username });
  }

  async userSignIn(email: string, password: string): Promise<any> {
    const result = await signIn({ username: email, password: password });
    if (result.isSignedIn) {
      // Si el inicio de sesión es exitoso, actualiza el usuario autenticado
      this.updateAuthenticatedUser(); 
    }
    return result;
  }

  async logout(): Promise<void> {
    console.log('AuthService: Iniciando proceso de signOut().');
    try {
      await signOut();
      this._authenticatedUser.next(null); // Asegurarse de limpiar el usuario autenticado
      console.log('AuthService: signOut() completado exitosamente.');
    } catch (error: any) {
      console.error('AuthService: Error durante signOut():', error);
      throw error;
    }
  }

  async userResetPassword(username: string): Promise<any> {
    return resetPassword({ username: username });
  }

  async userConfirmResetPassword(username: string, confirmationCode: string, newPassword: string): Promise<any> {
    return confirmResetPassword({ username: username, confirmationCode: confirmationCode, newPassword: newPassword });
  }

  async loginWithGoogle(): Promise<void> {
    try {

      await signInWithRedirect({ provider: 'Google' });

    } catch (error) {
      console.error('AuthService: Error al iniciar sesión con Google:', error);
   
      throw error; 
    }
  }

  
}