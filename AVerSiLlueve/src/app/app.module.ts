import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import {AngularFireModule} from '@angular/fire/compat'; 
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from 'src/environments/environment';


@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, AngularFireModule, AngularFireAuthModule, AngularFireModule.initializeApp(environment.firebase)],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, provideFirebaseApp(() => initializeApp({"projectId":"aversillueve-8e165","appId":"1:677722327734:web:47159b7885c6e9a2cb3417","storageBucket":"aversillueve-8e165.appspot.com","apiKey":"AIzaSyCFrAsRM_4F-fa4sG1CdQonPHHNyQxSCeA","authDomain":"aversillueve-8e165.firebaseapp.com","messagingSenderId":"677722327734"})), provideAuth(() => getAuth())],
  bootstrap: [AppComponent],
})
export class AppModule {}
