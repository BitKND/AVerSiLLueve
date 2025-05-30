
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular'; // 
import { Geolocation } from '@capacitor/geolocation';
// Condicionalmente importamos los plugins nativos si realmente los necesitamos en el entorno de desarrollo
// En el despliegue web, si estos no se usan condicionalmente, igual causarán el error.
// Una práctica más segura es usar imports dinámicos o que el bundler los elimine,
// pero envolver las llamadas en Platform.is() es el primer paso vital.
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';


@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  lat: number | null = null;
  lon: number | null = null;

  constructor(private platform: Platform) {} 

  async getCurrentLocation() {
    // Solo intenta usar los plugins de Capacitor si estamos en un dispositivo nativo.
    if (this.platform.is('capacitor') || this.platform.is('cordova')) {
      try {
        const permissionStatus = await Geolocation.checkPermissions();
        console.log('Permission status: ', permissionStatus.location);

        if (permissionStatus.location !== 'granted') {
          const requestStatus = await Geolocation.requestPermissions();
          if (requestStatus.location !== 'granted') {
            await this.openSettings(true); // Abre la configuración de la app si los permisos no se otorgan
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
        console.log('Ubicación obtenida:', this.lat, this.lon); // Para depuración

      } catch (e: any) {
        if (e?.message === 'Location services are not enabled') {
          await this.openSettings(); // Abre la configuración de ubicación del sistema
        }
        console.error('Error obteniendo ubicación en dispositivo nativo:', e);
        // Podrías lanzar el error o manejarlo de otra forma, pero al menos no romperá la web.
      }
    } else {
      // Lógica para entorno web o si no es un dispositivo nativo.
      // Por ejemplo, puedes establecer una ubicación por defecto o notificar al usuario.
      console.warn('Geolocation nativa no disponible en entorno web. Estableciendo lat/lon por defecto o solicitando al usuario.');
      this.lat = null; // O un valor por defecto si lo necesitas para la API del clima
      this.lon = null; // O un valor por defecto si lo necesitas para la API del clima
      // Aquí podrías, por ejemplo, intentar obtener la IP pública y usar un servicio
      // de geolocalización de IP, o mostrar un modal para que el usuario ingrese la ciudad.
    }
  }

  async openSettings(app = false) {
    // Solo intenta abrir las configuraciones nativas si estamos en un dispositivo nativo.
    if (this.platform.is('capacitor') || this.platform.is('cordova')) {
      console.log('open settings...');
      return NativeSettings.open({
        optionAndroid: app ? AndroidSettings.ApplicationDetails : AndroidSettings.Location,
        optionIOS: app ? IOSSettings.App : IOSSettings.LocationServices
      });
    } else {
      console.warn('No se pueden abrir las configuraciones nativas en un entorno web.');
      // No hacer nada o mostrar una alerta al usuario en web.
    }
  }
}