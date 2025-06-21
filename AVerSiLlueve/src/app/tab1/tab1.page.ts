// src/app/tab1/tab1.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
// Importa el nuevo servicio unificado y GeolocationService, AlertController, Platform, ToastController, UserService
import { OpenWeatherApiService } from '../services/proveedoresServices/open-weather-api.service'; 
import { GeolocationService } from '../services/Geolocation/geolocation-service.service';
import { AlertController, Platform, ToastController } from '@ionic/angular';
import { UserService, UserProfile } from '../services/userServices/user.services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, OnDestroy {
  proveedor: any = null; // Clima actual de la ciudad buscada
  proveedor2: any = null; // Puedes considerar eliminar si no lo usas en el HTML para geocoding
  proveedor3: any = null; // Para el forecast
  proveedor4: any = null; // Clima actual por geolocalización
  city: string = "";
  imageURL: string = "";
  lat: string = ""; 
  lon: string = ""; 
  isExpanded: boolean = false; 
  
  userProfile: UserProfile | null = null;
  private userProfileSubscription: Subscription | undefined;
  private weatherSubscription: Subscription | undefined;
  private forecastSubscription: Subscription | undefined;

  constructor(
    public alert: AlertController,
    private geolocationService: GeolocationService,
    private platform: Platform,
    private userService: UserService,
    private toastController: ToastController,
    // ¡Aquí solo inyectamos el nuevo servicio unificado!
    private openWeatherApiService: OpenWeatherApiService // <-- Único servicio de clima
    // **NO** inyectes ProveedorClimaService, Proveedor2ClimaService, Proveedor3ClimaService aquí.
  ) {}

  async ngOnInit() {
    this.userProfileSubscription = this.userService.userProfile$.subscribe(profile => {
      this.userProfile = profile;
    });

    this.userService.loadUserProfile().subscribe({
      next: (profile) => console.log('Perfil de usuario cargado en Tab1 OnInit'),
      error: (error) => console.error('Error al cargar el perfil en Tab1 OnInit:', error)
    });

    if (this.platform.is('capacitor')) {
      await this.geolocationService.getCurrentLocation();
      const lat = this.geolocationService.lat;
      const lon = this.geolocationService.lon;

      if (lat && lon) {
        // Usa el nuevo servicio unificado para el clima por coordenadas de geolocalización
        this.weatherSubscription = this.openWeatherApiService.getCurrentWeatherByCoords(lat, lon).subscribe(
          (data: any) => {
            this.proveedor4 = data;
          },
          (error) => {
            console.error('Error obteniendo datos del clima por ubicación', error);
          }
        );
      }
    } else {
      console.warn('Geolocation nativa no disponible en entorno web. No se obtendrá el clima por ubicación.');
    }
  }

  ngOnDestroy() {
    this.userProfileSubscription?.unsubscribe();
    this.weatherSubscription?.unsubscribe();
    this.forecastSubscription?.unsubscribe();
  }

  async toggleFavorite() {
    if (!this.proveedor || !this.proveedor.name) {
      await this.presentToast('Por favor, busca una ciudad primero para marcarla como favorita.', 'warning');
      return;
    }
    if (!this.userProfile || this.userProfile.userId === 'guest') {
      await this.presentToast('Debes iniciar sesión para añadir favoritos.', 'danger');
      // Si el usuario es invitado y ha hecho clic, la UI puede haber cambiado.
      // La vinculación [checked] en el HTML debería reestablecerlo si la llamada
      // al servicio no se produce o falla.
      return;
    }

    const cityToToggle = this.proveedor.name;
    let currentFavorites = this.userProfile.favoriteCities || [];
    let updatedFavorites: string[];
    let message: string;
    let color: string;

    // Determinar la acción basándose en el estado *actual* de `isFavoriteCity`
    if (this.isFavoriteCity(cityToToggle)) {
      updatedFavorites = currentFavorites.filter(favCity => favCity.toLowerCase() !== cityToToggle.toLowerCase());
      message = `"${cityToToggle}" eliminado de favoritos.`;
      color = 'warning';
    } else {
      // Solo añadir si no está ya en la lista (comparación sin distinguir mayúsculas/minúsculas)
      if (!currentFavorites.some(favCity => favCity.toLowerCase() === cityToToggle.toLowerCase())) {
        updatedFavorites = [...currentFavorites, cityToToggle];
        message = `"${cityToToggle}" añadido a favoritos.`;
        color = 'success';
      } else {
        // Este caso idealmente no debería ocurrir si [checked] está configurado correctamente,
        // pero es una buena salvaguarda.
        await this.presentToast('Esta ciudad ya está en tus favoritos.', 'warning');
        // Como mostramos un toast pero no actualizamos, podríamos necesitar recargar el perfil
        // para forzar la actualización de la UI del botón.
        this.userService.loadUserProfile().subscribe(); // Forzar recarga para refrescar la UI
        return;
      }
    }

    this.userService.updateFavoriteCities(updatedFavorites).subscribe({
      next: (profile) => {
        // La suscripción a userProfile$ en ngOnInit actualizará `this.userProfile`
        // y reevaluará `isFavoriteCity()`, lo que a su vez actualiza el toggle a través de [checked].
        this.presentToast(message, color);
      },
      error: async (error) => {
        console.error('Error al actualizar favoritos:', error);
        await this.presentToast('Error al actualizar favoritos. Intenta de nuevo.', 'danger');
        // En caso de error, forzar una recarga para revertir el estado del toggle si cambió de forma optimista.
        this.userService.loadUserProfile().subscribe();
      }
    });
  }

  isFavoriteCity(cityToCheck: string): boolean {
    return this.userProfile?.favoriteCities?.some(favCity => favCity.toLowerCase() === cityToCheck.toLowerCase()) || false;
  }

  ObtenerClima() {
    if (!this.city) {
      this.presentToast('Por favor, ingresa un nombre de ciudad.', 'warning');
      return;
    }
    // Usa el nuevo servicio unificado para el clima actual por ciudad
    this.openWeatherApiService.getCurrentWeatherByCity(this.city).subscribe({
      next: (data: any) => {
        this.proveedor = data;
        this.imageURL = data.weather[0].icon;
        this.lat = data.coord.lat; 
        this.lon = data.coord.lon;
        console.log("Datos del clima actual:", data);
        
        this.proveedor3 = null; 
        this.isExpanded = false; 
      },
      error: (error) => {
        console.error('Error al obtener el clima por ciudad:', error);
        this.presentToast('No se pudo encontrar la ciudad. Intenta con otro nombre.', 'danger');
        this.proveedor = null;
        this.proveedor3 = null;
        this.isExpanded = false;
      }
    });
  }

  ObtenerPronostico() {
    if (!this.city) {
      this.presentToast('No hay ciudad para obtener el pronóstico. Busca una ciudad primero.', 'warning');
      return;
    }
    this.forecastSubscription?.unsubscribe(); 
    
    // Usa el nuevo servicio unificado para el pronóstico por nombre de ciudad
    this.forecastSubscription = this.openWeatherApiService.getForecastByCity(this.city).subscribe({
      next: (data: any) => {
        this.proveedor3 = {
          ...data,
          list: data.list.slice(0, 8) 
        };
        console.log("Datos del pronóstico (proveedor3):", this.proveedor3);
      },
      error: (error) => {
        console.error('Error al obtener el pronóstico:', error);
        this.presentToast('No se pudo cargar el pronóstico.', 'danger');
        this.proveedor3 = null;
      }
    });
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded && !this.proveedor3) { 
      this.ObtenerPronostico();
    }
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  // Si tenías otros métodos como geocoding, submitLocationX, etc. que usaban los proveedores antiguos,
  // asegúrate de eliminarlos o refactorizarlos para usar openWeatherApiService si aún son necesarios.
}