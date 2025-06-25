
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/authServices/auth.service'; // Ruta corregida a tu AuthService

@Component({
  selector: 'app-confirm-sign-up',
  templateUrl: './confirm-sign-up.page.html',
  styleUrls: ['./confirm-sign-up.page.scss'],
})
export class ConfirmSignUpPage implements OnInit {
  // FormGroup para el formulario de confirmación.
  confirmForm!: FormGroup;
  // Almacena el email para pre-llenar el campo o para reenvío de código.
  email: string = '';

  constructor(
    private fb: FormBuilder,              // Constructor de formularios reactivos de Angular
    private authService: AuthService,     // Tu servicio de autenticación con Amplify
    private router: Router,               // Router de Angular para navegación
    private activatedRoute: ActivatedRoute, // Para acceder a los parámetros de la ruta
    private loadingController: LoadingController, // Para mostrar indicadores de carga
    private alertController: AlertController      // Para mostrar alertas al usuario
  ) { }

  ngOnInit() {
    // Inicializa el formulario de confirmación con sus controles y validaciones.
    this.confirmForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      // El código de confirmación de Cognito es usualmente de 6 dígitos.
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    // Suscribe para leer el email pasado como parámetro de la ruta.
    // Esto permite pre-llenar el campo de email si el usuario viene de la página de registro.
    this.activatedRoute.paramMap.subscribe(params => {
      // Accede al parámetro por su nombre 'email' (definido en app-routing.module.ts como ':email').
      const passedEmail = params.get('email');
      if (passedEmail) {
        this.email = passedEmail;
        this.confirmForm.get('email')?.setValue(passedEmail); // Pre-llena el campo del formulario
      }
    });
  }

  /**
   * Getter conveniente para acceder a los controles del formulario en la plantilla HTML.
   * Simplifica el acceso a los errores de validación (ej. errorControl['email'].errors).
   */
  get errorControl() {
    return this.confirmForm.controls;
  }

  /**
   * Maneja el proceso de confirmación de una cuenta de usuario con el código recibido.
   * Valida el formulario, muestra un spinner de carga y llama al AuthService.
   */
  async confirmSignUp() {
    if (this.confirmForm.invalid) {
      this.presentAlert('Error', 'Por favor, ingresa un correo electrónico válido y el código de confirmación de 6 dígitos.');
      return;
    }

    const { email, code } = this.confirmForm.value;
    const loading = await this.loadingController.create({
      message: 'Confirmando cuenta...',
    });
    await loading.present(); // Muestra el spinner de carga

    try {
      // Llama al método userConfirmSignUp de tu AuthService para confirmar la cuenta con Amplify.
      await this.authService.userConfirmSignUp(email, code);
      await loading.dismiss(); // Oculta el spinner tras la confirmación exitosa

      await this.presentAlert('Cuenta Confirmada', 'Tu cuenta ha sido confirmada exitosamente. ¡Ya puedes iniciar sesión!');
      // Redirige al usuario a la página de inicio de sesión.
      // `replaceUrl: true` evita que el usuario pueda volver a esta página usando el botón de atrás.
      this.router.navigateByUrl('/sign-in', { replaceUrl: true });

    } catch (error: any) {
      await loading.dismiss(); // Oculta el spinner si hay un error
      console.error('Error al confirmar registro:', error); // Loguea el error completo para depuración

      let errorMessage = 'Ha ocurrido un error al confirmar tu cuenta. Por favor, inténtalo de nuevo.';

      // Manejo de errores específicos de AWS Amplify/Cognito para dar feedback al usuario.
      if (error.name === 'CodeMismatchException') {
        errorMessage = 'Código de confirmación incorrecto. Verifica el código que recibiste en tu correo.';
      } else if (error.name === 'ExpiredCodeException') {
        errorMessage = 'El código de confirmación ha expirado. Por favor, solicita un nuevo código.';
      } else if (error.name === 'UserNotFoundException') {
        errorMessage = 'Usuario no encontrado. Asegúrate de que el correo electrónico es correcto.';
      } else if (error.name === 'LimitExceededException') {
        errorMessage = 'Demasiados intentos. Por favor, espera y vuelve a intentarlo.';
      } else if (error.name === 'NotAuthorizedException') {
        errorMessage = 'Este usuario ya ha sido confirmado. Por favor, inicia sesión.';
      }

      this.presentAlert('Error de Confirmación', errorMessage); // Muestra la alerta al usuario
    }
  }

  /**
   * Maneja el reenvío de un nuevo código de confirmación al email del usuario.
   * Valida que el email sea válido y llama al AuthService.
   */
  async resendCode() {
    // Valida solo el campo de email antes de intentar reenviar el código.
    if (this.confirmForm.get('email')?.invalid) {
      this.presentAlert('Error', 'Por favor, ingresa un correo electrónico válido para reenviar el código.');
      return;
    }

    const email = this.confirmForm.value.email;
    const loading = await this.loadingController.create({
      message: 'Reenviando código...',
    });
    await loading.present(); // Muestra el spinner de carga

    try {
      // Llama al método resendSignUpCode de tu AuthService para reenviar el código con Amplify.
      await this.authService.resendSignUpCode(email);
      await loading.dismiss(); // Oculta el spinner
      this.presentAlert('Código Reenviado', 'Se ha enviado un nuevo código de confirmación a tu correo electrónico.');
    } catch (error: any) {
      await loading.dismiss(); // Oculta el spinner si hay un error
      console.error('Error al reenviar código:', error); // Loguea el error completo para depuración

      let errorMessage = 'No se pudo reenviar el código. Asegúrate de que el correo es correcto y la cuenta existe.';

      // Manejo de errores específicos de AWS Amplify/Cognito para el reenvío de código.
      if (error.name === 'UserNotFoundException') {
        errorMessage = 'Usuario no encontrado. Asegúrate de que el correo electrónico es correcto.';
      } else if (error.name === 'LimitExceededException') {
        errorMessage = 'Has solicitado demasiados códigos. Por favor, espera unos minutos antes de intentarlo de nuevo.';
      } else if (error.name === 'InvalidParameterException') {
        errorMessage = 'Correo electrónico no válido o cuenta ya confirmada. Por favor, verifica tu email.';
      }

      this.presentAlert('Error al Reenviar Código', errorMessage); // Muestra la alerta al usuario
    }
  }

  /**
   * Muestra una alerta Ionic genérica al usuario.
   * @param header El título de la alerta.
   * @param message El mensaje principal de la alerta.
   */
  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}