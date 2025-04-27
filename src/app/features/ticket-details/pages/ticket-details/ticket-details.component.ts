import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TicketService } from "src/app/core/services/ticket/ticket.service";
import { TreatmentActService } from "src/app/core/services/treatment-act/treatment-act.service";
import { TicketResponse } from "src/app/core/models/ticket.model";
import { TreatmentAct, TreatmentActHistoryEntry } from "src/app/core/models/treatment-act.model";
import { extractUserInfo, getInitials, getPriorityLabel, getActionColor, getActionIcon } from "../../../../core/utils/ticket.util";

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
    selector: "app-ticket-details",
    templateUrl: "./ticket-details.component.html",
    styleUrls: ["./ticket-details.component.css"]
})
export class TicketDetailsComponent implements OnInit {
    ticketId: string = "";
    ticket: TicketResponse;
    loading: boolean = false;
    error: string = "";
    assignee: any = {};
    
    // New properties for treatment act
    treatmentAct: TreatmentAct;
    historyEntries: TreatmentActHistoryEntry[] = [];
    treatmentActLoading: boolean = false;
    treatmentActError: string = "";
    
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
        private router: Router,
        private ticketService: TicketService,
        private treatmentActService: TreatmentActService
    ) {}

    ngOnInit(): void {
        console.log("TicketDetailsComponent initialized");
        // Get the ticketId from the route parameters
        this.route.paramMap.subscribe(params => {
            this.ticketId = params.get('id');
            console.log("Route parameter ticketId:", this.ticketId);
            if (this.ticketId) {
                this.loadTicketData();
            } else {
                this.error = "Invalid ticket ID";
                console.error("No ticket ID found in route parameters");
            }
        });
    }

    loadTicketData(): void {
        if (!this.ticketId) {
            this.error = "Invalid ticket ID";
            return;
        }
        
        console.log("Loading ticket data for ID:", this.ticketId);
        this.loading = true;
        this.ticketService.getTicketById(this.ticketId).subscribe({
            next: (ticket) => {
                console.log("Ticket data loaded successfully:", ticket);
                this.ticket = ticket;
                const userInfo = extractUserInfo(ticket.issuedBy);
                this.assignee = {
                    initials: getInitials(userInfo.name),
                    name: userInfo.name,
                    team: userInfo.team,
                    role: userInfo.role
                };
                if (ticket && ticket.acteTraitement) {
                    this.loadTreatmentActData(ticket.acteTraitement);
                }
                this.loading = false;
            },
            error: (error) => {
                this.error = "Failed to load ticket details";
                this.loading = false;
                console.error("Error loading ticket:", error);
            }
        });
    }

    loadTreatmentActData(treatmentActId: string): void {
        this.treatmentActLoading = true;
        this.treatmentActService.getTreatmentAct(treatmentActId).subscribe({
            next: (treatmentAct) => {
                this.treatmentAct = treatmentAct;
                if (treatmentAct && treatmentAct.caseId) {
                    this.loadTreatmentActHistory(treatmentAct.caseId);
                }
                this.treatmentActLoading = false;
                console.log("Treatment Act Data:", treatmentAct);
            },
            error: (error) => {
                this.treatmentActError = "Failed to load treatment act details";
                this.treatmentActLoading = false;
                console.error("Error loading treatment act:", error);
            }
        });
    }

    loadTreatmentActHistory(caseId: string): void {
        this.treatmentActService.getTreatmentActHistory(caseId).subscribe({
            next: (historyEntries) => {
                this.historyEntries = historyEntries;
            },
            error: (error) => {
                console.error("Error loading treatment act history:", error);
            }
        });
    }

    navigateBack(): void {
        this.router.navigate(["/dashboard"]);
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
