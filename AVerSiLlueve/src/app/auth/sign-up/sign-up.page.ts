
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular'; // Eliminamos ToastController si no se usa

// Importa tu AuthService unificado para interactuar con AWS Amplify Auth
import { AuthService } from 'src/app/services/authServices/auth.service'; // Ruta corregida

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  // FormGroup para el formulario de registro reactivo.
  regForm!: FormGroup;

  constructor(
    private alertCtrl: AlertController,     // Controlador para mostrar alertas al usuario
    private formBuilder: FormBuilder,       // Constructor de formularios reactivos de Angular
    private loadingCtrl: LoadingController, // Controlador para mostrar indicadores de carga
    private router: Router,                 // Router de Angular para navegación
    private authService: AuthService        // Tu servicio de autenticación con Amplify
    // private toastController: ToastController // Eliminado si no se utiliza en el código final
  ) { }

  ngOnInit() {
    // Inicializa el formulario de registro con sus controles y validaciones.
    // Los patrones de email y contraseña deben coincidir con las políticas de Cognito.
    this.regForm = this.formBuilder.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern("[a-z0-9._%+\\-]+@[a-z0-9.\\-]+\\.[a-z]{2,}$")
      ]],
      password: ['', [
        Validators.required,
        // Patrón de contraseña: Mínimo 8 caracteres, al menos 1 mayúscula, 1 número y 1 carácter especial.
        // ¡Importante que este patrón coincida con la política de Cognito para evitar errores!
        Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?`~ ]).{8,}$")
      ]]
    });
  }

  /**
   * Getter conveniente para acceder a los controles del formulario en la plantilla HTML.
   * Simplifica el acceso a los errores de validación (ej. errorControl['email'].errors).
   */
  get errorControl() {
    return this.regForm.controls;
  }

  /**
   * Muestra una alerta Ionic personalizada al usuario.
   * @param header El título de la alerta.
   * @param message El mensaje principal de la alerta.
   */
  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: ['Entendido'],
    });
    await alert.present();
  }

  /**
   * Maneja el proceso de registro de un nuevo usuario.
   * Valida el formulario, muestra un spinner de carga y llama al AuthService.
   */
  async registerUser() {
    // Si el formulario no es válido, muestra una alerta y detiene la función.
    if (this.regForm.invalid) {
      this.presentAlert('Formulario Inválido', 'Por favor, completa todos los campos correctamente.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Registrando usuario...',
    });
    await loading.present(); // Muestra el spinner de carga

    try {
      // Llama al método userSignUp de tu AuthService para registrar al usuario con Amplify.
      // El AuthService se encarga de la comunicación con Cognito.
      await this.authService.userSignUp(this.regForm.value.email, this.regForm.value.password);

      await loading.dismiss(); // Oculta el spinner tras el registro exitoso

      // Informa al usuario que el registro fue exitoso y que se envió un código.
      await this.presentAlert(
        'Registro Exitoso',
        'Se ha enviado un código de confirmación a tu correo electrónico. Por favor, confírmalo para iniciar sesión.'
      );

      // Redirige al usuario a la página de confirmación, pasando el email como parámetro de ruta.
      // Esto pre-llenará el campo de email en la página de confirmación.
      this.router.navigate(['/auth/confirm-sign-up', this.regForm.value.email]);

    } catch (error: any) {
      await loading.dismiss(); // Oculta el spinner si hay un error
      console.error('Error de registro con Amplify:', error); // Loguea el error completo para depuración

      let errorMessage = 'Ha ocurrido un error al registrar el usuario. Por favor, inténtalo de nuevo.';

      // Manejo de errores específicos de AWS Amplify/Cognito para dar feedback al usuario.
      if (error.name === 'UsernameExistsException') {
        errorMessage = 'Este correo electrónico ya está registrado. Por favor, inicia sesión o intenta con otro correo.';
      } else if (error.name === 'InvalidPasswordException') {
        errorMessage = 'Contraseña inválida. Asegúrate de que cumple con los requisitos: al menos 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial.';
      } else if (error.name === 'UserLambdaValidationException' && error.message.includes('password policy')) {
        // Este error puede ocurrir si hay validaciones de Lambda adicionales o si la política de Cognito no se cumple.
        errorMessage = 'La contraseña no cumple con los requisitos de seguridad. Asegúrate de incluir mayúsculas, minúsculas, números y símbolos.';
      } else if (error.name === 'CodeDeliveryFailureException') {
        errorMessage = 'No se pudo enviar el código de verificación al correo electrónico. Por favor, verifica que el email sea válido.';
      }

      this.presentAlert('Error de Registro', errorMessage); // Muestra la alerta al usuario
    }
  }

  // El método 'presentToast' se elimina si no se utiliza en el código final para mantener la limpieza.
  /*
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1500,
      position: 'top',
    });
    await toast.present();
  }
  */
}