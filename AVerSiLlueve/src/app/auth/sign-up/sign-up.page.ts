import { Component, OnInit, inject } from '@angular/core';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { AuthenticationService } from 'src/app/authentication.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  regForm: FormGroup | undefined;

  oAuth = getAuth();

  private _auth = inject(AuthenticationService);

  gEmail = "";
  gPassword = "";

  constructor(
    public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController,
    private roter : Router,
    public authService:AuthenticationService,
    
              ) { }

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



  async registerUser(){

    const loading = await this.loadingCtrl.create();
    await loading.present();

    try {      
      
       const user = await this.authService.registerUser(this.gEmail,this.gPassword)

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

  async loginGoogle(){
    try {
      await this._auth.signInWithGoogle();

    } catch (error) {
      console.log('Ocurrio un error');
    }
  }

}
