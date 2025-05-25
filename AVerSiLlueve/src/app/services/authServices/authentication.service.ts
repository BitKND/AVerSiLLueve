import { inject, Injectable } from '@angular/core';
import { initializeApp } from '@angular/fire/app';
import { Auth, GoogleAuthProvider, signInWithPopup} from '@angular/fire/auth';

import {AngularFireAuth} from '@angular/fire/compat/auth'; 
import { Amplify } from "aws-amplify";
import  config from 'config.json';

import { signIn } from '@aws-amplify/auth';




@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {


    constructor() { 
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: config.amplify.userPooolId,
          userPoolClientId: config.amplify.userPoolClientId
        }
      }
    });
  }

   async logIn(userName: string, password: string){
    const signInResult = await signIn({
      username: userName,
      password: password
    })
    return signInResult;
  }



 
  //Declaramos variable auth para usarse posteriormente en el login de google.
 // private _auth = inject(Auth);

  //Declaramos la clase ngFireAuth que utilizara el modulo AngularFireAuth
  


  //constructor(public ngFireAuth:AngularFireAuth){}

/*   //Funcion que toma mail y contraseña para el registro
  async registerUser(email: string, password: string){
    return await this.ngFireAuth['createUserWithEmailAndPassword'](email, password);
  }
  //Funcion que toma mail y contraseña para ingresar a la app
  async loginUser(email: string, password: string){
    return await this.ngFireAuth['signInWithEmailAndPassword'](email, password);
  }
  //Funcion para reestablecer contraseña a traves del mail
  async resetPassword(email: string){
    return await this.ngFireAuth['sendPasswordResetEmail'](email);
  }
  //Funcion para cerrar sesion
  async signOut(){
    return await this.ngFireAuth['signOut']();
    
  }
  //Funcion para obtener datos del perfil que inicio sesion
  async getProfile(){
    return await this.ngFireAuth['currentUser'];
  }
  //Funcion para ingresar con google
  signInWithGoogle() {
    const provider = new GoogleAuthProvider();

    // provider.setCustomParameters({ prompt: 'select_account' });

    return signInWithPopup(this._auth, provider);
  } */
}