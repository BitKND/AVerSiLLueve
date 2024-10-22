import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
//La clase retorna false siempre y cuando el "flag" 'ingresado' sea true, y nos redirige adentro de la aplicacion
export class NoIngresadoGuard implements CanActivate {

  constructor(public roter: Router){}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if(localStorage.getItem('ingresado')){
        this.roter.navigate(['/tabs/tab1']);
        return false;
      }else{
        return true;
      }
  }
  
}