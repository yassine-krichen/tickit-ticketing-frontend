import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TICKET_DETAILS_ROUTES } from './ticket-details.routes';
import { CoreModule } from 'src/app/core/core.module';

// Components
import { TicketDetailsComponent } from './pages/ticket-details/ticket-details.component';
import { TicketHeaderComponent } from './components/ticket-header/ticket-header.component';
import { TicketDescriptionComponent } from './components/ticket-description/ticket-description.component';
import { TicketTreatmentActComponent } from './components/ticket-treatment-act/ticket-treatment-act.component';
import { TicketTimelineComponent } from './components/ticket-timeline/ticket-timeline.component';
import { TicketSidebarComponent } from './components/ticket-sidebar/ticket-sidebar.component';
import { TicketInfoComponent } from './components/ticket-info/ticket-info.component';
import { CaseTrackerComponent } from './components/case-tracker/case-tracker.component';
import { AiRecommendationsComponent } from './components/ai-recommendations/ai-recommendations.component';
import { TicketMetadataComponent } from './components/ticket-metadata/ticket-metadata.component';

@NgModule({
  declarations: [
    TicketDetailsComponent,
    TicketHeaderComponent,
    TicketDescriptionComponent,
    TicketTreatmentActComponent,
    TicketTimelineComponent,
    TicketSidebarComponent,
    TicketInfoComponent,
    CaseTrackerComponent,
    AiRecommendationsComponent,
    TicketMetadataComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(TICKET_DETAILS_ROUTES),
    CoreModule
  ]
})
export class TicketDetailsModule { } 