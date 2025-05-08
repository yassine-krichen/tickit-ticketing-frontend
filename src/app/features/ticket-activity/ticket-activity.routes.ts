import { Routes } from '@angular/router';
import { TicketActivityDetailsComponent } from './pages/ticket-activity-details/ticket-activity-details.component';
import { TicketActivityEditComponent } from './pages/ticket-activity-edit/ticket-activity-edit.component';
import { AttachmentsManagementComponent } from './components/attachments-management/attachments-management.component';

export const ticketActivityRoutes: Routes = [
  {
    path: ':ticketId/activities',
    children: [
      {
        path: ':activityId',
        component: TicketActivityDetailsComponent,
      },
      {
        path: ':activityId/edit',
        component: TicketActivityEditComponent
      },
      {
        path: ':activityId/attachments',
        component: AttachmentsManagementComponent,
      },
    ],
  },
];
