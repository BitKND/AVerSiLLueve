// src/app/tab1/tab1.page.ts
import { Component, OnInit } from '@angular/core';
import { ProveedorClimaService } from '../services/proveedoresServices/proveedor-clima.service';
import { Proveedor2ClimaService } from '../services/proveedoresServices/proveedor2-clima.service';
import { Proveedor3ClimaService } from '../services/proveedoresServices/proveedor3-clima.service';
import { AlertController, Platform } from '@ionic/angular';

import { GeolocationService } from '../services/Geolocation/geolocation-service.service';


interface ClimaData {
  weather: { icon: string; description: string }[];
  main: { temp: number; temp_max: number; temp_min: number; };
  name: string;
  coord: { lat: string; lon: string }; // Added for lat/lon access
  list?: any[]; // For forecast data
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page implements OnInit {
  proveedor: ClimaData | null = null; // Current weather data for searched city
  proveedor2: any; // Potentially unused or for another API call
  proveedor3: { list: any[] } | null = null; // Forecast data for searched city
  proveedor4: ClimaData | null = null; // Data for initial location display
  city: string = "";
  imageURL: string = "";
  lat: string = "";
  lon: string = "";
  isExpanded: boolean = true; // Set to true to always show forecast and keep card fixed
  isFavorite: boolean = false;

  weather: any = null; // Potentially redundant with 'proveedor'


  constructor(
    public alertCtrl: AlertController, // Renamed 'alert' to 'alertCtrl' for clarity and to avoid conflicts
    public proveedorClimaService: ProveedorClimaService,
    public proveedor2ClimaService: Proveedor2ClimaService,
    public proveedor3ClimaService: Proveedor3ClimaService,
    private geolocationService: GeolocationService,
    private platform: Platform
  ) {}

  async ngOnInit() {
    // Get current location and fetch weather for the current location
    await this.geolocationService.getCurrentLocation();
    const lat = this.geolocationService.lat;
    const lon = this.geolocationService.lon;

    if (lat && lon) {
      this.proveedorClimaService.currentWeather(lat, lon).subscribe(
        (data: any) => {
          this.proveedor4 = data; // Set the data for the second card (initial location)
          // Also set the main 'proveedor' and 'imageURL' for the primary card display
          this.proveedor = data;
          this.imageURL = data.weather[0].icon;
          this.lat = data.coord.lat;
          this.lon = data.coord.lon;
          this.foreCast(); // Fetch forecast for the current location
        },
        (error) => {
          console.error('Error obteniendo datos del clima de la ubicación actual:', error);
          this.presentAlert('Error de Ubicación', 'No se pudo obtener el clima de su ubicación actual. Intente buscar una ciudad o asegúrese de que los permisos de ubicación estén habilitados.');
        }
      );
    } else {
      this.presentAlert('Ubicación Desconocida', 'No se pudo obtener su ubicación actual. Por favor, asegúrese de que los servicios de ubicación estén habilitados o busque una ciudad.');
    }
  }

  // Function to fetch weather based on the city entered by the user
  async ObtenerClima() {
    if (!this.city) {
      this.presentAlert('Ciudad Vacía', 'Por favor, introduce el nombre de una ciudad.');
      return;
    }

    // Fetch current weather for the entered city
    this.proveedorClimaService.ObtenerClima(this.city)
    .subscribe(
      (data: any) => {
        this.proveedor = data;
        this.imageURL = data.weather[0].icon;
        this.lat = data.coord.lat;
        this.lon = data.coord.lon;
        console.log(data);
        this.foreCast(); // Fetch forecast for the searched city
      },
      (error) => {
        console.error('Error obteniendo clima actual por ciudad:', error);
        this.proveedor = null; // Clear previous weather data
        this.proveedor3 = null; // Clear previous forecast data
        if (error.status === 404) {
          this.presentAlert('Ciudad no encontrada', 'No se pudo encontrar la ciudad. Por favor, verifica el nombre.');
        } else {
          this.presentAlert('Error de Conexión', 'Hubo un problema al obtener el clima. Inténtalo de nuevo más tarde.');
        }
      }
    );
  }

  // Placeholder for adding to favorites
  AgregarFavorito() {
    if (this.proveedor && this.proveedor.name) {
      this.proveedorClimaService.agregarFavorito(this.proveedor.name);
      this.presentAlert('Favorito Agregado', `${this.proveedor.name} ha sido agregado a tus favoritos.`);
      this.isFavorite = true; // Update favorite status
    } else {
      this.presentAlert('Error', 'No hay datos de clima para agregar a favoritos. Realiza una búsqueda primero.');
    }
  }

  // Mueve este método 'getCurrentLocation' a tu 'GeolocationService'
  // y protégelo allí también. Si está aquí, no se está usando, pero es la fuente del error.
  // Si lo usas directamente en algún sitio, también protégelo.
  // async getCurrentLocation(){
  //   try {
  //     // Esta es la línea que causa el error en la web
  //     const permissionStatus = await Geolocation.checkPermissions();
  //     console.log('Permission status: ', permissionStatus.location);
  //     if(permissionStatus.location != 'granted') {
  //       const requestStatus = await Geolocation.requestPermissions();
  //       if(requestStatus.location != 'granted'){
  //         return null;
  //       }
  //     }
  //     let options: PositionOptions = {
  //       maximumAge: 3000,
  //       timeout: 10000,
  //       enableHighAccuracy: true
  //     };
  //     return await Geolocation.getCurrentPosition(options);
  //   } catch (e) {
  //     console.log(e);
  //     throw(e);
  //   }
  // }

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
    if (!this.lat || !this.lon) {
      console.warn('Latitud o longitud no disponibles para obtener el pronóstico.');
      return;
    }
    this.proveedor3ClimaService.foreCast(this.lat, this.lon)
    .subscribe((data:any) => {
        console.log("Forecast Data:", data);
        this.proveedor3 = {
          ...data, // Copy other properties
          list: data.list.slice(0, 8) // Take only the first 8 intervals (24 hours)
        };
      },
      err => {
        console.error('Error obteniendo pronóstico:', err);
        this.presentAlert('Error de Pronóstico', 'No se pudo obtener el pronóstico para esta ubicación.');
      }
    )
  }

  // Removed toggleExpand() as the card is now fixed and always expanded.
  // toggleExpand() {
  //   this.isExpanded = !this.isExpanded;
  //   if (this.isExpanded) {
  //     this.foreCast();
  //   }
  // }

  // Utility function for presenting alerts
  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}