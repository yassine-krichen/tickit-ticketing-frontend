import { Component, Input } from '@angular/core';
import { getStatusLabel } from 'src/app/core/utils/ticket.util';

@Component({
  selector: 'app-ticket-status-badge',
  templateUrl: './ticket-status-badge.component.html',
  styleUrls: ['./ticket-status-badge.component.css']
})
export class TicketStatusBadgeComponent {
  @Input() status: string;

  getStatusColor(): { background: string, text: string } {
    switch (this.status) {
      case 'OPEN':
        return { background: '#e0ecfc', text: '#1e40af' };
      case 'IN_PROGRESS':
        return { background: '#dcfce7', text: '#166534' };
      case 'BLOCKED':
        return { background: '#fee2e2', text: '#b91c1c' };
      case 'RESOLVED':
        return { background: '#f0fdfa', text: '#0f766e' };
      case 'CLOSED':
        return { background: '#f4f4f5', text: '#52525b' };
      default:
        return { background: '#e0ecfc', text: '#1e40af' };
    }
  }
  
  getStatusLabel(): string {
    return getStatusLabel(this.status);
  }
}
