import { Routes } from '@angular/router';
import { TicketCreateUpdateComponent } from './pages/ticket-create-update/ticket-create-update.component';

export const CREATE_UPDATE_ROUTES: Routes = [
  {
    path: 'ticket/new',
    component: TicketCreateUpdateComponent
  },
  {
    path: 'ticket/edit/:id',
    component: TicketCreateUpdateComponent
  }
];
