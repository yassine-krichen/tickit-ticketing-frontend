import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ticketActivityRoutes } from './ticket-activity.routes';
import { SharedModule } from '../../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

import { TicketActivityDetailsComponent } from './pages/ticket-activity-details/ticket-activity-details.component';
import { TicketActivityEditComponent } from './pages/ticket-activity-edit/ticket-activity-edit.component';
import { AttachmentsManagementComponent } from './components/attachments-management/attachments-management.component';
import { FileUploadModalComponent } from './components/file-upload-modal/file-upload-modal.component';
import { ActivityCommentsComponent } from './components/activity-comments/activity-comments.component';
import { CoreModule } from "../../core/core.module";

@NgModule({
  declarations: [
    TicketActivityDetailsComponent,
    TicketActivityEditComponent,
    AttachmentsManagementComponent,
    FileUploadModalComponent,
    ActivityCommentsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(ticketActivityRoutes),
    CoreModule
],
  exports: [
    TicketActivityDetailsComponent,
    FileUploadModalComponent,
    ActivityCommentsComponent
  ]
})
export class TicketActivityModule { }
