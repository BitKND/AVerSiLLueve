import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';


@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  lat: number | null = null;
  lon: number | null = null;

  async getCurrentLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      this.lat = coordinates.coords.latitude;
      this.lon = coordinates.coords.longitude;
    } catch (error) {
      console.error('Error obteniendo ubicación', error);
    }
  }
}
