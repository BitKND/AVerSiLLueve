
import { Component, OnInit } from '@angular/core'; // <--- Asegúrate que Component esté importado
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/authServices/auth.service';// Tu AuthService

@Component({ // <--- ¡ESTE DECORADOR ES CRUCIAL Y DEBE ESTAR BIEN!
  selector: 'app-confirm-sign-up',
  templateUrl: './confirm-sign-up.page.html', // <--- Revisa que esta ruta sea EXACTA
  styleUrls: ['./confirm-sign-up.page.scss'],
})
export class ConfirmSignUpPage implements OnInit {
  confirmForm!: FormGroup;
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.confirmForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]] // Código de 6 dígitos
    });

    this.activatedRoute.paramMap.subscribe(params => {
      const passedEmail = params.get('0'); // '0' para el primer parámetro posicional de la ruta
      if (passedEmail) {
        this.email = passedEmail;
        this.confirmForm.get('email')?.setValue(passedEmail);
      }
    });
  }

  get errorControl() {
    return this.confirmForm.controls;
  }

  async confirmSignUp() {
    if (this.confirmForm.invalid) {
      this.presentAlert('Error', 'Por favor, ingresa un correo electrónico válido y el código de confirmación de 6 dígitos.');
      return;
    }

    const { email, code } = this.confirmForm.value;
    const loading = await this.loadingController.create({
      message: 'Confirmando cuenta...',
    });
    await loading.present();

    try {
      await this.authService.userConfirmSignUp(email, code);
      loading.dismiss();
      await this.presentAlert('Cuenta Confirmada', 'Tu cuenta ha sido confirmada exitosamente. ¡Ya puedes iniciar sesión!');
      this.router.navigateByUrl('/sign-in', { replaceUrl: true }); // Redirige al login
    } catch (error: any) {
      loading.dismiss();
      console.error('Error al confirmar registro:', error);
      let errorMessage = 'Ha ocurrido un error al confirmar tu cuenta. Por favor, inténtalo de nuevo.';

      if (error.code === 'CodeMismatchException') {
        errorMessage = 'Código de confirmación incorrecto. Verifica el código que recibiste en tu correo.';
      } else if (error.code === 'ExpiredCodeException') {
        errorMessage = 'El código de confirmación ha expirado. Por favor, solicita un nuevo código.';
      } else if (error.code === 'UserNotFoundException') {
        errorMessage = 'Usuario no encontrado. Asegúrate de que el correo electrónico es correcto.';
      } else if (error.code === 'LimitExceededException') {
        errorMessage = 'Demasiados intentos. Por favor, espera y vuelve a intentarlo.';
      }

      this.presentAlert('Error de Confirmación', errorMessage);
    }
  }

  async resendCode() {
    if (this.confirmForm.get('email')?.invalid) {
      this.presentAlert('Error', 'Por favor, ingresa un correo electrónico válido para reenviar el código.');
      return;
    }

    const email = this.confirmForm.value.email;
    const loading = await this.loadingController.create({
      message: 'Reenviando código...',
    });
    await loading.present();

    try {
      await this.authService.resendSignUpCode(email);
      loading.dismiss();
      this.presentAlert('Código Reenviado', 'Se ha enviado un nuevo código de confirmación a tu correo electrónico.');
    } catch (error: any) {
      loading.dismiss();
      console.error('Error al reenviar código:', error);
      let errorMessage = 'No se pudo reenviar el código. Asegúrate de que el correo es correcto y la cuenta existe.';

      if (error.code === 'UserNotFoundException') {
        errorMessage = 'Usuario no encontrado. Asegúrate de que el correo electrónico es correcto.';
      } else if (error.code === 'LimitExceededException') {
        errorMessage = 'Has solicitado demasiados códigos. Por favor, espera unos minutos antes de intentarlo de nuevo.';
      }

      this.presentAlert('Error al Reenviar Código', errorMessage);
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}