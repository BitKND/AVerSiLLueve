import { Component, OnInit, inject } from '@angular/core';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { AuthenticationService } from 'src/app/services/authServices/authentication.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  regForm: FormGroup | undefined;

  
  private _auth = inject(AuthenticationService);

  gEmail = "";
  gPassword = "";

  //Declaramos las clases en el constructor que vamos a utilizar acorde a los modulos.

  constructor(
    public alert: AlertController,
    //public regForm: FormGroup,
    public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController,
    private roter : Router,
    public authService:AuthenticationService,
    
    ) { }
// Hacemos uso de validadores para establecer patrones a cumplir en el mail y contraseña
// El patron del mail debe cumplir characters@characters.domain
// El patron de la contraseña: 8 caracteres, y al menos 1 mayuscula y 1 numero
  ngOnInit() {
    this.regForm = this.formBuilder.group({
      email:['', [
        Validators.required,
        Validators.email,
        Validators.pattern("[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$")
      ]],
      password:["",
      Validators.required,
      Validators.pattern("(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}")
    ]
    })
  }

  get errorControl(){
    return this.regForm?.controls;
  }


  async alertaBasica(){

    const alert = await this.alert.create({
      header: 'Email o contraseña incorrectos',
      message: 'Email debe ser tipo characters@characters.com. La contraseña debe tener 8 caracteres, y al menos 1 mayuscula y 1 numero',
      buttons: ['Entendido'],

    });
    await alert.present();
  }

/*Creamos una constante "loading" (instancia de carga), mientras cargue se inicia el try catch
  Si el user es correcto, el loading se cierra y la aplicación se redirige a la pagina de inicio "tabs"
  En caso de ser valores erroneos, devuelve alerta de aviso
  Si el error es otro, el catch lo atrapa y lo muestra por consola cerrando el loading tambien*/
  async registerUser(){

    const loading = await this.loadingCtrl.create();
    await loading.present();

    try {      
      
       const user = await this.authService.registerUser(this.gEmail,this.gPassword)

      if(user){
        loading.dismiss();
        this.roter.navigate(['/sign-in']);
      } else{
        this.alertaBasica();
      }
    
    } catch (error) {
      console.log(error);
      this.alertaBasica();
      loading.dismiss();
    }

    
    
  }
  /*El try catch intenta hacer uso de signinwithgoogle declarado en authenthication service, si es correcto se abre el pop up
  para elegir la cuenta de google con la cual iniciar sesion.
  En el caso de algun error, el catch lo atrapa y se muestra por consola que ocurrio un error*/
  async loginGoogle(){
    try {
      await this.authService.signInWithGoogle();
      this.roter.navigate(['/tabs/tab2']);

    } catch (error) {
      console.log(error);
    }
  }

}
