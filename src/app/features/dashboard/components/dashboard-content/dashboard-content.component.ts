import { Component, OnInit } from '@angular/core';
import { TicketService } from 'src/app/core/services/ticket/ticket.service';
import { SearchCategory } from '../ticket-search/ticket-search.component';

@Component({
  selector: 'app-dashboard-content',
  templateUrl: './dashboard-content.component.html',
  styleUrls: ['./dashboard-content.component.css']
})
export class DashboardContentComponent implements OnInit {
  tickets = [];
  loading = true;
  error = null;
  searchTerm = '';
  searchCategory: SearchCategory = 'title';
  activeTab = 'All Tickets';
  
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
    
    return filtered;
  }

  clearFilter(): void {
    this.searchTerm = '';
    this.activeTab = 'All Tickets';
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
}
