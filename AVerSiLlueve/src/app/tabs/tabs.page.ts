import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authServices/authentication.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  email:any;

  proveedor:any;
  proveedor2:any;
  proveedor3:any;

  constructor(
    public authService:AuthenticationService,
    public route: Router,
/* 
    public proveedorClimaService: ProveedorClimaService,
    public proveedor2ClimaService: Proveedor2ClimaService,
    public proveedor3ClimaService: Proveedor3ClimaService */

  ) {
    
  }
  ngOnInit(): void {

    this.authService.getProfile().then(user => {
      this.email = user?.email;
      console.log(user?.email);
    }).catch(error => {
      console.error('Error getting user profile:', error);
    });
    
  }

//Hacemos uso del servicio de authservice establecido, y le agregamos que elimine el flag 'ingresado', para respetar el criterio de los guards establecidos.
  async logout(){
    this.authService.signOut().then(()=>{
      localStorage.removeItem('ingresado');
      this.route.navigate(['/sign-in']);
    }).catch((error)=>{
      console.log(error);
    })
  }




}
