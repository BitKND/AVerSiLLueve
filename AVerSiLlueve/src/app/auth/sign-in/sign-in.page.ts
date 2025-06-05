
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, AlertController, NavController } from '@ionic/angular';

// Importa tu AuthService unificado para interactuar con AWS Amplify Auth
import { AuthService } from  'src/app/services/authServices/auth.service';
import { AuthenticationService } from 'src/app/services/authServices/authentication.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit {



  // FormGroup para el formulario de inicio de sesión
  loginForm!: FormGroup;

  private _auth = inject(AuthenticationService);

  constructor(
    private navCtrl: NavController,       // Controlador de navegación de Ionic (útil para pop, push)
    private alertCtrl: AlertController,   // Controlador para mostrar alertas al usuario
    private formBuilder: FormBuilder,     // Constructor de formularios reactivos de Angular
    private loadingCtrl: LoadingController, // Controlador para mostrar indicadores de carga
    private router: Router,               // Router de Angular para navegación
    private authService: AuthService,     // Tu servicio de autenticación con Amplify
  ) { }

  ngOnInit() {
    // Inicializa el formulario de inicio de sesión con sus controles y validaciones.
    this.loginForm = this.formBuilder.group({
      email: ['', [
        Validators.required,        // El email es requerido
        Validators.email,           // Debe ser un formato de email válido
        Validators.pattern("[a-z0-9._%+\\-]+@[a-z0-9.\\-]+\\.[a-z]{2,}$") // Patrón regex para validación de email
      ]],
      password: ['', [
        Validators.required,        // La contraseña es requerida
        Validators.minLength(8)     // Longitud mínima para la contraseña.
        // No se requiere un patrón estricto aquí; Cognito valida la complejidad.
      ]]
    });
  }

  /**
   * Getter conveniente para acceder a los controles del formulario en la plantilla HTML.
   * Simplifica el acceso a los errores de validación.
   */
  get errorControl() {
    return this.loginForm.controls;
  }

/*   async loginGoogle() {
    try {
      await this._auth.signInWithGoogle();

      
      this.router.navigate(['/tabs/tab1']);

    } catch (error) {
      console.log(error);
    }


  } */

  /**
   * Maneja el intento de inicio de sesión con Google.
   * La integración de Google Sign-In con Amplify/Cognito requiere configuración adicional (proveedor de identidad).
   * Por ahora, solo muestra un mensaje informativo.
   */
   async loginGoogle() {
    const alert = await this.alertCtrl.create({
      header: 'Google Sign-In',
      message: 'La integración de Google Sign-In con AWS Amplify/Cognito requiere configuración adicional en la consola de AWS (proveedores de identidad). Esta funcionalidad está deshabilitada temporalmente.',
      buttons: ['Entendido'],
    });
    await alert.present();
  } 

  /**
   * Muestra una alerta Ionic personalizada al usuario.
   * @param header El título de la alerta.
   * @param message El mensaje principal de la alerta.
   */
  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: ['Entendido'],
    });
    await alert.present();
  }

  /**
   * Maneja el proceso de inicio de sesión con email y contraseña.
   * Valida el formulario, muestra un spinner de carga y llama al AuthService.
   */
  async login() {
    const loading = await this.loadingCtrl.create({
      message: 'Iniciando sesión...',
    });
    await loading.present();

    if (this.loginForm.invalid) {
      await loading.dismiss();
      this.showAlert('Formulario inválido', 'Por favor, ingrese un correo electrónico y contraseña válidos.');
      return;
    }

    const { email, password } = this.loginForm.value;

    try {
      // Llama al método userSignIn de tu AuthService para autenticar al usuario con Amplify.
      await this.authService.userSignIn(email, password);

      // Si la llamada a userSignIn es exitosa, el AuthService ya maneja la redirección
      // a '/tabs' a través de su Hub Listener y el AuthGuard.
      // Por lo tanto, no se necesita una redirección explícita aquí.

      await loading.dismiss();

    } catch (error: any) {
      await loading.dismiss();
      let errorMessage = 'Ha ocurrido un error al iniciar sesión. Por favor, intenta de nuevo.';

      // Manejo de errores específicos de AWS Amplify/Cognito para dar feedback al usuario.
      if (error.name === 'UserNotFoundException' || error.name === 'NotAuthorizedException') {
        errorMessage = 'Credenciales inválidas. Usuario o contraseña incorrectos.';
      } else if (error.name === 'UserNotConfirmedException') {
        errorMessage = 'Tu cuenta no ha sido confirmada. Por favor, confirma tu correo electrónico.';
        // Opcional: Podrías redirigir al usuario a la página de confirmación de registro aquí
        // para que pueda confirmar o reenviar el código.
        // this.router.navigateByUrl('/auth/confirm-sign-up', { state: { email: email } });
      } else if (error.name === 'EmptySignInUsername' || error.name === 'EmptySignInPassword') {
        errorMessage = 'El correo electrónico y la contraseña no pueden estar vacíos.';
      } else if (error.name === 'LimitExceededException') {
        errorMessage = 'Demasiados intentos fallidos. Por favor, espera un momento y vuelve a intentarlo.';
      } else {
        errorMessage = `Error de autenticación: ${error.message || 'Error desconocido'}`;
      }

      this.showAlert('Fallo al iniciar sesión', errorMessage);
      console.error('Error al iniciar sesión con Amplify:', error);
    }
  }

  /**
   * Navega a la página de registro de usuarios.
   */
  goToSignUp() {
    this.router.navigateByUrl('/sign-up');
  }

  /**
   * Navega a la página de recuperación de contraseña.
   */
  goToResetPassword() {
    this.router.navigateByUrl('/reset-password');
  }
}

