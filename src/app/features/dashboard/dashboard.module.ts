import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { DASHBOARD_ROUTES } from './dashboard.routes';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DashboardContentComponent } from './components/dashboard-content/dashboard-content.component';
import { KpisMetricsComponent } from './components/kpis-metrics/kpis-metrics.component';
import { TicketActionsComponent } from './components/ticket-actions/ticket-actions.component';
import { TicketAssigneeComponent } from './components/ticket-assignee/ticket-assignee.component';
import { TicketFiltersComponent } from './components/ticket-filters/ticket-filters.component';
import { TicketItemComponent } from './components/ticket-item/ticket-item.component';
import { TicketMetaComponent } from './components/ticket-meta/ticket-meta.component';
import { TicketPriorityBadgeComponent } from './components/ticket-priority-badge/ticket-priority-badge.component';
import { TicketStatusBadgeComponent } from './components/ticket-status-badge/ticket-status-badge.component';
import { TicketSearchComponent } from './components/ticket-search/ticket-search.component';
import { FilterDrawerComponent } from './components/filter-drawer/filter-drawer.component';
import { CoreModule } from '../../core/core.module';
import { DashboardNavbarComponent } from './components/dashboard-navbar/dashboard-navbar.component';

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardContentComponent,
    KpisMetricsComponent,
    TicketActionsComponent,
    TicketAssigneeComponent,
    TicketFiltersComponent,
    TicketItemComponent,
    TicketMetaComponent,
    TicketPriorityBadgeComponent,
    TicketStatusBadgeComponent,
    TicketSearchComponent,
    FilterDrawerComponent,
    DashboardNavbarComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(DASHBOARD_ROUTES),
    ReactiveFormsModule,
    CoreModule
  ]
})
export class DashboardModule { } 