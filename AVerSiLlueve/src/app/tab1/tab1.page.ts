import { Component, OnInit } from '@angular/core';
import { ProveedorClimaService } from '../services/proveedoresServices/proveedor-clima.service';
import { Proveedor2ClimaService } from '../services/proveedoresServices/proveedor2-clima.service';
import { Proveedor3ClimaService } from '../services/proveedoresServices/proveedor3-clima.service';
import { AlertController } from '@ionic/angular';
import { AuthenticationService } from '../services/authServices/authentication.service';
import { Router } from '@angular/router';


interface ClimaData {
  weather: { icon: string }[];  // Ajusta esto según la estructura de la API
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page {
  user:any;
  proveedor:any;
  proveedor2:any;
  proveedor3:any;
  proveedor4:any;
  city="";
  imageURL="";
  lat="";
  lon="";
  isExpanded = false; // Para controlar si está expandido
  constructor(
    public authService:AuthenticationService,
    public route: Router,
    public alert:AlertController,
    public proveedorClimaService: ProveedorClimaService,
    public proveedor2ClimaService: Proveedor2ClimaService,
    public proveedor3ClimaService: Proveedor3ClimaService,
  )  {
    this.user = authService.getProfile();
  }

  ngOnInit(){}
  // -------------- Obtener clima por ciudad ------------
  ObtenerClima() {
    this.proveedorClimaService.ObtenerClima(this.city)
    .subscribe((data: any)=>{
      this.proveedor = data;
      this.imageURL = data.weather[0].icon;  // Ajustado para acceder al array de weather
      this.lat = data.coord.lat; // Guardar latitud
      this.lon = data.coord.lon; // Guardar longitud
      console.log(data);
    });
  }

  // ------------------------------ proveedor 1 (temperatura actual segun lat y lon) ------------------------------
  //METODO 1 PARA OBTENER API DE CLIMA 
  currentWeather(lat: string, lon: string) {
    this.proveedorClimaService.currentWeather(lat, lon)
    .subscribe((data: any)=> {
        console.log(data);
        this.proveedor4 = data 
      },
      err => console.log(err)
    )
  }

  // ------------------------------ proveedor 2 (temperatura actual segun cityName, stateCode, countryCode) ------------------------------
  //METODO Geocoding API
  geocoding(cityName: string, stateCode: string, countryCode: string) {
    this.proveedor2ClimaService.Geocoding(cityName, stateCode, countryCode)
    .subscribe((data:any) =>{
        console.log(data);
        this.proveedor2 = data
      },
      err => console.log(err)
    )
  }

  

  // ------------------------------ proveedor 3 (temperatura futuro segun lat y lon) ------------------------------

  //METODO 3 para obtener forecast
  foreCast() {
    this.proveedor3ClimaService.foreCast(this.lat, this.lon)
    .subscribe((data:any) => {
        console.log(data);
        this.proveedor3 = {
          ...data, // Copiamos el resto de las propiedades del objeto original
          list: data.list.slice(0, 8) // Tomar solo los primeros 8 intervalos (24 horas)
        };
      },
      err => console.log(err)
    )
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      // Obtener el pronóstico si la tarjeta se expande
      this.foreCast();
    }
  }

  //funcion para que me salte una alerta cuando esta mal algun dato HAY QUE COMPLETARLA!!!!!!!!!!!!!!!!!!!!
  async presentAlert(){
    const alert =  await this.alert.create({
      header: '',
      message: '',
      buttons: ['Entendido'],

    });
     alert.present();
  }




  //METODO PARA LLAMAR EN HTML
  //original: submitLocation(cityName: HTMLInputElement, countryCode: HTMLInputElement){
  submitLocation1(lat: HTMLInputElement, lon: HTMLInputElement){
    if(lat&&lon){
      this.currentWeather(lat.value,lon.value);
      lat.value ="";
      lon.value ="";
    }else{
      this.presentAlert();
    }
    lat.focus();
    lon.focus();
    return false;
  }
 


  //METODO PARA LLAMAR EN HTML
  //original: submitLocation(cityName: HTMLInputElement, countryCode: HTMLInputElement){
    submitLocation2(cityName: HTMLInputElement, stateCode: HTMLInputElement, countryCode: HTMLInputElement){
      if(cityName&&stateCode&&countryCode){
        this.geocoding(cityName.value,stateCode.value,countryCode.value);
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

    async logout(){
      this.authService.signOut().then(()=>{
        localStorage.removeItem('ingresado');
        this.route.navigate(['/sign-in']);
      }).catch((error)=>{
        console.log(error);
      })
    }



  //METODO PARA LLAMAR EN HTML
  //original: submitLocation(cityName: HTMLInputElement, countryCode: HTMLInputElement){
/*   submitLocation3(lat: HTMLInputElement, lon: HTMLInputElement){
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
