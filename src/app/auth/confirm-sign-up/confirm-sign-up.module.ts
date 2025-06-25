
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // ¡Importante: ReactiveFormsModule!

import { IonicModule } from '@ionic/angular';

import { ConfirmSignUpPageRoutingModule } from './confirm-sign-up-routing.module';

import { ConfirmSignUpPage } from './confirm-sign-up.page'; // Asegúrate que el nombre de importación sea correcto

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // <--- Esto es clave para los formularios reactivos
    IonicModule,
    ConfirmSignUpPageRoutingModule
  ],
  declarations: [ConfirmSignUpPage] // <--- Asegúrate que tu componente esté declarado aquí
})
export class ConfirmSignUpPageModule {}