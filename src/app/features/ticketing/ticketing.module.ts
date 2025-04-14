import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { TicketingRoutingModule } from './ticketing-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TicketListComponent } from './components/ticket-list/ticket-list.component';
import { TicketDetailsComponent } from './components/ticket-details/ticket-details.component';
import { CreateComponent } from './components/create/create.component';
import { FilterPipe } from '../../shared/pipes/filter.pipe';
import { ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '../../core/core.module';

@NgModule({
  declarations: [
    DashboardComponent, 
    TicketListComponent, 
    TicketDetailsComponent,
    CreateComponent,
    FilterPipe,
  ],
  imports: [
    CommonModule,
    TicketingRoutingModule,
    RouterModule,
    TranslateModule.forChild(),
    ReactiveFormsModule,
    CoreModule
  ]
})
export class TicketingModule { }
