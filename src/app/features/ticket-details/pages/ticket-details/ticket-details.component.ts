import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Priority, Status, TicketResponse } from 'src/app/core/models/ticket.model';
import { TicketService } from 'src/app/core/services/ticket/ticket.service';
import { finalize } from 'rxjs/operators';
import { extractUserInfo, getInitials, getPriorityLabel, getActionColor, getActionIcon } from '../../../../core/utils/ticket.util';

interface ProcessStep {
  name: string;
  status: 'completed' | 'error' | 'pending';
}

interface TimelineEvent {
  type: 'creation' | 'status-change' | 'ai-insight';
  title: string;
  time: string;
  description: string;
  icon: string;
  additionalData?: any;
  action?: string;
}

@Component({
  selector: 'app-ticket-details',
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.css']
})
export class TicketDetailsComponent implements OnInit {
  ticketId: string = '';
  ticket: TicketResponse;
  loading: boolean = false;
  error: string = '';
  assignee: any = {};

  processSteps: ProcessStep[] = [
    { name: 'Initial TreatmentAct created', status: 'completed' },
    { name: 'Initial TreatmentAct done', status: 'completed' },
    { name: '2nd TreatmentAct started', status: 'completed' },
    { name: '2nd TreatmentAct lack of context', status: 'error' },
    { name: 'Testing', status: 'pending' },
    { name: 'Deployment', status: 'pending' }
  ];

  timelineEvents: TimelineEvent[] = [
    {
      type: 'creation',
      title: 'Ticket Created',
      time: '39 days ago',
      description: 'Jane Smith created this ticket',
      icon: 'ticket-icon',
      action: 'POST'
    },
    {
      type: 'status-change',
      title: 'Status Changed',
      time: '1 hour after creation',
      description: 'Status changed from Open to In Progress',
      icon: 'status-icon',
      additionalData: { from: 'Open', to: 'In Progress' },
      action: 'PUT'
    },
    {
      type: 'status-change',
      title: 'Status Changed',
      time: '38 days ago',
      description: 'Status changed to Waiting for Info',
      icon: 'waiting-icon',
      additionalData: { to: 'Waiting for Info' },
      action: 'PUT'
    },
    {
      type: 'ai-insight',
      title: 'AI Insight Added',
      time: '15 minutes ago',
      description: 'BOTool AI detected a similar issue was resolved last month. Suggested solution available.',
      icon: 'ai-icon',
      action: 'AI'
    }
  ];

  recommendations = [
    {
      title: 'Similar Issue Found',
      description: 'This appears similar to a previous case that was resolved successfully.',
      icon: 'similar-icon',
      link: 'View Similar Case'
    },
    {
      title: 'Suggested Action',
      description: 'Send an automated reminder to the customer for the required information.',
      icon: 'action-icon'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.ticketId = id;
        this.loadTicket(id);
      }
    });
  }

  loadTicket(id: string): void {
    this.loading = true;
    this.error = '';

    this.ticketService.getTicketById(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (ticket) => {
          this.ticket = ticket;
          const userInfo = extractUserInfo(ticket.issuedBy);
          this.assignee = {
            initials: getInitials(userInfo.name),
            name: userInfo.name,
            team: userInfo.team,
            role: userInfo.role
          };
        },
        error: (err) => {
          console.error('Error loading ticket details:', err);
          this.error = 'Failed to load ticket details. Please try again later.';
        }
      });
  }

  navigateBack(): void {
    window.history.back();
  }

  getPriorityLabel(priority: string): string {
    switch(priority) {
      case 'P1': return 'Very-Low';
      case 'P2': return 'Low';
      case 'P3': return 'Medium';
      case 'P4': return 'High';
      case 'P5': return 'Critical';
      default: return 'Unknown';
    }
  }

  getActionColor(action: string): string {
    switch (action) {
      case 'POST': return '#10b981';    // green
      case 'PUT': return '#3b82f6';     // blue
      case 'AI': return '#f97316';      // orange
      case 'DELETE': return '#ef4444';  // red
      default: return '#6b7280';
    }
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'POST': return 'fa-plus-circle';
      case 'PUT': return 'fa-edit';
      case 'AI': return 'fa-robot';
      case 'DELETE': return 'fa-trash';
      default: return 'fa-info-circle';
    }
  }
}
