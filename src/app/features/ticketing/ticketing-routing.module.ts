import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TicketListComponent } from './components/ticket-list/ticket-list.component';
import { TicketDetailsComponent } from './components/ticket-details/ticket-details.component';
import { CreateComponent } from './components/create/create.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        component: TicketListComponent
      },
      // create new ticket endpoint
      {
        path: 'tickets/new',
        component: CreateComponent
      },
      // edit new ticket endpoint
      {
        path: 'tickets/edit/:id',
        component: CreateComponent
      },
      {
        path: 'tickets/:id',
        component: TicketDetailsComponent
      } 
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketingRoutingModule { }
