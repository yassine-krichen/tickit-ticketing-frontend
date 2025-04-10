import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { TicketingRoutingModule } from './ticketing-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TicketListComponent } from './components/ticket-list/ticket-list.component';
import { TicketDetailsComponent } from './components/ticket-details/ticket-details.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FilterPipe } from '../../shared/pipes/filter.pipe';
import { CreateComponent } from './components/create/create.component';

@NgModule({
  declarations: [
    DashboardComponent, 
    TicketListComponent, 
    TicketDetailsComponent,
    SidebarComponent,
    FilterPipe,
    CreateComponent
  ],
  imports: [
    CommonModule,
    TicketingRoutingModule,
    RouterModule,
    TranslateModule.forChild()
  ]
})
export class TicketingModule { }
