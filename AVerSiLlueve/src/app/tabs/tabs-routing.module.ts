
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    // Define la ruta base para el componente TabsPage.
    // Cuando el router navega a '/tabs' (definido en app-routing.module.ts),
    // este componente se activará y servirá como contenedor para las pestañas.
    path: '',
    component: TabsPage,
    children: [
      {
        // Define la ruta para la Pestaña 1.
        path: 'tab1',
        loadChildren: () => import('../tab1/tab1.module').then(m => m.Tab1PageModule)
      },
      {
        // Define la ruta para la Pestaña 2.
        path: 'tab2',
        loadChildren: () => import('../tab2/tab2.module').then(m => m.Tab2PageModule)
      },
      {
        // Define la ruta para la Pestaña 3 (donde está el botón de cerrar sesión).
        path: 'tab3',
        loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule)
      },
      {
        // Ruta por defecto para el grupo de pestañas.
        // Cuando se accede a '/tabs' sin una sub-ruta específica (ej. '/tabs'),
        // redirige automáticamente a 'tab1'. Es crucial que esta redirección sea RELATIVA
        // (es decir, solo 'tab1' y no '/tab1') porque es una sub-ruta dentro del contexto de 'tabs'.
        path: '',
        redirectTo: 'tab1',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  // `RouterModule.forChild(routes)` se utiliza para módulos de rutas que no son la raíz de la aplicación,
  // como en el caso de las rutas hijas de las pestañas.
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule] // Exporta el RouterModule para que estas rutas estén disponibles.
})
export class TabsPageRoutingModule {}