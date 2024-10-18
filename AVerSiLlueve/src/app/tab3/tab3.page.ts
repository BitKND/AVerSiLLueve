import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authServices/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
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
      this.route.navigate(['/sign-in'])
    }).catch((error)=>{
      console.log(error);
    })
  }
}
