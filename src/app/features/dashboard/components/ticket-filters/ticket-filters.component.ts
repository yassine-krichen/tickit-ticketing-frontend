import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-ticket-filters',
  templateUrl: './ticket-filters.component.html',
  styleUrls: ['./ticket-filters.component.css']
})
export class TicketFiltersComponent {
  @Input() activeTab: string = 'All Tickets';
  @Output() tabChange = new EventEmitter<string>();

  tabs = [
    { id: 'All Tickets', label: 'All Tickets', icon: 'fas fa-list-ul' },
    { id: 'IN_PROGRESS', label: 'In Progress', icon: 'fas fa-sync-alt' },
    { id: 'BLOCKED', label: 'Blocked', icon: 'fas fa-ban' },
    { id: 'RESOLVED', label: 'Resolved', icon: 'fas fa-check-circle' },
    { id: 'CLOSED', label: 'Closed', icon: 'fas fa-archive' }
  ];

  setActiveTab(tabId: string): void {
    this.tabChange.emit(tabId);
  }
}
