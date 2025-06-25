// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { AuthService } from '../services/authServices/auth.service'; // Ruta corregida a tu AuthService

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Implementa la lógica de guardia de ruta para controlar el acceso.
   * Decide si una ruta puede ser activada basándose en el estado de autenticación del usuario
   * y los requisitos de autenticación de la ruta.
   *
   * @param route La ruta activa que se está intentando acceder.
   * @param state El estado actual del router.
   * @returns Un Observable que emite `true` (permitir acceso), `false` (denegar acceso)
   * o un `UrlTree` (redirigir a otra ruta).
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // `authRequired` se configura en el objeto `data` de la definición de la ruta en `app-routing.module.ts`.
    // Por defecto, si no se especifica, la ruta se considera protegida (requiere autenticación).
    // Si `route.data['authRequired']` es `false`, significa que la ruta NO requiere autenticación (ej. login, registro).
    const authRequired = route.data['authRequired'] !== false;

    // Se suscribe al estado de autenticación del AuthService.
    // `take(1)` asegura que solo se tome el primer valor emitido y luego se complete el observable.
    // `map` transforma el estado de autenticación en una decisión de acceso o redirección.
    return this.authService.isAuthenticated.pipe(
      take(1),
      map(isAuthenticated => {
        if (authRequired) {
          // Caso 1: La ruta REQUIERE autenticación (ej. '/tabs', cualquier ruta dentro de la app principal).
          if (isAuthenticated) {
            // El usuario está autenticado, permite el acceso a la ruta protegida.
            return true;
          } else {
            // El usuario NO está autenticado, lo redirige a la página de inicio de sesión.
            return this.router.createUrlTree(['/sign-in']);
          }
        } else {
          // Caso 2: La ruta NO requiere autenticación (ej. '/sign-in', '/sign-up', '/auth/confirm-sign-up').
          if (isAuthenticated) {
            // El usuario YA está autenticado, por lo que no debería estar en una página de autenticación.
            // Lo redirige a la página principal de la aplicación.
            return this.router.createUrlTree(['/tabs']);
          } else {
            // El usuario NO está autenticado y la ruta no requiere autenticación,
            // permite el acceso (ej. para que pueda iniciar sesión o registrarse).
            return true;
          }
        }
      })
    );
  }
}