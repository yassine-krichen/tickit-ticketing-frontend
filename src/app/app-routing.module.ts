import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'ticket-details/:id',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/ticket-details/ticket-details.module').then(m => m.TicketDetailsModule)
  },
  {
    path: 'ticket-create-update',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/ticket-create-update/ticket-create-update.module').then(m => m.TicketCreateUpdateModule)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
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
