import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CREATE_UPDATE_ROUTES } from './create-update.routes';
import { CoreModule } from '../../core/core.module';

// Components
import { TicketCreateUpdateComponent } from './pages/ticket-create-update/ticket-create-update.component';
import { CreateHeaderComponent } from './components/create-header/create-header.component';
import { CreateTipComponent } from './components/create-tip/create-tip.component';
import { TicketFormComponent } from './components/ticket-form/ticket-form.component';
import { FormActionsComponent } from './components/form-actions/form-actions.component';

@NgModule({
  declarations: [
    TicketCreateUpdateComponent,
    CreateHeaderComponent,
    CreateTipComponent,
    TicketFormComponent,
    FormActionsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(CREATE_UPDATE_ROUTES),
    ReactiveFormsModule,
    CoreModule
  ]
})
export class TicketCreateUpdateModule { } 