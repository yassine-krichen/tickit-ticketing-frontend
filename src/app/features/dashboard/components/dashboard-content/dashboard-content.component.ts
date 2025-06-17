import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { TicketService } from 'src/app/core/services/ticket/ticket.service';
import { SearchCategory } from '../ticket-search/ticket-search.component';
import { OrderByEvent } from '../ticket-filters/ticket-filters.component';
import { FilterOptions } from '../filter-drawer/filter-drawer.component';
import {
  Priority,
  Status,
  CaseType,
  CaseStep,
  TicketResponse,
  PaginatedResponse,
} from 'src/app/core/models/ticket.model';
import { ActivatedRoute, Router } from '@angular/router';

// Declare Notify for TypeScript
declare const Notify: any;
declare const bootstrap: any; // Declare bootstrap for modal handling

@Component({
  selector: 'app-dashboard-content',
  templateUrl: './dashboard-content.component.html',
  styleUrls: ['./dashboard-content.component.css'],
})
export class DashboardContentComponent implements OnInit {
  @ViewChild('ticketListContainer') ticketListContainer: ElementRef;

  tickets: TicketResponse[] = [];
  loading = true;
  error: string = null;

  // Notification references
  private _loadingNotification: any = null;
  private _errorNotification: any = null;

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
    subStatuses: [],
  };

  // Drawer state
  isFilterDrawerOpen = false;

  // Statistics
  totalTicketsCount = 0;
  inProgressCount = 0;
  blockedCount = 0;
  resolvedCount = 0;

  totalTicketsMoM: number | null = null;
  inProgressMoM: number | null = null;
  blockedMoM: number | null = null;
  resolvedMoM: number | null = null;

  // Delete modal properties
  private _deleteModal: any = null;
  ticketToDelete: TicketResponse | null = null;

  // Add section control
  activeSection: string = 'analytics'; // Default to tickets section

  constructor(
    private ticketService: TicketService,
    private elementRef: ElementRef,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTickets();
    this.loadTicketStats();

    // Listen for fragment changes to switch sections
    this.route.fragment.subscribe((fragment) => {
      if (
        fragment &&
        ['tickets', 'analytics', 'ai-insights'].includes(fragment)
      ) {
        this.activeSection = fragment;
        this.scrollToSection(fragment);
      }
    });
  }

  ngAfterViewInit(): void {
    // Initialize modal after DOM is ready
    setTimeout(() => {
      this.initDeleteModal();
    });
  }

  /**
   * Shows a loading notification
   */
  private _showLoadingNotification(): void {
    // Close any existing loading notification
    this._closeNotification(this._loadingNotification);

    // Create a new loading notification
    this._loadingNotification = new Notify({
      status: 'info',
      title: 'Loading Tickets',
      text: '<i class="fas fa-spinner fa-spin me-2"></i> Retrieving ticket data...',
      effect: 'fade',
      speed: 300,
      showCloseButton: false,
      autoclose: false,
      position: 'right top',
    });

    this.loading = true;
  }

  /**
   * Hides the loading notification
   */
  private _hideLoadingNotification(): void {
    this._closeNotification(this._loadingNotification);
    this.loading = false;
  }

  /**
   * Shows an error notification
   * @param errorMessage - The error message to display
   */
  private _showErrorNotification(errorMessage: string): void {
    // Close any existing error notification
    this._closeNotification(this._errorNotification);

    // Create a new error notification
    this._errorNotification = new Notify({
      status: 'error',
      title: 'Error',
      text: `<i class="fas fa-exclamation-triangle me-2"></i> ${errorMessage}`,
      effect: 'fade',
      speed: 300,
      autoclose: true,
      autotimeout: 5000,
      position: 'right top',
    });

    this.error = errorMessage;
  }

  /**
   * Closes the given notification if it exists
   * @param notification - The notification to close
   */
  private _closeNotification(notification: any): void {
    if (notification) {
      notification.close();
    }
  }

  /**
   * Initialize the delete confirmation modal
   */
  private initDeleteModal(): void {
    const modalElement = document.getElementById('deleteTicketModal');
    if (modalElement && typeof bootstrap !== 'undefined') {
      this._deleteModal = new bootstrap.Modal(modalElement);
    }
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
      // Show loading notification for initial load
      if (!loadMore) {
        this._showLoadingNotification();
      }
      this.error = null;
      this.tickets = [];
      this.currentPage = 0;
      this.isLastPage = false; // Reset isLastPage when loading fresh
    }

    // Build comprehensive filter arrays
    const filterParams = this.buildFilterParams();

    console.log('Loading tickets with filters:', filterParams);

    this.ticketService
      .getPaginatedTickets(
        this.currentPage,
        this.pageSize,
        this.orderBy.field,
        this.orderBy.direction,
        this.searchTerm,
        filterParams.statuses,
        filterParams.priorities,
        filterParams.types,
        filterParams.steps
      )
      .subscribe({
        next: (response: PaginatedResponse<TicketResponse>) => {
          // Append or replace tickets
          if (loadMore) {
            this.tickets = [...this.tickets, ...response.content];
          } else {
            this.tickets = response.content;

            // Hide the loading notification when we get the initial data
            this._hideLoadingNotification();
          }

          // Update pagination info
          this.totalPages = response.totalPages;
          this.totalItems = response.totalItems;

          // Fix for isLastPage being undefined
          if (response.isLastPage !== undefined) {
            this.isLastPage = response.isLastPage;
          } else {
            this.isLastPage =
              response.pageNumber >= response.totalPages - 1 ||
              response.content.length === 0;
          }

          // If we received an empty array and it's not the first page, we've hit the end
          if (response.content.length === 0 && this.currentPage > 0) {
            this.isLastPage = true;
          }

          this.loading = false;
          this.loadingMore = false;
        },
        error: (error) => {
          const errorMessage =
            'Failed to load tickets. Please try again later.';
          this._showErrorNotification(errorMessage);
          this._hideLoadingNotification(); // Hide loading notification
          this.loading = false;
          this.loadingMore = false;
          console.error('Error loading tickets:', error);
        },
      });
  }

  /**
   * Build comprehensive filter parameters for API call
   */
  private buildFilterParams(): {
    statuses: Status[];
    priorities: Priority[];
    types: CaseType[];
    steps: CaseStep[];
  } {
    const filterParams = {
      statuses: [] as Status[],
      priorities: [] as Priority[],
      types: [] as CaseType[],
      steps: [] as CaseStep[],
    };

    // Handle status filtering
    if (this.advancedFilters.statuses.length > 0) {
      // Use advanced filter statuses if any are selected
      filterParams.statuses = [...this.advancedFilters.statuses];
    } else if (this.activeTab !== 'All Tickets') {
      // Use tab filter if no advanced filter is set
      filterParams.statuses = [this.activeTab as Status];
    }

    // Handle priority filtering
    if (this.advancedFilters.priorities.length > 0) {
      filterParams.priorities = [...this.advancedFilters.priorities];
    }

    // Handle type filtering
    if (this.advancedFilters.types.length > 0) {
      filterParams.types = [...this.advancedFilters.types];
    }

    // Handle step filtering
    if (this.advancedFilters.steps.length > 0) {
      filterParams.steps = [...this.advancedFilters.steps];
    }

    return filterParams;
  }

  /**
   * Loads ticket statistics including Month-over-Month comparisons
   */
  loadTicketStats(): void {
    this.ticketService.getAllTicketStats().subscribe({
      next: (stats) => {
        // Set basic counts
        this.totalTicketsCount = stats.totalTickets || 0;
        const countsByStatus = stats.countsByStatus || [];
        this.inProgressCount = this.getCountForCategory(
          countsByStatus,
          'IN_PROGRESS'
        );
        this.blockedCount = this.getCountForCategory(countsByStatus, 'BLOCKED');
        this.resolvedCount = this.getCountForCategory(
          countsByStatus,
          'RESOLVED'
        );

        // Set Month-over-Month comparison values if they exist
        if (stats.momComparisons) {
          this.totalTicketsMoM = stats.momComparisons.totalTickets ?? null;
          this.inProgressMoM = stats.momComparisons.inProgress ?? null;
          this.blockedMoM = stats.momComparisons.blocked ?? null;
          this.resolvedMoM = stats.momComparisons.resolved ?? null;
        } else {
          // Reset MoM values if not provided by API
          this.totalTicketsMoM = null;
          this.inProgressMoM = null;
          this.blockedMoM = null;
          this.resolvedMoM = null;
        }
      },
      error: (error) => {
        console.error('Error loading ticket statistics:', error);
        // Reset all values on error
        this.totalTicketsCount = 0;
        this.inProgressCount = 0;
        this.blockedCount = 0;
        this.resolvedCount = 0;
        this.totalTicketsMoM = null;
        this.inProgressMoM = null;
        this.blockedMoM = null;
        this.resolvedMoM = null;
      },
    });
  }

  getCountForCategory(counts: any[], category: string): number {
    const found = counts.find((item) => item.category === category);
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
        console.log(
          'Reached maximum page limit (20), stopping infinite scroll'
        );
        this.isLastPage = true;
        return;
      }
      this.loadTickets(true);
    }
  }

  onSearchChange(searchEvent: {
    term: string;
    category: SearchCategory;
  }): void {
    this.searchTerm = searchEvent.term;
    this.searchCategory = searchEvent.category;
    this.loadTickets(); // Reload with new search parameters
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    // Clear advanced status filters when tab changes
    if (tab !== 'All Tickets') {
      this.advancedFilters.statuses = [];
    }
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
    console.log('Advanced filters changed:', filters);
    this.advancedFilters = filters;

    // Clear tab filter if advanced status filters are used
    if (filters.statuses.length > 0) {
      this.activeTab = 'All Tickets';
    }

    this.loadTickets(); // Reload with new advanced filters
  }

  /**
   * Open the delete confirmation modal for a ticket
   *
   * @param ticket Ticket to be deleted
   */
  deleteTicket(ticket: TicketResponse): void {
    this.ticketToDelete = ticket;

    if (this._deleteModal) {
      this._deleteModal.show();
    } else {
      // Fallback to confirm dialog if modal isn't available
      if (confirm(`Are you sure you want to delete ticket #${ticket.id}?`)) {
        this.performDeleteTicket();
      }
    }
  }

  /**
   * Confirm and perform the ticket deletion
   */
  confirmDelete(): void {
    this.performDeleteTicket();

    if (this._deleteModal) {
      this._deleteModal.hide();
    }
  }

  /**
   * Perform the actual ticket deletion API call
   */
  private performDeleteTicket(): void {
    if (!this.ticketToDelete) return;

    this.ticketService.deleteTicket(this.ticketToDelete.id).subscribe({
      next: (response) => {
        // Filter out the deleted ticket
        this.tickets = this.tickets.filter(
          (t) => t.id !== this.ticketToDelete.id
        );

        // Reload statistics
        this.loadTicketStats();

        // Show success notification (using Notify instead of alert)
        new Notify({
          status: 'success',
          title: 'Ticket Deleted',
          text: response.message || 'Ticket deleted successfully',
          effect: 'fade',
          speed: 300,
          customClass: null,
          customIcon: null,
          showIcon: true,
          showCloseButton: true,
          autoclose: true,
          autotimeout: 3000,
          gap: 20,
          distance: 20,
          type: 1,
          position: 'right top',
        });

        this.ticketToDelete = null;
      },
      error: (error) => {
        console.error('Error deleting ticket:', error);

        // Show error notification
        new Notify({
          status: 'error',
          title: 'Error',
          text: 'Failed to delete ticket. Please try again.',
          effect: 'fade',
          speed: 300,
          customClass: null,
          customIcon: null,
          showIcon: true,
          showCloseButton: true,
          autoclose: true,
          autotimeout: 3000,
          gap: 20,
          distance: 20,
          type: 1,
          position: 'right top',
        });
      },
    });
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
      subStatuses: [],
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
    if (
      this.orderBy.field !== 'timestamp' ||
      this.orderBy.direction !== 'desc'
    ) {
      return true;
    }

    // Check if any advanced filters are active
    if (
      this.advancedFilters.priorities.length > 0 ||
      this.advancedFilters.statuses.length > 0 ||
      this.advancedFilters.types.length > 0 ||
      this.advancedFilters.steps.length > 0 ||
      this.advancedFilters.subStatuses.length > 0
    ) {
      return true;
    }

    return false;
  }

  ngOnDestroy(): void {
    // Clean up modal if needed
    if (this._deleteModal) {
      this._deleteModal.dispose();
    }
  }

  /**
   * Scroll to the specified section
   */
  private scrollToSection(section: string): void {
    setTimeout(() => {
      const element = document.getElementById(`section-${section}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  /**
   * Set active section programmatically
   */
  setActiveSection(section: string): void {
    this.activeSection = section;
    // Update URL fragment without navigation
    this.router.navigate([], { fragment: section, replaceUrl: true });
  }
}
