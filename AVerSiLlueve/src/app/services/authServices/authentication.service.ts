import { inject, Injectable } from '@angular/core';
import { initializeApp } from '@angular/fire/app';
import { Auth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, getAuth } from '@angular/fire/auth';
import { environment } from 'src/environments/environment';
import {AngularFireAuth} from '@angular/fire/compat/auth'; 
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  

  
  private _auth = inject(Auth);

  constructor(public ngFireAuth:AngularFireAuth) { 
    
  }

  async registerUser(email: string, password: string){
    return await this.ngFireAuth.createUserWithEmailAndPassword(email, password);
  }

  async loginUser(email: string, password: string){
    return await this.ngFireAuth.signInWithEmailAndPassword(email, password);
  }

  async resetPassword(email: string){
    return await this.ngFireAuth.sendPasswordResetEmail(email);
  }

  async signOut(){
    return await this.ngFireAuth.signOut();
  }

  async getProfile(){
    return await this.ngFireAuth.currentUser;
  }

  signInWithGoogle() {
    const provider = new GoogleAuthProvider();

    // provider.setCustomParameters({ prompt: 'select_account' });

    return signInWithPopup(this._auth, provider);
  }
}
