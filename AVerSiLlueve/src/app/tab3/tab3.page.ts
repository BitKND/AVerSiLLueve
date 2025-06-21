// src/app/tab3/tab3.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, AuthenticatedUser } from '../services/authServices/auth.service';
import { UserService, UserProfile } from '../services/userServices/user.services';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit, OnDestroy {
  newDisplayName: string = '';
  newFirstName: string | null = null;
  newLastName: string | null = null;
  newPhoneNumber: string | null = null;
  // newProfilePictureUrl: string | null = null; // <-- ¡Ya no necesitamos esta variable en el TS si no la usas para mostrar!

  userEmail: string | null = null;
  currentProfile: UserProfile | null = null;
  isFavoriteCitiesListExpanded: boolean = false;

  private userProfileSubscription: Subscription | undefined;
  private loadProfileSubscription: Subscription | undefined;
  private authUserSubscription: Subscription | undefined;
  private currentAuthUserId: string | null = null; // Añadido para el botón de demo de email

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private toastController: ToastController,
    // private http: HttpClient // Descomentar si vas a añadir el botón de demo de email
  ) {}

  ngOnInit() {
    this.userProfileSubscription = this.userService.userProfile$.subscribe(profile => {
      this.currentProfile = profile;
      if (profile) {
        this.newDisplayName = profile.displayName || '';
        this.newFirstName = profile.firstName || null;
        this.newLastName = profile.lastName || null;
        this.newPhoneNumber = profile.phoneNumber || null;
        // this.newProfilePictureUrl = profile.profilePictureUrl || null; // <-- ¡IGNORAR O ELIMINAR ESTA LÍNEA!
      } else {
        this.newDisplayName = '';
        this.newFirstName = null;
        this.newLastName = null;
        this.newPhoneNumber = null;
        // this.newProfilePictureUrl = null; // <-- ¡IGNORAR O ELIMINAR ESTA LÍNEA!
        this.userEmail = null;
      }
    });

    this.loadProfileSubscription = this.userService.loadUserProfile().subscribe({
      next: (profile) => console.log('Perfil de usuario cargado en Tab3 OnInit'),
      error: (error) => console.error('Error al cargar el perfil en Tab3 OnInit:', error)
    });

    this.authUserSubscription = this.authService.authenticatedUser$.subscribe(
      (user: AuthenticatedUser | null) => {
        this.userEmail = user?.email || null;
        this.currentAuthUserId = user?.userId || null; // Guardar el userId de Cognito
        console.log('Tab3: Email del usuario autenticado:', this.userEmail);
      }
    );
  }

  ngOnDestroy() {
    this.userProfileSubscription?.unsubscribe();
    this.loadProfileSubscription?.unsubscribe();
    this.authUserSubscription?.unsubscribe();
  }

  async saveProfile() {
    if (!this.currentProfile || this.currentProfile.userId === 'guest') {
      await this.presentToast('No se puede guardar el perfil. Por favor, inicia sesión.', 'danger');
      return;
    }

    const updatedProfileData: UserProfile = {
      ...this.currentProfile,
      displayName: this.newDisplayName,
      firstName: this.newFirstName,
      lastName: this.newLastName,
      phoneNumber: this.newPhoneNumber,
      // ELIMINAR CUALQUIER REFERENCIA A profilePictureUrl AQUÍ SI NO QUIERES QUE SE GUARDE
      // Si la Lambda espera profilePictureUrl, asegúrate de que sea null en tu backend
      // o ajusta tu Lambda para que no espere este campo si no lo envías.
      // Para estar seguros, la eliminaremos si existe para que no se envíe.
    };

    // Asegúrate de que profilePictureUrl no se envíe en la actualización de perfil
    if ('profilePictureUrl' in updatedProfileData) {
      delete updatedProfileData.profilePictureUrl;
    }

    this.userService.updateUserProfile(updatedProfileData).subscribe({
      next: async (response) => {
        await this.presentToast('¡Perfil actualizado exitosamente!', 'success');
      },
      error: async (error) => {
        console.error('Error al guardar el perfil:', error);
        await this.presentToast('Error al guardar el perfil. Inténtalo de nuevo.', 'danger');
      }
    });
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigateByUrl('/sign-in', { replaceUrl: true });
      await this.presentToast('Sesión cerrada.', 'success');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      await this.presentToast('Error al cerrar sesión. Inténtalo de nuevo.', 'danger');
    }
  }

  toggleFavoriteCitiesList() {
    this.isFavoriteCitiesListExpanded = !this.isFavoriteCitiesListExpanded;
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

  // Si vas a añadir el botón de demo de email, descomentar y adaptar esta función
  /*
  async sendTestAlertEmail() {
    if (!this.currentAuthUserId) {
      await this.presentToast('No se puede enviar email de prueba: usuario no autenticado.', 'danger');
      return;
    }

    const lambdaEndpointUrl = 'https://TU_ID_API_GATEWAY.execute-api.REGION.amazonaws.com/default/TU_NOMBRE_LAMBDA/send-test-email';

    try {
      await this.presentToast('Enviando email de prueba...', 'primary');
      const response = await this.http.post(lambdaEndpointUrl, { userId: this.currentAuthUserId }).toPromise();
      console.log('Test email response:', response);
      await this.presentToast('¡Email de prueba enviado exitosamente! Revisa tu bandeja de entrada.', 'success');
    } catch (error: any) {
      console.error('Error al enviar email de prueba:', error);
      const errorMessage = error.error?.message || 'Error desconocido al enviar email de prueba.';
      await this.presentToast(`Error: ${errorMessage}`, 'danger');
    }
  }
  */
}