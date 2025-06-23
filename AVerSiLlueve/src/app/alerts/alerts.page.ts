// src/app/alerts/alerts.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertsService, UserAlert } from '../services/alertServices/alerts.services';
import { AuthService, AuthenticatedUser } from '../services/authServices/auth.service';
import { Subscription } from 'rxjs';
import { ToastController, RefresherEventDetail } from '@ionic/angular';
import { DatePipe } from '@angular/common'; // ¡IMPORTANTE: Añadir esta importación!

@Component({
  selector: 'app-alerts',
  templateUrl: 'alerts.page.html',
  styleUrls: ['alerts.page.scss'],
  providers: [DatePipe] // ¡IMPORTANTE: Añadir esto para que DatePipe funcione en el template!
})
export class AlertsPage implements OnInit, OnDestroy {
  public alerts: UserAlert[] = [];
  public isLoadingAlerts: boolean = false;
  public errorMessage: string | null = null;
  private authenticatedUserSubscription: Subscription | undefined;
  private alertsSubscription: Subscription | undefined;
  private currentUserId: string | null = null; // Para almacenar el userId del usuario autenticado

  constructor(
    private alertsService: AlertsService,
    private authService: AuthService,
    private toastController: ToastController,
    private datePipe: DatePipe // ¡IMPORTANTE: Inyectar DatePipe!
  ) {}

  ngOnInit() {
    console.log('AlertsPage: ngOnInit');
    this.authenticatedUserSubscription = this.authService.authenticatedUser$.subscribe(
      (user: AuthenticatedUser | null) => {
        this.currentUserId = user?.userId || null;
        console.log('AlertsPage: Usuario autenticado actualizado. userId:', this.currentUserId);
        // Cuando el usuario autenticado cambia, intentar cargar las alertas
        if (this.currentUserId && this.currentUserId !== 'guest') {
          this.loadAlerts();
        } else {
          this.alerts = []; // Limpiar alertas si es invitado o no hay usuario
          this.errorMessage = 'Por favor, inicia sesión para ver tus alertas.';
        }
      },
      (error) => {
        console.error('Error al obtener el usuario autenticado en AlertsPage:', error);
        this.errorMessage = 'Error al cargar el estado del usuario.';
      }
    );

    // Suscribirse a los cambios en el BehaviorSubject de alertas en el servicio
    // Esto asegura que la UI se actualice si el servicio refresca las alertas
    this.alertsSubscription = this.alertsService.userAlerts$.subscribe(
      (alerts) => {
        // Es crucial que las fechas sean objetos Date o ISO strings para el pipe
        this.alerts = alerts.map(alert => ({
            ...alert,
            // Convertir a ISO strings si vienen de DynamoDB como otros formatos
            // o asegurarse de que alerts.services ya las mapee
            forecastDateTime: alert.forecastDateTime ? new Date(alert.forecastDateTime).toISOString() : undefined,
            alertGeneratedDateTime: alert.alertGeneratedDateTime ? new Date(alert.alertGeneratedDateTime).toISOString() : undefined
        }));
        this.isLoadingAlerts = false; // Asumiendo que el servicio ya manejó la carga
        this.errorMessage = null; // Limpiar cualquier mensaje de error anterior
        console.log('AlertsPage: Alertas actualizadas desde el servicio:', this.alerts);
        if (alerts.length > 0 && alerts.every(alert => alert.read)) {
            // Opcional: mostrar un toast si todas las alertas se marcan como leídas
            // this.presentToast('Todas las alertas marcadas como leídas.', 'success');
        }
      },
      (error) => {
        console.error('Error al suscribirse a las alertas del servicio:', error);
        this.errorMessage = 'No se pudieron cargar las alertas.';
        this.isLoadingAlerts = false;
      }
    );
  }

  ionViewWillEnter() {
    console.log('AlertsPage: ionViewWillEnter - Intentando cargar alertas.');
    // Si ya tenemos un userId, cargamos las alertas.
    // Si no, ngOnInit ya manejará la suscripción al usuario.
    if (this.currentUserId && this.currentUserId !== 'guest') {
      this.loadAlerts();
    }
  }

  ngOnDestroy() {
    this.authenticatedUserSubscription?.unsubscribe();
    this.alertsSubscription?.unsubscribe();
  }

  loadAlerts(event?: CustomEvent<RefresherEventDetail>) {
    if (!this.currentUserId || this.currentUserId === 'guest') {
      console.log('AlertsPage: No hay userId o es invitado, no se cargan alertas.');
      this.alerts = [];
      this.errorMessage = 'Por favor, inicia sesión para ver tus alertas.';
      event?.detail.complete();
      return;
    }

    this.isLoadingAlerts = true;
    this.errorMessage = null; // Limpiar cualquier error previo

    console.log(`AlertsPage: Llamando a alertsService.getAlerts para userId: ${this.currentUserId}`);
    // El servicio ahora actualiza su BehaviorSubject, lo que disparará la suscripción en ngOnInit
    this.alertsService.getAlerts(this.currentUserId).subscribe({
      next: (data) => {
        // La suscripción a alertsService.userAlerts$ ya maneja la actualización de this.alerts
        console.log('AlertsPage: getAlerts completado, datos recibidos por BehaviorSubject.');
        event?.detail.complete(); // Completar el refresher si fue invocado por uno
      },
      error: (err) => {
        console.error('AlertsPage: Error al cargar alertas desde el servicio:', err);
        this.errorMessage = 'Error al cargar tus alertas. Inténtalo de nuevo.';
        this.isLoadingAlerts = false;
        event?.detail.complete();
        this.presentToast('Error al cargar alertas.', 'danger');
      }
    });
  }

  doRefresh(event: CustomEvent<RefresherEventDetail>) {
    console.log('AlertsPage: Realizando refresh...');
    this.loadAlerts(event);
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

  // --- FUNCIÓN PARA EXTRAER LA DESCRIPCIÓN DEL CLIMA DEL MENSAJE ---
  getWeatherDescription(message: string): string {
    // Ejemplo de mensaje: "¡Alerta de lluvia para Buenos Aires! Se pronostica lluvia para el 22/6 a las 15:00 con 87% de probabilidad (lluvia ligera). (Generada: 22/06/2025, 07:17)."
    // Busca el texto entre paréntesis que describe el tipo de lluvia, antes de "(Generada:"
    const match = message.match(/\(([^)]+)\)\s*\.\s*\(Generada:/); 
    if (match && match[1]) {
      return match[1].toLowerCase(); // Retorna la descripción en minúsculas
    }
    // Si no encuentra la descripción, o si el mensaje cambia de formato:
    return 'precipitación'; // Retorna un valor por defecto
  }
}