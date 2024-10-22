import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NoIngresadoGuard } from './no-ingresado.guard';
import { IngresadoGuard } from './ingresado.guard';

const routes: Routes = [

  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate:[IngresadoGuard]
    //Se activa la ruta de ingreso a la app cuando ingresadoGuard sea true.
  },
  {
    path: 'sign-in',
    loadChildren: () => import('./auth/sign-in/sign-in.module').then( m => m.SignInPageModule),
    canActivate:[NoIngresadoGuard]
    //Se activa la ruta de ingreso a la app cuando NoingresadoGuard sea false.
  },
  {
    path: 'sign-up',
    loadChildren: () => import('./auth/sign-up/sign-up.module').then( m => m.SignUpPageModule),
    canActivate:[NoIngresadoGuard]
    //Se activa la ruta de ingreso a la app cuando NoingresadoGuard sea false.
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./auth/reset-password/reset-password.module').then( m => m.ResetPasswordPageModule),
    canActivate:[NoIngresadoGuard]
    //Se activa la ruta de ingreso a la app cuando NoingresadoGuard sea false.
  }



];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}