import { Component, Input } from '@angular/core';
import { TicketResponse } from 'src/app/core/models/ticket.model';

@Component({
  selector: 'app-ticket-info',
  templateUrl: './ticket-info.component.html',
  styleUrls: ['./ticket-info.component.css']
})
export class TicketInfoComponent {
  @Input() ticket: TicketResponse;
  @Input() assignee: any;

  getPriorityLabel(priority: string): string {
    switch(priority) {
      case 'P1': return 'Very-Low';
      case 'P2': return 'Low';
      case 'P3': return 'Medium';
      case 'P4': return 'High';
      case 'P5': return 'Critical';
      default: return 'Unknown';
    }
  }
}
