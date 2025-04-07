import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TicketingRoutingModule } from './ticketing-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TicketListComponent } from './components/ticket-list/ticket-list.component';
import { TicketDetailsComponent } from './components/ticket-details/ticket-details.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@NgModule({
  declarations: [
    DashboardComponent, 
    TicketListComponent, 
    TicketDetailsComponent,
    SidebarComponent
  ],
  imports: [
    CommonModule,
    TicketingRoutingModule,
    RouterModule
  ]
})
export class TicketingModule { }
