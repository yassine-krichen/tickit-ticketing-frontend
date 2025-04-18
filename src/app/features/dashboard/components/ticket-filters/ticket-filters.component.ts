import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface OrderByOption {
  value: string;
  label: string;
}

export interface OrderByEvent {
  field: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-ticket-filters',
  templateUrl: './ticket-filters.component.html',
  styleUrls: ['./ticket-filters.component.css']
})
export class TicketFiltersComponent {
  @Input() activeTab: string = 'All Tickets';
  @Output() tabChange = new EventEmitter<string>();
  @Output() orderByChange = new EventEmitter<OrderByEvent>();

  isOrderByDropdownOpen = false;
  isDirectionDropdownOpen = false;
  orderByDirection: 'asc' | 'desc' = 'desc';
  selectedOrderBy: string = 'created';

  tabs = [
    { id: 'All Tickets', label: 'All Tickets', icon: 'fas fa-list-ul' },
    { id: 'IN_PROGRESS', label: 'In Progress', icon: 'fas fa-sync-alt' },
    { id: 'BLOCKED', label: 'Blocked', icon: 'fas fa-ban' },
    { id: 'RESOLVED', label: 'Resolved', icon: 'fas fa-check-circle' },
    { id: 'CLOSED', label: 'Closed', icon: 'fas fa-archive' }
  ];

  orderByOptions: OrderByOption[] = [
    { value: 'created', label: 'Recent' },
    { value: 'title', label: 'Title' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' }
  ];

  setActiveTab(tabId: string): void {
    this.tabChange.emit(tabId);
  }

  toggleOrderByDropdown(event: Event): void {
    event.stopPropagation();
    this.isOrderByDropdownOpen = !this.isOrderByDropdownOpen;
    if (this.isOrderByDropdownOpen) {
      this.isDirectionDropdownOpen = false;
    }
  }

  toggleDirectionDropdown(event: Event): void {
    event.stopPropagation();
    this.isDirectionDropdownOpen = !this.isDirectionDropdownOpen;
    if (this.isDirectionDropdownOpen) {
      this.isOrderByDropdownOpen = false;
    }
  }

  selectOrderBy(option: OrderByOption, event: Event): void {
    event.stopPropagation();
    this.selectedOrderBy = option.value;
    this.isOrderByDropdownOpen = false;
    this.emitOrderByChange();
  }

  toggleDirection(event: Event): void {
    event.stopPropagation();
    this.orderByDirection = this.orderByDirection === 'asc' ? 'desc' : 'asc';
    this.isDirectionDropdownOpen = false;
    this.emitOrderByChange();
  }

  emitOrderByChange(): void {
    this.orderByChange.emit({
      field: this.selectedOrderBy,
      direction: this.orderByDirection
    });
  }

  getOrderByLabel(): string {
    const option = this.orderByOptions.find(o => o.value === this.selectedOrderBy);
    return option ? option.label : 'Recent';
  }

  getDirectionIcon(): string {
    return this.orderByDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }
}
