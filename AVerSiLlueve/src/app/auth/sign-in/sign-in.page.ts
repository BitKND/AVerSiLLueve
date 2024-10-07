import { Component, inject, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/authentication.service';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { environment } from 'src/environments/environment';



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

  gEmail = "";
  gPassword = "";


  private _auth = inject(AuthenticationService);

  constructor() { }

  async ngOnInit() {
  }

  async loginGoogle() {
    try {
      await this._auth.signInWithGoogle();


    } catch (error) {
      console.log('Ocurrio un error');
    }
  }

  async login() {
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
  }

}
