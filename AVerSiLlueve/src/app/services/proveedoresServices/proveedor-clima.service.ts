import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { findIndex } from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class ProveedorClimaService {

  apiKey = 'c760af7a74a4ec3543b1ddd7f09e9636'; //ES CONSTANTE, POR ESO LA DECLARO ACA
  URI: string = '';

  private favoritos: any [] = [];

  constructor(
    public http: HttpClient
  ) {
    console.log('Hola Proveedor 1');
    const storedFavorites = localStorage.getItem('favoritos');

    this.favoritos = storedFavorites ? JSON.parse(storedFavorites) : [];

  }

  //CREAMOS METODO PARA OBTENER DATOS API
  currentWeather(lat: number, lon: number) {
    return this.http.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}`);
  }

  // ObtenerClima(city: string){
  //    return this.http.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}`);
  //  }
  ObtenerClima(city: string) {
    const url = `${this.URI}?q=${city}&appid=${this.apiKey}&units=metric&lang=es`;
    return this.http.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&lang=es`);// idioma español el detalle del clima
  }


  agregarFavorito(city: string) {

    try {
      this.favoritos.push(city);
      this.actualizarStorage();
      console.log(this.favoritos)
    } catch (error) {
      
      console.log('No fue posible agregar a favoritos');
      console.log(this.favoritos)
    }
      
        
  }

  borrarFavorito(city: string) {
    
    let index = this.favoritos.indexOf(city);

    console.log(index);

    this.favoritos.splice(index, 1);

    this.actualizarStorage();

/*     this.favoritos = this.favoritos.filter(fav => fav !== city);
    this.actualizarStorage(); */

    console.log(this.favoritos);
  }

  esFavorito(city: string): boolean {
    return this.favoritos.includes(city);
  }

  obtenerFavoritos(): string[] {
    return this.favoritos;
  }

  private actualizarStorage() {
    
    localStorage.setItem('favoritos', JSON.stringify(this.favoritos));
  }
}


