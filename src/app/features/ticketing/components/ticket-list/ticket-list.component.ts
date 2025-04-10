import { Component, OnInit } from '@angular/core';
import { TicketService } from '../../../../core/services/ticket/ticket.service';
import { BackendTicket, TicketResponse, Status, TicketUpdateDTO, TicketCount, Priority } from '../../../../core/models/ticket.model';
import { finalize } from 'rxjs/operators';
// Declare Bootstrap's dropdown functionality
declare var bootstrap: any;

// Frontend UI ticket interface - keeping this separate from backend model
interface Ticket {
  id: string;
  title: string;
  status: string;
  category: string;
  assignee: {
    initials: string;
    name: string;
    team: string;
    role: string;
  };
  tags: {
    status: string;
    priority: string;
    priorityLabel: string; // Added for display purposes
  };
  meta: {
    created: string;
    responseTime: string;
  };
}

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css']
})
export class TicketListComponent implements OnInit {
  tickets: Ticket[] = [];
  backendTickets: TicketResponse[] = [];
  statusCounts: TicketCount[] = [];

  loading = false;
  error = '';
  searchTerm: string = '';
  activeTab: string = 'All Tickets';

  constructor(private ticketService: TicketService) { }

  // Getter methods for ticket counts
  get totalTicketsCount(): number {
    return this.tickets.length;
  }

  get inProgressCount(): number {
    const countObj = this.statusCounts.find(s => s.status === 'IN_PROGRESS');
    return countObj ? countObj.count : 0;
  }

  get blockedCount(): number {
    const countObj = this.statusCounts.find(s => s.status === 'BLOCKED');
    return countObj ? countObj.count : 0;
  }

  get resolvedCount(): number {
    const countObj = this.statusCounts.find(s => s.status === 'RESOLVED');
    return countObj ? countObj.count : 0;
  }

  get closedCount(): number {
    const countObj = this.statusCounts.find(s => s.status === 'CLOSED');
    return countObj ? countObj.count : 0;
  }

  ngOnInit(): void {
    this.loadTickets();
    this.loadTicketCounts();
    
    // Initialize Bootstrap dropdowns after view is loaded
    setTimeout(() => {
      const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
      const dropdownList = Array.from(dropdownElementList).map(dropdownToggleEl => new bootstrap.Dropdown(dropdownToggleEl));
    }, 500);
  }

  loadTickets(status?: Status): void {
    this.loading = true;
    this.error = '';
    
    this.ticketService.getAllTickets(status)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          this.backendTickets = response;
          this.tickets = this.mapToUiTickets(response);
        },
        error: (err) => {
          console.error('Error loading tickets:', err);
          this.error = 'Failed to load tickets. Please try again later.';
        }
      });
  }

  loadTicketCounts(): void {
    this.ticketService.getTicketCountsByStatus()
      .subscribe({
        next: (counts) => {
          this.statusCounts = counts;
        },
        error: (err) => {
          console.error('Error loading ticket counts:', err);
        }
      });
  }

  // Map priority to a user-friendly label (P1=lowest, P5=highest)
  getPriorityLabel(priority: string): string {
    switch(priority) {
      case 'P1': return 'Low';
      case 'P2': return 'Medium-Low';
      case 'P3': return 'Medium';
      case 'P4': return 'High';
      case 'P5': return 'Critical';
      default: return 'Unknown';
    }
  }

  // Extract better user information from the issuedBy field
  extractUserInfo(issuedBy: string): { name: string, team: string, role: string } {
    // Split the string by dots
    const parts = issuedBy.split('.');
    
    if (parts.length < 4) {
      return {
        name: issuedBy,
        team: 'Support Team',
        role: 'Agent'
      };
    }

    // First two parts form the name
    const name = `${parts[0]} ${parts[1]}`.replace(/\b\w/g, c => c.toUpperCase());
    
    // Third part is the role
    const role = parts[2].charAt(0).toUpperCase() + parts[2].slice(1);
    
    // Fourth part is the team
    const team = parts[3].charAt(0).toUpperCase() + parts[3].slice(1);

    return { name, team, role };
  }

  mapToUiTickets(backendTickets: TicketResponse[]): Ticket[] {
    return backendTickets.map(bt => {
      // Extract better user information
      const userInfo = this.extractUserInfo(bt.issuedBy);
      
      return {
        id: bt.id,
        title: bt.subject,
        status: bt.status,
        category: bt.acteTraitement,
        assignee: {
          initials: this.getInitials(userInfo.name),
          name: userInfo.name,
          team: userInfo.team,
          role: userInfo.role
        },
        tags: {
          status: bt.status,
          priority: bt.priority,
          priorityLabel: this.getPriorityLabel(bt.priority)
        },
        meta: {
          created: bt.createdAt,
          responseTime: bt.responseSla ? `${bt.responseSla} hours` : 'No response yet'
        }
      };
    });
  }

  getInitials(name: string): string {
    // Improved to get up to two initials from first and last name
    return name
      .split(' ')
      .filter(part => part.length > 0)
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
  }

  updateTicket(ticket: Ticket): void {
    const backendTicket = this.backendTickets.find(bt => bt.id === ticket.id);
    if (!backendTicket) return;

    // Create update DTO based on UI changes
    const updateData: TicketUpdateDTO = {
      subject: ticket.title,
      status: backendTicket.status as Status,
      // Add other fields as needed
    };

    this.ticketService.updateTicket(ticket.id, updateData)
      .subscribe({
        next: (response) => {
          console.log('Ticket updated successfully', response);
          this.loadTickets(); // Refresh data
        },
        error: (err) => {
          console.error('Error updating ticket:', err);
        }
      });
  }

  deleteTicket(ticket: Ticket): void {
    if (confirm(`Are you sure you want to delete ticket ${ticket.id}?`)) {
      // First update the UI immediately for better user experience
      this.tickets = this.tickets.filter(t => t.id !== ticket.id);
      this.backendTickets = this.backendTickets.filter(t => t.id !== ticket.id);
      
      // Set a temporary flag to show deletion in progress
      const deletedId = ticket.id;
      
      this.ticketService.deleteTicket(ticket.id)
        .subscribe({
          next: () => {
            console.log('Ticket deleted successfully');
            // No need to reload data if we've already updated the arrays
            this.loadTicketCounts(); // Just update the counts
          },
          error: (err) => {
            console.error('Error deleting ticket:', err);
            this.error = 'Failed to delete ticket. Please try again.';
            
            // Revert our optimistic UI update since the server call failed
            this.loadTickets();
          }
        });
    }
  }

  // Method to manually toggle the dropdown
  toggleDropdown(event: Event, ticketId: string): void {
    event.stopPropagation();
    
    // Close any other open dropdowns first
    const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
    openDropdowns.forEach(dropdown => {
      if (dropdown.id !== `dropdown-menu-${ticketId}`) {
        dropdown.classList.remove('show');
      }
    });
    
    // Toggle the clicked dropdown
    const dropdownMenu = document.querySelector(`#dropdown-menu-${ticketId}`);
    if (dropdownMenu) {
      dropdownMenu.classList.toggle('show');
    }
    
    // Add click event listener to close dropdown when clicking outside
    const closeDropdowns = (e: any) => {
      if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu.show').forEach(dropdown => {
          dropdown.classList.remove('show');
        });
        document.removeEventListener('click', closeDropdowns);
      }
    };
    
    document.addEventListener('click', closeDropdowns);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    
    // Map UI tab names to backend status enum
    let status: Status | undefined;
    if (tab !== 'All Tickets') {
      status = tab.toUpperCase().replace(' ', '_') as Status;
    }
    
    this.loadTickets(status);
  }

  // Method to clear filters
  clearFilter(): void {
    this.activeTab = 'All Tickets';
    this.searchTerm = '';
    this.loadTickets(); // Reload all tickets
  }

  filteredTickets(): Ticket[] {
    if (!this.tickets) return [];
    
    // Start with filtering by the active tab if it's not "All Tickets"
    let filtered = [...this.tickets]; // Create a new array to ensure change detection
    
    // Then apply search term filtering if needed
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(ticket => {
        return (
          ticket.id.toLowerCase().includes(term) ||
          ticket.title.toLowerCase().includes(term) ||
          ticket.status.toLowerCase().includes(term) ||
          ticket.category.toLowerCase().includes(term) ||
          ticket.assignee.name.toLowerCase().includes(term)
        );
      });
    }
    
    return filtered;
  }
}
