import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TicketResponse } from 'src/app/core/models/ticket.model';

@Component({
  selector: 'app-ticket-header',
  templateUrl: './ticket-header.component.html',
  styleUrls: ['./ticket-header.component.css']
})
export class TicketHeaderComponent {
  @Input() ticket: TicketResponse;
  @Input() assignee: any;
  @Output() back = new EventEmitter<void>();

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
