import { Component, OnInit } from '@angular/core';
import { TicketService } from '../../../../core/services/ticket/ticket.service';
import { BackendTicket, TicketResponse, Status, TicketUpdateDTO, TicketCount } from '../../../../core/models/ticket.model';
import { finalize } from 'rxjs/operators';

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

  mapToUiTickets(backendTickets: TicketResponse[]): Ticket[] {
    return backendTickets.map(bt => ({
      id: bt.id,
      title: bt.subject,
      status: bt.status,
      category: bt.acteTraitement,
      assignee: {
        initials: this.getInitials(bt.issuedBy),
        name: bt.issuedBy,
        team: 'N/A', // Not available in backend model
        role: 'N/A'  // Not available in backend model
      },
      tags: {
        status: bt.status,
        priority: bt.priority
      },
      meta: {
        created: bt.createdAt,
        responseTime: bt.responseSla?.toString() || 'N/A'
      }
    }));
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
      this.ticketService.deleteTicket(ticket.id)
        .subscribe({
          next: () => {
            console.log('Ticket deleted successfully');
            this.loadTickets(); // Refresh data
            this.loadTicketCounts(); // Refresh counts
          },
          error: (err) => {
            console.error('Error deleting ticket:', err);
          }
        });
    }
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
    
    if (!this.searchTerm) {
      return this.tickets;
    }
    
    const term = this.searchTerm.toLowerCase();
    return this.tickets.filter(ticket => {
      return (
        ticket.id.toLowerCase().includes(term) ||
        ticket.title.toLowerCase().includes(term) ||
        ticket.status.toLowerCase().includes(term) ||
        ticket.category.toLowerCase().includes(term) ||
        ticket.assignee.name.toLowerCase().includes(term)
      );
    });
  }
}
