
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

// Importa el AuthGuard unificado que creamos
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    // Ruta por defecto al iniciar la aplicación.
    // Redirige a 'tabs'. El AuthGuard de 'tabs' determinará si el usuario tiene acceso
    // o si debe ser redirigido a la página de inicio de sesión.
    path: '',
    redirectTo: 'tabs',
    pathMatch: 'full'
  },
  {
    // Ruta para las pestañas principales de la aplicación (contenido protegido).
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AuthGuard], // Protege esta ruta con el AuthGuard
    data: { authRequired: true } // Indica que esta ruta REQUIERE autenticación para ser accedida
  },
  {
    // Ruta para la página de inicio de sesión.
    path: 'sign-in',
    loadChildren: () => import('./auth/sign-in/sign-in.module').then( m => m.SignInPageModule),
    canActivate: [AuthGuard], // Usa AuthGuard para redirigir si ya está autenticado
    data: { authRequired: false } // Indica que esta ruta NO REQUIERE autenticación (es una ruta pública de login)
  },
  {
    // Ruta para la página de registro de usuarios.
    path: 'sign-up',
    loadChildren: () => import('./auth/sign-up/sign-up.module').then( m => m.SignUpPageModule),
    canActivate: [AuthGuard], // Usa AuthGuard para redirigir si ya está autenticado
    data: { authRequired: false } // Indica que esta ruta NO REQUIERE autenticación (es una ruta pública de registro)
  },
  {
    // Ruta para la página de confirmación de registro.
    // Incluye ':email' como un parámetro de ruta dinámico para pre-llenar el campo de email.
    path: 'auth/confirm-sign-up/:email',
    loadChildren: () => import('./auth/confirm-sign-up/confirm-sign-up.module').then( m => m.ConfirmSignUpPageModule),
    canActivate: [AuthGuard], // Usa AuthGuard para redirigir si ya está autenticado
    data: { authRequired: false } // Indica que esta ruta NO REQUIERE autenticación (es una ruta pública de confirmación)
  },
  {
    // Ruta para la página de recuperación de contraseña.
    // Esta ruta se utilizará en una futura implementación de la funcionalidad.
    path: 'reset-password',
    loadChildren: () => import('./auth/reset-password/reset-password.module').then( m => m.ResetPasswordPageModule),
    canActivate: [AuthGuard], // Usa AuthGuard para redirigir si ya está autenticado
    data: { authRequired: false } // Indica que esta ruta NO REQUIERE autenticación (es una ruta pública de reseteo)
  },
  {
    // Ruta comodín (**): Captura cualquier ruta que no haya sido definida previamente.
    // Útil para manejar rutas incorrectas o no existentes, redirigiendo a la ruta principal.
    path: '**',
    redirectTo: 'tabs',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    // Configura el RouterModule para la aplicación raíz.
    // `preloadingStrategy: PreloadAllModules` carga todos los módulos de rutas perezosas
    // en segundo plano una vez que la aplicación se inicia, mejorando la experiencia del usuario.
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule] // Exporta el RouterModule para que esté disponible en toda la aplicación.
})
export class AppRoutingModule {}