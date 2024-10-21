import { Component, OnInit } from '@angular/core';
import { ProveedorClimaService } from '../services/proveedoresServices/proveedor-clima.service';
import { Proveedor2ClimaService } from '../services/proveedoresServices/proveedor2-clima.service';
import { Proveedor3ClimaService } from '../services/proveedoresServices/proveedor3-clima.service';
import { AlertController } from '@ionic/angular';

interface ClimaData {
  weather: { icon: string }[];  // Ajusta esto según la estructura de la API
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page {

  proveedor:any;
  proveedor2:any;
  proveedor3:any;
  city="";
  imageURL="";

  constructor(
    public alert:AlertController,
    public proveedorClimaService: ProveedorClimaService,
    public proveedor2ClimaService: Proveedor2ClimaService,
    public proveedor3ClimaService: Proveedor3ClimaService,
  ) {}

  ngOnInit(){}

  ObtenerClima() {
    this.proveedorClimaService.ObtenerClima(this.city)
    .subscribe((data: any)=>{
      this.proveedor = data;
      this.imageURL = data.weather[0].icon;  // Ajustado para acceder al array de weather
      console.log(data);
    });
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
  }  

}
