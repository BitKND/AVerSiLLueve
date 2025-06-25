
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/authServices/auth.service'; // Ruta corregida a tu AuthService
import { LoadingController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  constructor(
    private authService: AuthService, // Inyección de tu AuthService para manejar la autenticación
    private router: Router, // Inyección del Router para posibles navegaciones directas (aunque el AuthService ya las maneja)
    private loadingController: LoadingController, // Para mostrar un indicador de carga durante el cierre de sesión
    private alertController: AlertController // Para mostrar alertas al usuario en caso de error
  ) {}

  ngOnInit() {
    // Aquí puedes añadir lógica de inicialización si la necesitas para esta pestaña.
    // Por ejemplo, cargar datos del usuario si se muestran en la interfaz.
  }

  /**
   * Maneja el proceso de cierre de sesión del usuario.
   * Muestra un spinner de carga y utiliza el AuthService para cerrar la sesión.
   * El AuthService se encargará de comunicarse con Cognito y redirigir al usuario.
   */
  async logout() {
    console.log('Tab3Page: Botón de Cerrar Sesión CLICKEADO.'); 
    const loading = await this.loadingController.create({
      message: 'Cerrando sesión...',
    });
    await loading.present(); // Muestra el spinner de carga

    try {
      // Llama al método userSignOut de tu AuthService.
      // El AuthService ya tiene la lógica para llamar a Amplify.Auth.signOut()
      // y, a través del Hub, redirigir al usuario a la página de inicio de sesión (/sign-in).
      await this.authService.logout();


      // No es necesario añadir redirección aquí (ej. this.router.navigate(['/sign-in']))
      // ni limpiar localStorage, ya que el AuthService (mediante el Hub) ya gestiona esto.

    } catch (error: any) {
      // Captura y loguea cualquier error que ocurra durante el cierre de sesión
      console.error('Error al cerrar sesión:', error);
      const alert = await this.alertController.create({
        header: 'Error al cerrar sesión',
        message: 'No se pudo cerrar la sesión correctamente. Por favor, inténtalo de nuevo.',
        buttons: ['OK'],
      });
      await alert.present(); // Muestra una alerta al usuario
    } finally {
      await loading.dismiss(); // Asegura que el spinner se oculte, incluso si hay un error
    }
  }
}
