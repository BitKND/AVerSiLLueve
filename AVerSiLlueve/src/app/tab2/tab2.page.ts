import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authServices/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  
  favoriteCities: string[] = [];
  weatherData: any[] = [];

  user:any;

  constructor(
    public authService:AuthenticationService,
    public route: Router,
/* 
    public proveedorClimaService: ProveedorClimaService,
    public proveedor2ClimaService: Proveedor2ClimaService,
    public proveedor3ClimaService: Proveedor3ClimaService */

  ) {
    this.user = authService.getProfile();
  }

  async logout(){
    this.authService.signOut().then(()=>{
      localStorage.removeItem('ingresado');
      this.route.navigate(['/sign-in']);
    }).catch((error)=>{
      console.log(error);
    })
  }

}
