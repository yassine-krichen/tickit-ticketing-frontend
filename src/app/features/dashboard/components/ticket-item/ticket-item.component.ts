import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ticket-item',
  templateUrl: './ticket-item.component.html',
  styleUrls: ['./ticket-item.component.css']
})
export class TicketItemComponent {
  @Input() ticket: any;
  @Output() delete = new EventEmitter<any>();
  @Output() toggleDropdown = new EventEmitter<{ event: Event, ticketId: string }>();

  constructor(private router: Router) {}

  onDelete(ticket: any, event?: Event): void {
    if (event) {
      event.stopPropagation(); // Prevent event bubbling to the routerLink
    }
    this.delete.emit(ticket);
  }

  onToggleDropdown(event: Event, ticketId: string): void {
    event.stopPropagation(); // Prevent event bubbling to the routerLink
    this.toggleDropdown.emit({ event, ticketId });
  }

  navigateToDetails(ticketId: string, event: MouseEvent): void {
    // Only navigate if the click is not on the dropdown menu or its children
    const targetElement = event.target as HTMLElement;
    if (!targetElement.closest('.ticket-actions')) {
      console.log('Navigating to ticket details for ticket:', ticketId);
      event.preventDefault();
      event.stopPropagation();
      
      // Document the current event for debugging
      console.log('Event target:', targetElement, 'Event type:', event.type);
      
      // Navigate directly without timeout
      this.router.navigate(['/ticket-details', ticketId]);
    }
  }
}
