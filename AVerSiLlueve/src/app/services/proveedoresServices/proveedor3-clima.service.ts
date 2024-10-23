import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Proveedor3ClimaService {

  apiKey = 'c760af7a74a4ec3543b1ddd7f09e9636'; //ES CONSTANTE, POR ESO LA DECLARO ACA
  URI : string = '';


  constructor(
    public http: HttpClient
  ) { 
    console.log('Hola Proveedor 3');
    //Yo lo habia pensado como:
    //this.URI=`https://api.openweathermap.org/data/2.5/forecast?lat={${this.lat}}&lon={${this.lon}}&appid=${this.apiKey}`;
    //en el video lo muestra como:
    //this.URI=`https://api.openweathermap.org/data/2.5/weather?&appid=${this.apiKey}&units=metric&q=`;
  }

  //CREAMOS METODO PARA OBTENER DATOS API
  foreCast(lat: string, lon: string)
  {
    return this.http.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}`);
  }

}
