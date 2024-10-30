import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';


@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  lat: number | null = null;
  lon: number | null = null;

  async getCurrentLocation() {

    try {
      const permissionStatus = await Geolocation.checkPermissions();
      console.log('Permission status: ', permissionStatus.location);
      if(permissionStatus.location != 'granted') {
        const requestStatus = await Geolocation.requestPermissions();
        if(requestStatus.location != 'granted'){
          await this.openSettings(true);
          return;
        }
      }
      let options: PositionOptions = {
        maximumAge: 3000,
        timeout: 10000,
        enableHighAccuracy: true
      };
      const coordinates = await Geolocation.getCurrentPosition(options);
      this.lat = coordinates.coords.latitude;
      this.lon = coordinates.coords.longitude;
      

    } catch (e : any) {
      if(e?.message == 'Location services are not enabled'){
        await this.openSettings();
      }
      console.log('error obteniendo ubicacion',e);
      throw(e);      
    }
  }

  openSettings(app = false) {
    console.log('open settings...');
    return NativeSettings.open({
      optionAndroid: app ? AndroidSettings.ApplicationDetails : AndroidSettings.Location, 
      optionIOS: app ? IOSSettings.App : IOSSettings.LocationServices
    });
  }
}
