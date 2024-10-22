import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authServices/authentication.service';
import { Router } from '@angular/router';

import { ProveedorClimaService } from '../services/proveedoresServices/proveedor-clima.service';
import { Proveedor2ClimaService } from '../services/proveedoresServices/proveedor2-clima.service';
import { Proveedor3ClimaService } from '../services/proveedoresServices/proveedor3-clima.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  user:any;

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
    this.user = authService.getProfile();
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

 /*  ngOnInit(){}

  //funcion para que me salte una alerta cuando esta mal algun dato HAY QUE COMPLETARLA!!!!!!!!!!!!!!!!!!!!
  presentAlert(){}


// ------------------------------ proveedor 1 (temperatura actual segun lat y lon) ------------------------------
  //METODO 1 PARA OBTENER API DE CLIMA 
  getClima1(lat: string, lon: string) {
    this.proveedorClimaService.obtenerDatos1(lat, lon).subscribe(
      //profe:
      //(data)=> {this.proveedor = data;},
      //(error)=> {console.log(error);}

      //video:
      res => {
        console.log(res);
        this.proveedor = res // = res.results?
      },
      err => console.log(err)
    )
  }

  //METODO PARA LLAMAR EN HTML
  //original: submitLocation(cityName: HTMLInputElement, countryCode: HTMLInputElement){
  submitLocation1(lat: HTMLInputElement, lon: HTMLInputElement){
    if(lat&&lon){
      this.getClima1(lat.value,lon.value);
      lat.value ="";
      lon.value ="";
    }else{
      this.presentAlert();
    }
    lat.focus();
    lon.focus();
    return false;
  }
 
// ------------------------------ proveedor 2 (temperatura actual segun cityName, stateCode, countryCode) ------------------------------
  //METODO 2 PARA OBTENER API DE CLIMA 
  getClima2(cityName: string, stateCode: string, countryCode: string) {
    this.proveedor2ClimaService.obtenerDatos2(cityName, stateCode, countryCode)
    .subscribe(
      //profe
      //(data)=> {this.proveedor2 = data;},
      //(error)=> {console.log(error);}

      //video
      res => {
        console.log(res);
        this.proveedor2 = res
      },
      err => console.log(err)
    )
  }

  //METODO PARA LLAMAR EN HTML
  //original: submitLocation(cityName: HTMLInputElement, countryCode: HTMLInputElement){
    submitLocation2(cityName: HTMLInputElement, stateCode: HTMLInputElement, countryCode: HTMLInputElement){
      if(cityName&&stateCode&&countryCode){
        this.getClima2(cityName.value,stateCode.value,countryCode.value);
        cityName.value ="";
        stateCode.value ="";
        countryCode.value ="";
      }else{
        this.presentAlert();
      }
      cityName.focus();
      stateCode.focus();
      countryCode.focus();
      return false;
    }

// ------------------------------ proveedor 3 (temperatura futuro segun lat y lon) ------------------------------

  //METODO 3 PARA OBTENER API DE CLIMA 
  getClima3(lat: string, lon: string) {
    this.proveedor3ClimaService.obtenerDatos3(lat, lon)
    .subscribe(
      //profe
      //(data)=> {this.proveedor3 = data;},
      //(error)=> {console.log(error);}

      //video
      res => {
        console.log(res);
        this.proveedor3 = res
      },
      err => console.log(err)
    )
  }

  //METODO PARA LLAMAR EN HTML
  //original: submitLocation(cityName: HTMLInputElement, countryCode: HTMLInputElement){
  submitLocation3(lat: HTMLInputElement, lon: HTMLInputElement){
    if(lat&&lon){
      this.getClima3(lat.value,lon.value);
      lat.value ="";
      lon.value ="";
    }else{
      this.presentAlert();
    }
    lat.focus();
    lon.focus();
    return false;
  }   */


}
