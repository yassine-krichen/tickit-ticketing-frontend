import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'ticketing',
    loadChildren: () => import('./features/ticketing/ticketing.module').then(m => m.TicketingModule)
  },
  {
    path: 'ticket-details',
    loadChildren: () => import('./features/ticket-details/ticket-details.module').then(m => m.TicketDetailsModule)
  },
  { path: '', redirectTo: 'ticketing', pathMatch: 'full' },
  { path: '**', redirectTo: 'ticketing' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
