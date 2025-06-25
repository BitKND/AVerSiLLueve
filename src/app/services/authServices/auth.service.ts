
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
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
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // BehaviorSubject para mantener el estado de autenticación de la aplicación.
  // Otros componentes pueden suscribirse a 'isAuthenticated' para reaccionar a los cambios de estado.
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated = this._isAuthenticated.asObservable();

  constructor(
    private router: Router, // Inyección del Router de Angular para la navegación
    private ngZone: NgZone // Inyección de NgZone para asegurar que las actualizaciones de UI se ejecuten en la zona de Angular
  ) {
    // Escucha eventos de autenticación de AWS Amplify a través del Hub.
    // El Hub es un mecanismo centralizado para eventos en Amplify.
    Hub.listen('auth', ({ payload }) => {
      // Usamos ngZone.run para asegurar que las actualizaciones de UI causadas por eventos del Hub
      // se ejecuten dentro del ciclo de detección de cambios de Angular.
      this.ngZone.run(() => {
        switch (payload.event) {
          case 'signedIn':
            // Cuando un usuario inicia sesión, actualiza el estado de autenticación a verdadero.
            this._isAuthenticated.next(true);
            // Redirige al usuario a la página principal de la aplicación (tabs).
            this.router.navigateByUrl('/tabs', { replaceUrl: true })
              .catch(error => {
                // Captura y loguea cualquier error que ocurra durante la navegación.
                console.error('ERROR de navegación a /tabs (Hub signedIn):', error);
              });
            break;

          case 'signedOut':
            // Cuando un usuario cierra sesión, actualiza el estado de autenticación a falso.
            this._isAuthenticated.next(false);
            // Redirige al usuario a la página de inicio de sesión.
            this.router.navigateByUrl('/sign-in', { replaceUrl: true });
            break;

          case 'signInWithRedirect_failure':
            // Maneja fallos en flujos de inicio de sesión con redirección (ej. OAuth).
            this._isAuthenticated.next(false);
            this.router.navigateByUrl('/sign-in', { replaceUrl: true });
            break;

          // 'signInWithRedirect' y 'default' se mantienen para depuración de flujo OAuth o eventos no manejados.
          // En producción, podrían ser menos detallados o eliminarse si no se usan.
          case 'signInWithRedirect':
            // Este evento indica que una redirección OAuth se ha completado,
            // pero el evento 'signedIn' es el que confirma la autenticación.
            break;

          default:
            // Loguea cualquier otro evento del Hub de autenticación que no esté manejado explícitamente.
            break;
        }
      });
    });

    // Llama a checkAuthState al iniciar el servicio para verificar si ya hay una sesión activa.
    this.checkAuthState();
  }

  /**
   * Verifica el estado actual de autenticación del usuario.
   * Si encuentra una sesión activa, actualiza el estado de autenticación y redirige
   * si el usuario está en una página de autenticación (para evitar que se quede allí).
   */
  async checkAuthState() {
    try {
      const { tokens } = await fetchAuthSession(); // Intenta obtener los tokens de la sesión actual
      this.ngZone.run(() => {
        if (tokens && tokens.accessToken) {
          // Si hay tokens de acceso, el usuario está autenticado.
          this._isAuthenticated.next(true);
          // Si el usuario autenticado está en una ruta de autenticación (login, registro, etc.),
          // redirige a la página principal de la aplicación.
          if (this.router.url.startsWith('/sign-in') || this.router.url.startsWith('/sign-up') || this.router.url.startsWith('/reset-password') || this.router.url.startsWith('/auth/confirm-sign-up')) {
            this.router.navigateByUrl('/tabs', { replaceUrl: true })
              .catch(error => {
                console.error('ERROR de navegación a /tabs (checkAuthState):', error);
              });
          }
        } else {
          // Si no hay tokens activos, el usuario no está autenticado.
          this._isAuthenticated.next(false);
          // Si el usuario no autenticado NO está en una ruta de autenticación,
          // redirige a la página de inicio de sesión.
          if (!this.router.url.startsWith('/sign-in') && !this.router.url.startsWith('/sign-up') && !this.router.url.startsWith('/reset-password') && !this.router.url.startsWith('/auth/confirm-sign-up')) {
            this.router.navigateByUrl('/sign-in', { replaceUrl: true });
          }
        }
      });
    } catch (error) {
      // Si ocurre un error al intentar obtener la sesión (ej. no hay sesión),
      // se asume que el usuario no está autenticado.
      this.ngZone.run(() => {
        this._isAuthenticated.next(false);
        console.error('AuthService: Error al verificar sesión o no hay sesión:', error);
        // Si hay un error y el usuario no está en una página de autenticación, redirige al login.
        if (!this.router.url.startsWith('/sign-in') && !this.router.url.startsWith('/sign-up') && !this.router.url.startsWith('/reset-password') && !this.router.url.startsWith('/auth/confirm-sign-up')) {
          this.router.navigateByUrl('/sign-in', { replaceUrl: true });
        }
      });
    }
  }

  /**
   * Registra un nuevo usuario en Amazon Cognito.
   * @param email El correo electrónico del usuario, usado como 'username' y atributo 'email'.
   * @param password La contraseña del usuario.
   * @returns Una promesa con la respuesta de Amplify.
   */
  async userSignUp(email: string, password: string): Promise<any> {
    return signUp({
      username: email,
      password: password,
      options: {
        userAttributes: {
          email: email, // El atributo de email es importante para la verificación
        },
      },
    });
  }

  /**
   * Confirma la cuenta de un usuario recién registrado utilizando el código de verificación.
   * @param username El nombre de usuario (email en este caso) del usuario a confirmar.
   * @param code El código de confirmación recibido por correo electrónico.
   * @returns Una promesa con la respuesta de Amplify.
   */
  async userConfirmSignUp(username: string, code: string): Promise<any> {
    return confirmSignUp({ username: username, confirmationCode: code });
  }

  /**
   * Reenvía un código de verificación de registro a un usuario.
   * Útil si el usuario no recibió el código inicial o este expiró.
   * @param username El nombre de usuario (email) al que reenviar el código.
   * @returns Una promesa con la respuesta de Amplify.
   */
  async resendSignUpCode(username: string): Promise<any> {
    return resendSignUpCode({ username: username });
  }

  /**
   * Inicia sesión de un usuario en Amazon Cognito.
   * @param email El correo electrónico del usuario (username).
   * @param password La contraseña del usuario.
   * @returns Una promesa con la respuesta de Amplify.
   */
  async userSignIn(email: string, password: string): Promise<any> {
    return signIn({ username: email, password: password });
  }

  /**
   * Cierra la sesión del usuario actual en Amazon Cognito.
   * @returns Una promesa que se resuelve cuando la sesión ha sido cerrada.
   */
  async logout(): Promise<void> { // Cambiado a 'void' porque no devuelve un valor útil directamente
  console.log('AuthService: Iniciando proceso de Auth.signOut().'); // Log para depuración
  try {
    await signOut(); // Esta es la llamada a la función de Amplify Auth
    console.log('AuthService: Auth.signOut() completado exitosamente.'); // Log de éxito
  } catch (error: any) {
    console.error('AuthService: Error durante Auth.signOut():', error); // Log de error
    throw error; // Re-lanza el error para que el componente que llama lo maneje
  }
}

  /**
   * Inicia el flujo de recuperación de contraseña.
   * Envía un código de verificación al correo/teléfono registrado del usuario.
   * @param username El nombre de usuario (email) para el cual resetear la contraseña.
   * @returns Una promesa con la respuesta de Amplify.
   */
  async userResetPassword(username: string): Promise<any> {
    return resetPassword({ username: username });
  }

  /**
   * Confirma la nueva contraseña para un usuario.
   * @param username El nombre de usuario (email).
   * @param confirmationCode El código de verificación recibido para el reseteo de contraseña.
   * @param newPassword La nueva contraseña a establecer.
   * @returns Una promesa con la respuesta de Amplify.
   */
  async userConfirmResetPassword(username: string, confirmationCode: string, newPassword: string): Promise<any> {
    return confirmResetPassword({ username: username, confirmationCode: confirmationCode, newPassword: newPassword });
  }

  /**
   * Obtiene la información del usuario actualmente autenticado.
   * @returns Una promesa que resuelve con los datos del usuario o null si no hay usuario autenticado.
   */
  async getCurrentAuthenticatedUser(): Promise<any | null> {
    try {
      const user = await getCurrentUser();
      return user;
    } catch (error) {
      // Es común que aquí se capture un error si no hay usuario autenticado,
      // por lo que solo se loguea como un error informativo.
      console.error('Error al obtener el usuario actual (posiblemente no autenticado):', error);
      return null;
    }
  }
}