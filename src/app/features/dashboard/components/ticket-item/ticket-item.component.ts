import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-ticket-item',
  templateUrl: './ticket-item.component.html',
  styleUrls: ['./ticket-item.component.css']
})
export class TicketItemComponent {
  @Input() ticket: any;
  @Output() delete = new EventEmitter<any>();
  @Output() toggleDropdown = new EventEmitter<{ event: Event, ticketId: string }>();

  onDelete(ticket: any): void {
    this.delete.emit(ticket);
  }

  onToggleDropdown(event: Event, ticketId: string): void {
    this.toggleDropdown.emit({ event, ticketId });
  }
}
