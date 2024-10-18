import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Proveedor2ClimaService {

  apiKey = 'c760af7a74a4ec3543b1ddd7f09e9636'; //ES CONSTANTE, POR ESO LA DECLARO ACA
  limit = '5';//ES CONSTANTE, POR ESO LA DECLARO ACA

  URI : string = '';



  constructor(
    public http: HttpClient
  ) { 
    console.log('Hola Proveedor 2');
    //Yo lo habia pensado como:
    //this.URI=`http://api.openweathermap.org/geo/1.0/direct?q={${this.cityName},${this.stateCode},${this.countryCode}}&limit={${this.limit}}&appid={${this.apiKey}}`;
    //en el video lo muestra como:
   // this.URI=`https://api.openweathermap.org/data/2.5/weather?&appid=${this.apiKey}&limit={${this.limit}}&units=metric&q=`;
  }

  //CREAMOS METODO PARA OBTENER DATOS API
  obtenerDatos2(cityName: string, stateCode: string, countryCode: string)
  {
    return this.http.get(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName},${stateCode},${countryCode}&limit=${this.limit}&appid=${this.apiKey}`);
  }

}
