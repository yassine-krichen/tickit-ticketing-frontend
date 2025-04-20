import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'ticket-details/:id',
    loadChildren: () => import('./features/ticket-details/ticket-details.module').then(m => m.TicketDetailsModule)
  },
  {
    path: 'ticket-create-update',
    loadChildren: () => import('./features/ticket-create-update/ticket-create-update.module').then(m => m.TicketCreateUpdateModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
