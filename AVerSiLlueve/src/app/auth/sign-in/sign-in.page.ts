import { Component, inject, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/authentication.service';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit {

  //Inicializo firebase
  oApp = initializeApp(environment.firebase);

  // Initialize Firebase Authentication and get a reference to the service
  oAuth = getAuth(this.oApp);

  regForm: FormGroup | undefined;

  gEmail = "";
  gPassword = "";


  private _auth = inject(AuthenticationService);

  constructor(
    public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController,
    private roter : Router,
    public authService:AuthenticationService,
  ) { 
  }

  async ngOnInit() {
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

  async loginGoogle() {
    try {
      await this._auth.signInWithGoogle();

      this.roter.navigate(['/tabs']);

    } catch (error) {
      console.log(error);
    }


  }
  async login(){
    const loading = await this.loadingCtrl.create();
    await loading.present();

    try {      
      
      const user = await this.authService.loginUser(this.gEmail,this.gPassword)

      if(user){
        loading.dismiss();
        this.roter.navigate(['/tabs']);
      } else{
        console.log('Ingresar valores correctos');
      }
    
    } catch (error) {
      console.log(error);
      loading.dismiss();
    }
  }

/*   async llogin() {
    const auth = getAuth();
    signInWithEmailAndPassword(this.oAuth, this.gEmail, this.gPassword)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        // ...

      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
      });
  } */

}
