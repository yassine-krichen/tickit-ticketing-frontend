import { Component, OnInit } from '@angular/core';

interface Ticket {
  id: string;
  title: string;
  status: string;
  category: string;
  assignee: {
    initials: string;
    name: string;
  };
  tags: {
    status: string;
    priority: string;
  };
  meta: {
    created: string;
    responseTime: string;
  };
  progress: number;
}

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css']
})
export class TicketListComponent implements OnInit {
  tickets: Ticket[] = [
    {
      id: 'BOT-1234',
      title: 'Payment processing error in checkout flow',
      status: 'Waiting for Info',
      category: 'ESIMB-4321',
      assignee: {
        initials: 'JS',
        name: 'Jane Smith'
      },
      tags: {
        status: 'waiting',
        priority: 'high'
      },
      meta: {
        created: '39 days ago',
        responseTime: '15m'
      },
      progress: 40
    },
    {
      id: 'BOT-1233',
      title: 'Customer unable to access account after password reset',
      status: 'Technical Review',
      category: 'BRAME-3456',
      assignee: {
        initials: 'MJ',
        name: 'Mark Johnson'
      },
      tags: {
        status: 'technical',
        priority: 'medium'
      },
      meta: {
        created: '39 days ago',
        responseTime: '22m'
      },
      progress: 50
    },
    {
      id: 'BOT-1232',
      title: 'Mobile app crashes when uploading profile picture',
      status: 'Blocked',
      category: 'ESIMB-5678',
      assignee: {
        initials: 'SW',
        name: 'Sarah Williams'
      },
      tags: {
        status: 'blocked',
        priority: 'critical'
      },
      meta: {
        created: '39 days ago',
        responseTime: '45m'
      },
      progress: 50
    },
    {
      id: 'BOT-1230',
      title: 'Discrepancy in monthly billing report calculations',
      status: 'Resolved',
      category: 'BRAME-2345',
      assignee: {
        initials: 'MB',
        name: 'Michael Brown'
      },
      tags: {
        status: 'resolved',
        priority: 'medium'
      },
      meta: {
        created: '41 days ago',
        responseTime: '30m'
      },
      progress: 100
    }
  ];

  searchTerm: string = '';
  activeTab: string = 'All Tickets';

  constructor() { }

  ngOnInit(): void {
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
  }

  updateTicket(ticket: Ticket): void {
    console.log('Update ticket', ticket);
  }

  deleteTicket(ticket: Ticket): void {
    console.log('Delete ticket', ticket);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  filteredTickets(): Ticket[] {
    if (!this.searchTerm) {
      if (this.activeTab === 'All Tickets') {
        return this.tickets;
      } else {
        return this.tickets.filter(ticket => 
          ticket.status.toLowerCase() === this.activeTab.toLowerCase());
      }
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
