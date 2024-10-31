import { Component, OnInit } from '@angular/core';
import { ProveedorClimaService } from '../services/proveedoresServices/proveedor-clima.service';
import { Proveedor2ClimaService } from '../services/proveedoresServices/proveedor2-clima.service';
import { Proveedor3ClimaService } from '../services/proveedoresServices/proveedor3-clima.service';
import { AlertController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { GeolocationService } from '../services/Geolocation/geolocation-service.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authServices/authentication.service';


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
  proveedor4:number | null = null;
  city="";
  imageURL="";
  lat="";
  lon="";
  isExpanded = false; // Para controlar si está expandido

  weather: any = null;



  constructor(
    public authService:AuthenticationService,
    public route: Router,
    public alert:AlertController,
    public proveedorClimaService: ProveedorClimaService,
    public proveedor2ClimaService: Proveedor2ClimaService,
    public proveedor3ClimaService: Proveedor3ClimaService,
    private geolocationService: GeolocationService
    
  ) {}

  async ngOnInit(){
    await this.geolocationService.getCurrentLocation();
    const lat = this.geolocationService.lat;
    const lon = this.geolocationService.lon;

    if (lat && lon) {
      this.proveedorClimaService.currentWeather(lat, lon).subscribe(
        (data: any) => {
          this.proveedor4 = data;
        },
        (error) => {
          console.error('Error obteniendo datos del clima', error);
        }
      );}

  }

  toggleFavorite() {
    if (this.esFavorito()) {
      this.proveedorClimaService.borrarFavorito(this.city);
    } else {
      this.proveedorClimaService.agregarFavorito(this.city);
    }
  }

  esFavorito(): boolean {
    return this.proveedorClimaService.esFavorito(this.city);
  }




  async getCurrentLocation(){
    try {
      const permissionStatus = await Geolocation.checkPermissions();
      console.log('Permission status: ', permissionStatus.location);
      if(permissionStatus.location != 'granted') {
        const requestStatus = await Geolocation.requestPermissions();
        if(requestStatus.location != 'granted'){
          return null;
        }
      }
      let options: PositionOptions = {
        maximumAge: 3000,
        timeout: 10000,
        enableHighAccuracy: true
      };
      return await Geolocation.getCurrentPosition(options);
      

    } catch (e) {
      console.log(e);
      throw(e);      
    }
  }
  
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

  //funcion para que me salte una alerta cuando esta mal algun dato
  async presentAlert(){
    const alert =  await this.alert.create({
      header: '',
      message: '',
      buttons: ['Entendido'],

    });
     alert.present();
  }

  async logout(){
    this.authService.signOut().then(()=>{
      localStorage.removeItem('ingresado');
      this.route.navigate(['/sign-in']);
    }).catch((error)=>{
      console.log(error);
    })
  }


}
