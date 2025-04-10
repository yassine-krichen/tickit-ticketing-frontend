// ticket-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Priority, Status, Ticket, TicketResponse } from 'src/app/core/models/ticket.model';

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
  ticketId: string = 'BOT-1234';
  ticket: TicketResponse = {
    id: 'BOT-1234',
    subject: 'Payment processing error in checkout flow',
    priority: Priority.P4,
    status: Status.IN_PROGRESS,
    description: 'Customers are reporting an error when trying to complete payment using credit cards. The error occurs after entering card details and clicking "Pay Now".',
    issuedBy: 'jane.smith.pilot.tunisia-T1',
    createdAt: '39 days ago',
    updatedAt: '2/27/2025, 2:55:00 PM',
    responseSla: 15,
    resolutionSla: 15,
    acteTraitement: 'ESIMB-4321',
  };

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

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.ticketId = params['id'];
        // Fetch ticket details from service if needed
      }
    });
  }

  navigateBack(): void {
    window.history.back();
  }

  getInitials(name: string): string {
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('');
  }

  // Map priority to a user-friendly label (P1=lowest, P5=highest)
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

  userInfo: any = this.extractUserInfo(this.ticket.issuedBy);

  assignee = {
    initials: this.getInitials(this.userInfo.name),
    name: this.userInfo.name,
    team: this.userInfo.team,
    role: this.userInfo.role
  };

  // In ticket-details.component.ts, add these helper methods:

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
