import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-ticket-actions',
  templateUrl: './ticket-actions.component.html',
  styleUrls: ['./ticket-actions.component.css']
})
export class TicketActionsComponent {
  @Input() ticketId: string;
  @Output() toggleDropdown = new EventEmitter<Event>();
  @Output() delete = new EventEmitter<void>();

  onToggleDropdown(event: Event): void {
    this.toggleDropdown.emit(event);
  }

  onDelete(): void {
    this.delete.emit();
  }
}
