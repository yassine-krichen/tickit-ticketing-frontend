import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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
}

@Component({
  selector: 'app-ticket-details',
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.css']
})
export class TicketDetailsComponent implements OnInit {
  ticketId: string = 'BOT-1234';
  ticket = {
    id: 'BOT-1234',
    title: 'Payment processing error in checkout flow',
    status: 'Waiting for Info',
    priority: 'High',
    description: 'Customers are reporting an error when trying to complete payment using credit cards. The error occurs after entering card details and clicking \'Pay Now\'.',
    createdBy: 'Jane Smith',
    createdAt: '39 days ago',
    createdDate: '2/27/2025, 1:10:00 PM',
    updatedDate: '2/27/2025, 2:55:00 PM',
    responseTime: '15m',
    treatmentAct: 'ESIMB-4321',
    progress: 40
  };

  processSteps: ProcessStep[] = [
    { name: 'Initial Assessment', status: 'completed' },
    { name: 'Technical Verification', status: 'completed' },
    { name: 'API Integration', status: 'error' },
    { name: 'Testing', status: 'pending' },
    { name: 'Deployment', status: 'pending' }
  ];

  timelineEvents: TimelineEvent[] = [
    {
      type: 'creation',
      title: 'Ticket Created',
      time: '39 days ago',
      description: 'Jane Smith created this ticket',
      icon: 'ticket-icon'
    },
    {
      type: 'status-change',
      title: 'Status Changed',
      time: '1 hour after creation',
      description: 'Status changed from Open to In Progress',
      icon: 'status-icon',
      additionalData: {
        from: 'Open',
        to: 'In Progress'
      }
    },
    {
      type: 'status-change',
      title: 'Status Changed',
      time: '38 days ago',
      description: 'Status changed to Waiting for Info',
      icon: 'waiting-icon',
      additionalData: {
        to: 'Waiting for Info'
      }
    },
    {
      type: 'ai-insight',
      title: 'AI Insight Added',
      time: '15 minutes ago',
      description: 'BOTool AI detected a similar issue was resolved last month. Suggested solution available.',
      icon: 'ai-icon'
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
        // In a real app, fetch ticket details from a service here
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
}
