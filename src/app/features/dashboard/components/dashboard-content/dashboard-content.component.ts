import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { TicketService } from 'src/app/core/services/ticket/ticket.service';
import { SearchCategory } from '../ticket-search/ticket-search.component';
import { OrderByEvent } from '../ticket-filters/ticket-filters.component';
import { FilterOptions } from '../filter-drawer/filter-drawer.component';
import { 
  Priority, 
  Status, 
  CaseType,
  TicketResponse,
  PaginatedResponse 
} from 'src/app/core/models/ticket.model';

@Component({
  selector: 'app-dashboard-content',
  templateUrl: './dashboard-content.component.html',
  styleUrls: ['./dashboard-content.component.css']
})
export class DashboardContentComponent implements OnInit {
  @ViewChild('ticketListContainer') ticketListContainer: ElementRef;
  
  tickets: TicketResponse[] = [];
  loading = true;
  error = null;
  
  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalItems = 0;
  isLastPage = false;
  loadingMore = false;
  
  // Search filters
  searchTerm = '';
  searchCategory: SearchCategory = 'title';
  
  // Tab filter
  activeTab = 'All Tickets';
  
  // Order by filter
  orderBy: OrderByEvent = { field: 'timestamp', direction: 'desc' };
  
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

  constructor(private ticketService: TicketService, private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.loadTickets();
    this.loadTicketStats();
  }
  
  /**
   * Loads tickets with pagination and the current filter settings
   */
  loadTickets(loadMore: boolean = false): void {
    if (loadMore) {
      if (this.isLastPage || this.loadingMore) {
        return;
      }
      this.loadingMore = true;
      this.currentPage++;
    } else {
      this.loading = true;
      this.error = null;
      this.tickets = [];
      this.currentPage = 0;
      this.isLastPage = false; // Reset isLastPage when loading fresh
    }
    
    // Map status filter from UI to API
    let statusFilter: Status = null;
    if (this.activeTab !== 'All Tickets') {
      statusFilter = this.activeTab as Status;
    } else if (this.advancedFilters.statuses.length === 1) {
      statusFilter = this.advancedFilters.statuses[0];
    }
    
    // Map priority filter
    let priorityFilter: Priority = null;
    if (this.advancedFilters.priorities.length === 1) {
      priorityFilter = this.advancedFilters.priorities[0];
    }
    
    this.ticketService.getPaginatedTickets(
      this.currentPage,
      this.pageSize,
      this.orderBy.field,
      this.orderBy.direction,
      this.searchTerm,
      statusFilter,
      priorityFilter
    ).subscribe(
      (response: PaginatedResponse<TicketResponse>) => {
        // Append or replace tickets
        if (loadMore) {
          this.tickets = [...this.tickets, ...response.content];
        } else {
          this.tickets = response.content;
        }
        
        // Update pagination info
        this.totalPages = response.totalPages;
        this.totalItems = response.totalItems;
        
        // Fix for isLastPage being undefined - use the returned value or determine from page numbers
        if (response.isLastPage !== undefined) {
          this.isLastPage = response.isLastPage;
        } else {
          // Fallback calculation if isLastPage is not provided by the API
          this.isLastPage = response.pageNumber >= response.totalPages - 1 || response.content.length === 0;
        }
        
        console.log('Pagination data:', {
          pageNumber: response.pageNumber,
          pageSize: response.pageSize,
          totalItems: response.totalItems,
          totalPages: response.totalPages,
          isLastPage: this.isLastPage,
          contentLength: response.content.length
        });
        
        // If we received an empty array and it's not the first page, we've hit the end
        if (response.content.length === 0 && this.currentPage > 0) {
          this.isLastPage = true;
        }
        
        console.log('Loaded tickets:', this.tickets.length, 'Total:', this.totalItems, 'Last page:', this.isLastPage);
        
        this.loading = false;
        this.loadingMore = false;
      },
      (error) => {
        this.error = 'Failed to load tickets. Please try again later.';
        this.loading = false;
        this.loadingMore = false;
        console.error('Error loading tickets:', error);
      }
    );
  }

  loadTicketStats(): void {
    this.ticketService.getAllTicketStats().subscribe(
      (stats) => {
        this.totalTicketsCount = stats.totalTickets || 0;
        // Count tickets by status
        const countsByStatus = stats.countsByStatus || [];
        this.inProgressCount = this.getCountForCategory(countsByStatus, 'IN_PROGRESS');
        this.blockedCount = this.getCountForCategory(countsByStatus, 'BLOCKED');
        this.resolvedCount = this.getCountForCategory(countsByStatus, 'RESOLVED');
      },
      (error) => {
        console.error('Error loading ticket statistics:', error);
      }
    );
  }

  getCountForCategory(counts: any[], category: string): number {
    const found = counts.find(item => item.category === category);
    return found ? found.count : 0;
  }

  /**
   * Handles scroll events to implement infinite scrolling
   */
  @HostListener('scroll', ['$event'])
  onScroll(event: Event): void {
    // Only handle scroll events if not in loading state
    if (!this.loading && !this.loadingMore) {
      const element = event.target as HTMLElement;
      
      // Calculate scroll position
      const scrollPosition = element.scrollTop + element.clientHeight;
      const scrollThreshold = element.scrollHeight - 100; // Load more when 100px from bottom
      
      // If we're close to the bottom and not on the last page, load more
      if (scrollPosition >= scrollThreshold && !this.isLastPage) {
        console.log('Near bottom, loading more tickets...');
        this.loadMoreTickets();
      }
    }
  }

  /**
   * Loads more tickets when the user scrolls near the bottom
   */
  loadMoreTickets(): void {
    if (!this.isLastPage && !this.loadingMore && !this.loading) {
      // Safety check to prevent infinite loading
      if (this.currentPage > 20) {
        console.log('Reached maximum page limit (20), stopping infinite scroll');
        this.isLastPage = true;
        return;
      }
      this.loadTickets(true);
    }
  }

  onSearchChange(searchEvent: {term: string, category: SearchCategory}): void {
    this.searchTerm = searchEvent.term;
    this.searchCategory = searchEvent.category;
    this.loadTickets(); // Reload with new search parameters
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.loadTickets(); // Reload with new tab filter
  }
  
  onOrderByChange(orderBy: OrderByEvent): void {
    this.orderBy = orderBy;
    this.loadTickets(); // Reload with new sort settings
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
    this.loadTickets(); // Reload with new advanced filters
  }

  deleteTicket(ticket: any): void {
    if (confirm(`Are you sure you want to delete ticket #${ticket.id}?`)) {
      this.ticketService.deleteTicket(ticket.id).subscribe({
        next: (response) => {
          // Filter out the deleted ticket
          this.tickets = this.tickets.filter(t => t.id !== ticket.id);
          this.loadTicketStats(); // Reload statistics
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
    this.orderBy = { field: 'timestamp', direction: 'desc' };
    
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
    
    // Reset pagination and reload tickets
    this.currentPage = 0;
    this.isLastPage = false;
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
    if (this.orderBy.field !== 'timestamp' || this.orderBy.direction !== 'desc') {
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
