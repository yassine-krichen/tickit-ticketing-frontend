import { Component, Input } from '@angular/core';
import { getPriorityLabel } from 'src/app/core/utils/ticket.util';

@Component({
  selector: 'app-ticket-priority-badge',
  templateUrl: './ticket-priority-badge.component.html',
  styleUrls: ['./ticket-priority-badge.component.css']
})
export class TicketPriorityBadgeComponent {
  @Input() priority: string;

  getPriorityColor(): { background: string, text: string } {
    switch (this.priority) {
      case 'P5':
        return { background: '#f4f4f5', text: '#52525b' }; // Very Low
      case 'P4':
        return { background: '#e0ecfc', text: '#1e40af' }; // Low
      case 'P3':
        return { background: '#fef9c3', text: '#854d0e' }; // Medium
      case 'P2':
        return { background: '#ffedd5', text: '#c2410c' }; // High
      case 'P1':
        return { background: '#fee2e2', text: '#b91c1c' }; // Critical
      default:
        return { background: '#fef9c3', text: '#854d0e' }; // Default medium
    }
  }
  
  getPriorityLabel(): string {
    return getPriorityLabel(this.priority);
  }
}
