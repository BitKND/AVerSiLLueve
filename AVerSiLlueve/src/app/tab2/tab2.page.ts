// src/app/tab2/tab2.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService, UserProfile } from '../services/userServices/user.services';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastController, AlertController } from '@ionic/angular';

// Importa el nuevo servicio unificado
import { OpenWeatherApiService } from '../services/proveedoresServices/open-weather-api.service'

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit, OnDestroy {
  weatherData: any[] = [];
  favoriteCities: string[] = [];
  userProfile: UserProfile | null = null;

  private userProfileSubscription: Subscription | undefined;
  private weatherLoadSubscription: Subscription | undefined;

  constructor(
    private userService: UserService,
    private toastController: ToastController,
    private alertController: AlertController,
    // ¡Aquí solo inyectamos el nuevo servicio unificado!
    private openWeatherApiService: OpenWeatherApiService // <-- Único servicio de clima
    // **NO** inyectes ProveedorClimaService aquí.
  ) { }

  ngOnInit() {
    this.userProfileSubscription = this.userService.userProfile$.subscribe(profile => {
      this.userProfile = profile;
      this.favoriteCities = profile?.favoriteCities || [];
      this.loadWeatherForFavorites();
    });

    this.userService.loadUserProfile().subscribe({
      next: (profile) => console.log('Perfil de usuario cargado en Tab2 OnInit'),
      error: (error) => console.error('Error al cargar el perfil en Tab2 OnInit:', error)
    });
  }

  ngOnDestroy() {
    this.userProfileSubscription?.unsubscribe();
    this.weatherLoadSubscription?.unsubscribe();
  }

  loadWeatherForFavorites() {
    if (!this.favoriteCities || this.favoriteCities.length === 0) {
      this.weatherData = []; 
      return;
    }

    const weatherRequests = this.favoriteCities.map(city => 
      // Usa el nuevo servicio unificado para obtener el clima de cada ciudad favorita
      this.openWeatherApiService.getCurrentWeatherByCity(city).pipe( // <-- ¡Cambio clave aquí!
        catchError(error => {
          console.error(`Error loading weather for city ${city}:`, error);
          this.presentToast(`No se pudo cargar el clima para "${city}".`, 'danger');
          return of(null); 
        })
      )
    );

    this.weatherLoadSubscription = forkJoin(weatherRequests).subscribe({
      next: (results) => {
        this.weatherData = results.filter(data => data !== null);
      },
      error: (err) => {
        console.error('Error al cargar todos los climas favoritos:', err);
        this.presentToast('Hubo un error al cargar algunos climas favoritos.', 'danger');
      }
    });
  }

  async removeFavorite(cityToRemove: string) {
    if (!this.userProfile || this.userProfile.userId === 'guest') {
      await this.presentToast('Debes iniciar sesión para eliminar favoritos.', 'danger');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar "${cityToRemove}" de tus favoritos?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Eliminar',
          handler: () => {
            const updatedFavorites = this.favoriteCities.filter(city => city.toLowerCase() !== cityToRemove.toLowerCase());
            this.userService.updateFavoriteCities(updatedFavorites).subscribe({
              next: (profile) => {
                this.presentToast(`"${cityToRemove}" eliminado de favoritos.`, 'success');
              },
              error: async (error) => {
                console.error('Error al eliminar favorito:', error);
                await this.presentToast('Error al eliminar favorito. Intenta de nuevo.', 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
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
}
