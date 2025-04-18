import { Component, OnInit, HostListener } from '@angular/core';
import { TicketService } from 'src/app/core/services/ticket/ticket.service';
import { SearchCategory } from '../ticket-search/ticket-search.component';
import { OrderByEvent } from '../ticket-filters/ticket-filters.component';
import { FilterOptions } from '../filter-drawer/filter-drawer.component';
import { Priority, Status, CaseType } from 'src/app/core/models/ticket.model';

@Component({
  selector: 'app-dashboard-content',
  templateUrl: './dashboard-content.component.html',
  styleUrls: ['./dashboard-content.component.css']
})
export class DashboardContentComponent implements OnInit {
  tickets = [];
  loading = true;
  error = null;
  
  // Search filters
  searchTerm = '';
  searchCategory: SearchCategory = 'title';
  
  // Tab filter
  activeTab = 'All Tickets';
  
  // Order by filter
  orderBy: OrderByEvent = { field: 'created', direction: 'desc' };
  
  // Advanced filters
  advancedFilters: FilterOptions = {
    priorities: [],
    statuses: [],
    types: [],
    steps: [],
    subStatuses: []
  };
  
  // Drawer state
  isFilterDrawerOpen = false;
  
  // Statistics
  totalTicketsCount = 0;
  inProgressCount = 0;
  blockedCount = 0;
  resolvedCount = 0;

  constructor(private ticketService: TicketService) { }

  ngOnInit(): void {
    this.loadTickets();
  }
  
  loadTickets(): void {
    this.loading = true;
    this.error = null;
    
    this.ticketService.getAllTickets().subscribe(
      (tickets) => {
        this.tickets = tickets;
        this.calculateStatistics();
        this.loading = false;
      },
      (error) => {
        this.error = 'Failed to load tickets. Please try again later.';
        this.loading = false;
        console.error('Error loading tickets:', error);
      }
    );
  }

  calculateStatistics(): void {
    this.totalTicketsCount = this.tickets.length;
    this.inProgressCount = this.tickets.filter(ticket => ticket.status === 'IN_PROGRESS').length;
    this.blockedCount = this.tickets.filter(ticket => ticket.status === 'BLOCKED').length;
    this.resolvedCount = this.tickets.filter(ticket => ticket.status === 'RESOLVED').length;
  }

  onSearchChange(searchEvent: {term: string, category: SearchCategory}): void {
    this.searchTerm = searchEvent.term;
    this.searchCategory = searchEvent.category;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  
  onOrderByChange(orderBy: OrderByEvent): void {
    this.orderBy = orderBy;
  }
  
  toggleFilterDrawer(): void {
    this.isFilterDrawerOpen = !this.isFilterDrawerOpen;
    
    // Prevent scrolling of the main content when the drawer is open
    if (this.isFilterDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
  
  closeFilterDrawer(): void {
    this.isFilterDrawerOpen = false;
    document.body.style.overflow = '';
  }
  
  onAdvancedFilterChange(filters: FilterOptions): void {
    this.advancedFilters = filters;
  }

  filteredTickets(): any[] {
    let filtered = [...this.tickets];
    
    // Filter by tab (status)
    if (this.activeTab !== 'All Tickets') {
      filtered = filtered.filter(ticket => ticket.status === this.activeTab);
    }
    
    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      
      filtered = filtered.filter(ticket => {
        switch(this.searchCategory) {
          case 'title':
            return ticket.subject?.toLowerCase().includes(term);
          case 'description':
            return ticket.description?.toLowerCase().includes(term);
          case 'id':
            return ticket.id?.toString().includes(term);
          case 'assignee':
            // Check if assignee.name exists, otherwise use assignee directly
            if (ticket.assignee && typeof ticket.assignee === 'object' && ticket.assignee.name) {
              return ticket.assignee.name.toLowerCase().includes(term);
            } else if (ticket.assignee && typeof ticket.assignee === 'string' && ticket.assignee !== 'System') {
              return ticket.assignee.toLowerCase().includes(term);
            } else if (!ticket.assignee || ticket.assignee === 'System') {
              // For System assignees, check if:
              // 1. The term is the beginning part of 'system' (like 'sys', 'syst', etc.)
              // 2. The term contains 'system'
              const system = 'system';
              return system.startsWith(term) || term.includes(system);
            }
            return false;
          default:
            return ticket.subject?.toLowerCase().includes(term);
        }
      });
    }
    
    // Apply advanced filters
    
    // Filter by priority
    if (this.advancedFilters.priorities.length > 0) {
      filtered = filtered.filter(ticket => 
        this.advancedFilters.priorities.includes(ticket.priority as Priority)
      );
    }
    
    // Filter by status (if not already filtered by tab)
    if (this.advancedFilters.statuses.length > 0) {
      filtered = filtered.filter(ticket => 
        this.advancedFilters.statuses.includes(ticket.status as Status)
      );
    }
    
    // Filter by type
    if (this.advancedFilters.types.length > 0) {
      filtered = filtered.filter(ticket => 
        this.advancedFilters.types.includes(ticket.type as CaseType)
      );
    }
    
    // Filter by step
    if (this.advancedFilters.steps.length > 0) {
      filtered = filtered.filter(ticket => 
        this.advancedFilters.steps.includes(ticket.step as CaseType)
      );
    }
    
    // Filter by subStatus
    if (this.advancedFilters.subStatuses.length > 0) {
      filtered = filtered.filter(ticket => 
        this.advancedFilters.subStatuses.includes(ticket.subStatus)
      );
    }
    
    // Sort by orderBy field and direction
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch(this.orderBy.field) {
        case 'created':
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
        case 'title':
          valueA = a.subject?.toLowerCase() || '';
          valueB = b.subject?.toLowerCase() || '';
          break;
        case 'priority':
          // Convert P1-P5 to numeric values (P5 is highest)
          const priorityMap = { 'P1': 1, 'P2': 2, 'P3': 3, 'P4': 4, 'P5': 5 };
          valueA = priorityMap[a.priority] || 0;
          valueB = priorityMap[b.priority] || 0;
          break;
        case 'status':
          // Use status order: OPEN, IN_PROGRESS, BLOCKED, RESOLVED, CLOSED
          const statusMap = { 
            'OPEN': 1, 
            'IN_PROGRESS': 2, 
            'BLOCKED': 3, 
            'RESOLVED': 4, 
            'CLOSED': 5 
          };
          valueA = statusMap[a.status] || 0;
          valueB = statusMap[b.status] || 0;
          break;
        default:
          valueA = a[this.orderBy.field];
          valueB = b[this.orderBy.field];
      }
      
      // Apply sort direction
      if (this.orderBy.direction === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    return filtered;
  }

  clearFilter(): void {
    this.searchTerm = '';
    this.activeTab = 'All Tickets';
    this.advancedFilters = {
      priorities: [],
      statuses: [],
      types: [],
      steps: [],
      subStatuses: []
    };
    this.orderBy = { field: 'created', direction: 'desc' };
  }

  deleteTicket(ticket: any): void {
    if (confirm(`Are you sure you want to delete ticket #${ticket.id}?`)) {
      this.ticketService.deleteTicket(ticket.id).subscribe({
        next: (response) => {
          // Filter out the deleted ticket
          this.tickets = this.tickets.filter(t => t.id !== ticket.id);
          this.calculateStatistics();
          // Show success message
          alert(response.message || 'Ticket deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting ticket:', error);
          alert('Failed to delete ticket. Please try again.');
        }
      });
    }
  }

  toggleDropdown(event: Event, ticketId: string): void {
    // This method is no longer needed as dropdown is managed by ticket-actions component
    // We keep it for compatibility but don't need to do anything
    console.log('Dropdown toggle event received for ticket', ticketId);
  }

  clearAllFilters(): void {
    // Clear search
    this.searchTerm = '';
    this.searchCategory = 'title';
    
    // Clear tab filter
    this.activeTab = 'All Tickets';
    
    // Clear order by filter
    this.orderBy = { field: 'created', direction: 'desc' };
    
    // Clear advanced filters
    this.advancedFilters = {
      priorities: [],
      statuses: [],
      types: [],
      steps: [],
      subStatuses: []
    };
    
    // Close filter drawer if open
    this.isFilterDrawerOpen = false;
    
    // Reload tickets with cleared filters
    this.loadTickets();
  }

  hasActiveFilters(): boolean {
    // Check if search term is not empty
    if (this.searchTerm.trim()) {
      return true;
    }

    // Check if active tab is not default
    if (this.activeTab !== 'All Tickets') {
      return true;
    }

    // Check if order by is not default
    if (this.orderBy.field !== 'created' || this.orderBy.direction !== 'desc') {
      return true;
    }

    // Check if any advanced filters are active
    if (this.advancedFilters.priorities.length > 0 ||
        this.advancedFilters.statuses.length > 0 ||
        this.advancedFilters.types.length > 0 ||
        this.advancedFilters.steps.length > 0 ||
        this.advancedFilters.subStatuses.length > 0) {
      return true;
    }

    return false;
  }
}
