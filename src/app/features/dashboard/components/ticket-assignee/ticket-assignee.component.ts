import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ticket-assignee',
  templateUrl: './ticket-assignee.component.html',
  styleUrls: ['./ticket-assignee.component.css']
})
export class TicketAssigneeComponent {
  @Input() assignee: string;

  get assigneeName(): string {
    return this.assignee || 'System';
  }

  getInitials(): string {
    if (!this.assignee || this.assignee === 'System') {
      return 'S';
    }
    
    const nameParts = this.assignee.split(' ');
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    
    return nameParts[0][0].toUpperCase();
  }

  getAssigneeColor(): string {
    // Generate a consistent color based on the assignee name
    if (!this.assignee || this.assignee === 'System') {
      return '#6c757d'; // Default gray for System
    }
    
    const colors = [
      '#4299e1', // blue
      '#48bb78', // green
      '#ed8936', // orange
      '#9f7aea', // purple
      '#f56565', // red
      '#38b2ac', // teal
      '#ed64a6', // pink
      '#ecc94b'  // yellow
    ];
    
    // Simple hash function to get a consistent color
    const hash = this.assignee.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }
}
