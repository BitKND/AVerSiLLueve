import { Component, inject, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authServices/authentication.service';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';


@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit {

  //Inicializo firebase
  //oApp = initializeApp(environment.firebase);

  // Initialize Firebase Authentication and get a reference to the service
  //oAuth = getAuth(this.oApp);

  loginForm: FormGroup;


  private _auth = inject(AuthenticationService);

  constructor(
    private navCtrl:NavController,
    private alert: AlertController,
    public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController,
    private roter : Router,
    public authService:AuthenticationService,
  ) { 
  }
//Se establecen los patrones a cumplir en email y contraseña
  async ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email:['', [
        Validators.required,
        Validators.email,
        Validators.pattern("[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$")
      ]],
      password:['',[
      Validators.required,
      Validators.pattern("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-8])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}")
    ]]
    })
  }

  get errorControl(){
    return this.loginForm.controls;
  }

    /*El try catch intenta hacer uso de signinwithgoogle declarado en authenthication service, si es correcto se abre el pop up
  para elegir la cuenta de google con la cual iniciar sesion.
  En el caso de algun error, el catch lo atrapa y se muestra por consola que ocurrio un error
  Se agrega una flag almacenada en localstorage llamada 'ingresado'. Se hace uso de esto para establecer los guards y no permitir ingreso a la app sin iniciar sesion*/
  async loginGoogle() {
    try {
      await this._auth.signInWithGoogle();

      localStorage.setItem('ingresado','true');
      this.roter.navigate(['/tabs/tab1']);

    } catch (error) {
      console.log(error);
    }


  }
  async alertaBasica(){

    const alert = await this.alert.create({
      header: 'Email o contraseña incorrectos',
      message: 'Por favor ingrese un email o contraseña validos',
      buttons: ['Entendido'],

    });
     alert.present();
  }

  /*Creamos una constante "loading" (instancia de carga), mientras cargue se inicia el try catch
  Si el user es correcto, el loading se cierra y la aplicación se redirige a la pagina de inicio "tabs"
  En caso de ser valores erroneos, devuelve alerta de aviso
  Si el error es otro, el catch lo atrapa y lo muestra por consola cerrando el loading tambien
  Se agrega una flag almacenada en localstorage llamada 'ingresado'. Se hace uso de esto para establecer los guards y no permitir ingreso a la app sin iniciar sesion*/
  async login(){
    const loading = await this.loadingCtrl.create();
    await loading.present();

    try {      
      
      const user = await this.authService.loginUser(this.loginForm.value.email,this.loginForm.value.password)

      if(user){
        loading.dismiss();
        localStorage.setItem('ingresado','true');
        this.roter.navigate(['/tabs/tab1']);
        
      } else{
        this.alertaBasica();
      }
    
    } catch (error) {
      console.log(error);
      this.alertaBasica();
      loading.dismiss();
    }
  }



}