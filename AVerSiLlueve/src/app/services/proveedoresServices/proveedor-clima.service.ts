import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ProveedorClimaService {

  apiKey = 'c760af7a74a4ec3543b1ddd7f09e9636'; //ES CONSTANTE, POR ESO LA DECLARO ACA
  URI : string = '';
  lat = '160' ; //? lo establecemos como vacio para que despues lo rellene el usuario a traves de la funcion obtenerDatos1
  lon = '50' ; //? lo establecemos como vacio para que despues lo rellene el usuario a traves de la funcion obtenerDatos1
  //city!:string;

  constructor(
    public http: HttpClient
  ) { 
    console.log('Hola Proveedor 1'); 
    //Yo lo habia pensado como:
    //this.URI=`https://api.openweathermap.org/data/2.5/weather?lat={${this.lat}}&lon={${this.lon}}&appid=${this.apiKey}`;
    //en el video lo muestra como:
    //this.URI=`https://api.openweathermap.org/data/2.5/weather?&appid=${this.apiKey}&units=metric&q=`;
    //this.URI=`https://api.openweathermap.org/data/2.5/weather?q={this.city}&appid={this.apiKey}}`
  }

  //CREAMOS METODO PARA OBTENER DATOS API
  obtenerDatos1(lat: string , lon: string)
  {
    return this.http.get(`${this.URI}${lat},${lon}`);
  }

  ObtenerClima(city: string){
    return this.http.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}`);
  }


}
