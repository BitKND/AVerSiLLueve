import { Component } from '@angular/core';
import { ProveedorClimaService } from '../services/proveedoresServices/proveedor-clima.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  
  favoriteCities: string[] = [];
  weatherData: any[] = [];

  constructor(private proveedorService:ProveedorClimaService) {
    
  }

  ionViewWillEnter() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.favoriteCities = this.proveedorService.obtenerFavoritos();
    this.weatherData = [];

    this.favoriteCities.forEach(city => {
      this.proveedorService.ObtenerClima(city).subscribe(
        data => this.weatherData.push(data),
        error => console.error('Error loading weather for city:', city)
      );
    });
  }

  removeFavorite(city: string) {
    this.proveedorService.borrarFavorito(city);
    this.loadFavorites();
  }

}
