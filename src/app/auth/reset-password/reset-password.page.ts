import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authServices/authentication.service';
import { AuthService } from 'src/app/services/authServices/auth.service';
import { AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {

  //email:string;
  loginForm!: FormGroup;

  constructor(
    public authService: AuthService,
    public route: Router,
    private formBuilder: FormBuilder,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {

      this.loginForm = this.formBuilder.group({
          email: ['', [
            Validators.required,        // El email es requerido
            Validators.email,           // Debe ser un formato de email válido
            Validators.pattern("[a-z0-9._%+\\-]+@[a-z0-9.\\-]+\\.[a-z]{2,}$") // Patrón regex para validación de email
          ]]}); 
  }

     get errorControl() {
    return this.loginForm.controls;
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

  async resetPassword(){
    this.authService.userResetPassword(this.loginForm.value.email).then(()=>{

      this.showAlert('Se ha enviado el reset de password', 'Por favor revisa tu mail');

      console.log('reset link sent');
      this.route.navigate(['/sign-in'])
    }).catch((error)=>{
      console.log(error);
    })  
  }

}
