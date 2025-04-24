import { Component, Input, ViewEncapsulation } from '@angular/core';
import { getActionColor, getActionIcon } from 'src/app/core/utils/ticket.util';

interface TimelineEvent {
  type: 'creation' | 'status-change' | 'ai-insight';
  title: string;
  time: string;
  description: string;
  icon: string;
  additionalData?: any;
  action?: string;
}

@Component({
  selector: 'app-ticket-timeline',
  templateUrl: './ticket-timeline.component.html',
  styleUrls: ['./ticket-timeline.component.css'],
  // Disable view encapsulation to allow our styles to affect the icon properly
  encapsulation: ViewEncapsulation.None
})
export class TicketTimelineComponent {
  @Input() events: TimelineEvent[] = [];

  getActionColor = getActionColor;
  getActionIcon = getActionIcon;
}
