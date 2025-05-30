
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfirmSignUpPage } from './confirm-sign-up.page';

const routes: Routes = [
  {
    path: '',
    component: ConfirmSignUpPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfirmSignUpPageRoutingModule {}