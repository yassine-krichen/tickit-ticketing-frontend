import { Routes } from '@angular/router';
import { TicketDetailsComponent } from './pages/ticket-details/ticket-details.component';

export const TICKET_DETAILS_ROUTES: Routes = [
  {
    path: ':id',
    component: TicketDetailsComponent
  }
];
