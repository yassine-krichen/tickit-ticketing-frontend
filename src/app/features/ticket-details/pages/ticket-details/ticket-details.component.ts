import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TicketService } from "src/app/core/services/ticket/ticket.service";
import { TreatmentActService } from "src/app/core/services/treatment-act/treatment-act.service";
import { TicketActivityService } from "src/app/core/services/ticket-activity/ticket-activity.service";
import { TicketResponse } from "src/app/core/models/ticket.model";
import { TreatmentAct, TreatmentActHistoryEntry } from "src/app/core/models/treatment-act.model";
import { TimelineEvent, TicketActivityDto } from "src/app/core/models/ticket-activity.model";
import { extractUserInfo, getInitials } from "../../../../core/utils/ticket.util";
import { getTimeAgo, formatDuration } from "src/app/shared/utils/date-utils";

declare var Notify: any;

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
    treatmentAct: TreatmentAct;
    historyEntries: TreatmentActHistoryEntry[] = [];
    treatmentActLoading: boolean = false;
    treatmentActError: string = "";
    timelineEvents: TimelineEvent[] = [];
    recommendations: any[] = [];

    // Activity timeline properties
    activities: TimelineEvent[] = [];
    activityLoading: boolean = false;
    activityError: string | null = null;
    activityPage: number = 0;
    activityPageSize: number = 5; // Changed from 10 to 5 as requested
    activityTotalPages: number = 0;
    activityQuery: string = "";
    activityType: string = "";
    activityUsername: string = "";
    activitySortField: string = "startTime";
    activitySortDir: string = "desc";

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _ticketService: TicketService,
        private _treatmentActService: TreatmentActService,
        private _activityService: TicketActivityService
    ) {}

    ngOnInit(): void {
        this._route.paramMap.subscribe(params => {
            this.ticketId = params.get("id");
            if (this.ticketId) {
                this.loadTicketData();
            } else {
                this.error = "Invalid ticket ID";
            }
        });
    }

    loadTicketData(): void {
        if (!this.ticketId) {
            this.error = "Invalid ticket ID";
            return;
        }

        this.loading = true;
        this._ticketService.getTicketById(this.ticketId).subscribe({
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
                this.loadTicketActivities();
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
        this._treatmentActService.getTreatmentAct(treatmentActId).subscribe({
            next: (treatmentAct) => {
                this.treatmentAct = treatmentAct;
                if (treatmentAct && treatmentAct.caseId) {
                    this.loadTreatmentActHistory(treatmentAct.caseId);
                }
                this.treatmentActLoading = false;
            },
            error: (error) => {
                this.treatmentActError = "Failed to load treatment act details";
                this.treatmentActLoading = false;
            }
        });
    }

    loadTreatmentActHistory(caseId: string): void {
        this._treatmentActService.getTreatmentActHistory(caseId).subscribe({
            next: (historyEntries) => {
                this.historyEntries = historyEntries;
            },
            error: (error) => {
                console.error("Error loading treatment act history:", error);
            }
        });
    }

    /**
     * Loads ticket activity data with pagination and filtering
     */
    loadTicketActivities(page: number = 0): void {
      console.log("Loading ticket activities for page:", page);
      this.activityLoading = true;
      this.activityError = null;
      this.activityPage = page;

      const filters = {
        q: this.activityQuery,
        type: this.activityType,
        username: this.activityUsername
      };

      console.log("Loading ticket activities with params:", {
        ticketId: this.ticketId,
        page: this.activityPage,
        size: this.activityPageSize,
        sort: `${this.activitySortField},${this.activitySortDir}`,
        filters
      });

      this._activityService.getActivities(
        this.ticketId,
        page,
        this.activityPageSize,
        `${this.activitySortField},${this.activitySortDir}`,
        filters
      ).subscribe(
        (response) => {
          this.activityLoading = false;
          this.activities = this._mapActivitiesToTimelineEvents(response.content);
          this.activityTotalPages = response.totalPages;
        },
        (error) => {
          this.activityLoading = false;
          this.activityError = "Failed to load ticket activities";
          console.error("Error loading ticket activities:", error);
        }
      );
    }

    /**
     * Maps raw activity DTOs to formatted timeline events for display
     */
    private _mapActivitiesToTimelineEvents(activities: TicketActivityDto[]): TimelineEvent[] {
        return activities.map(activity => {
            const timelineEvent: TimelineEvent = {
                id: activity.id,
                type: activity.type,
                title: this._getActivityTitle(activity),
                timeDisplay: getTimeAgo(activity.startTime),
                description: activity.description || "",
                iconClass: this._getActivityIconClass(activity.type),
                colorClass: this._getActivityColorClass(activity.type),
                timestamp: new Date(activity.startTime),
                username: activity.username,
                duration: activity.duration || "N/A",
            };

            if (activity.type === "UPDATE" && activity.description?.includes("status")) {
                const statusMatch = activity.description.match(/from '(.+)' to '(.+)'/i);
                if (statusMatch && statusMatch.length === 3) {
                    timelineEvent.metadata = {
                        oldStatus: statusMatch[1],
                        newStatus: statusMatch[2]
                    };
                }
            }

            return timelineEvent;
        });
    }

    /**
     * Generates a human-readable title based on activity type
     */
    private _getActivityTitle(activity: TicketActivityDto): string {
        switch (activity.type) {
            case "OPEN": return "Ticket Opened";
            case "CLOSE": return "Ticket Closed";
            case "UPDATE": return "Ticket Updated";
            case "EMAIL": return "Email Sent";
            case "CALL": return `Call (${formatDuration(activity.duration) || "N/A"})`;
            case "RESEARCH": return "Research Conducted";
            case "ASSIGNMENT": return "Ticket Assigned";
            case "OTHER":
            default: return "Activity Recorded";
        }
    }

    /**
     * Returns FontAwesome icon class based on activity type
     */
    private _getActivityIconClass(type: string): string {
        switch (type) {
            case "OPEN": return "fa-folder-open";
            case "CLOSE": return "fa-folder";
            case "UPDATE": return "fa-pen";
            case "EMAIL": return "fa-envelope";
            case "CALL": return "fa-phone";
            case "RESEARCH": return "fa-search";
            case "ASSIGNMENT": return "fa-user-plus";
            case "OTHER":
            default: return "fa-clipboard-list";
        }
    }

    /**
     * Returns color class based on activity type
     */
    private _getActivityColorClass(type: string): string {
        switch (type) {
            case "OPEN": return "primary";
            case "CLOSE": return "secondary";
            case "UPDATE": return "warning";
            case "EMAIL": return "info";
            case "CALL": return "success";
            case "RESEARCH": return "purple";
            case "ASSIGNMENT": return "indigo";
            case "OTHER":
            default: return "dark";
        }
    }

    /**
     * Handles page change events from the timeline component
     */
    onActivityPageChange(page: number): void {
        this.loadTicketActivities(page);
    }

    /**
     * Handles filter change events from the timeline component
     *
     * @param filters - Object containing filter parameters
     */
    onActivityFilterChange(filters: { q?: string; type?: string; username?: string; sortField?: string; sortDir?: string; }): void {
        console.log("Filters changed:", filters);

        // Update filter state
        this.activityQuery = filters.q || "";
        this.activityType = filters.type || "";
        this.activityUsername = filters.username || "";
        this.activitySortField = filters.sortField || "startTime";
        this.activitySortDir = filters.sortDir || "desc";

        // Reset to first page and reload activities with new filters
        this.loadTicketActivities(0);
    }

    /**
     * Handles creation of a new activity
     */
    onActivityCreated(activityData: any): void {
        this._activityService.createActivity(this.ticketId, activityData).subscribe(
            () => {
                // Reload activities to show the new one
                this.loadTicketActivities(this.activityPage);
            },
            (error) => {
                console.error("Error creating activity:", error);
                // Error handling could be improved with a notification
                if (typeof Notify !== 'undefined') {
                    new Notify({
                        status: 'error',
                        title: 'Error',
                        text: 'Failed to create activity. Please try again.',
                        effect: 'slide',
                        speed: 300,
                        position: 'right top'
                    });
                }
            }
        );
    }

    /**
     * Handles updating an existing activity
     */
    onActivityUpdated(activityData: any): void {
        this._activityService.updateActivity(
            this.ticketId,
            activityData.id,
            {
                description: activityData.description
            }
        ).subscribe(
            () => {
                // Reload activities to show the update
                this.loadTicketActivities(this.activityPage);
            },
            (error) => {
                console.error("Error updating activity:", error);
                if (typeof Notify !== "undefined") {
                    new Notify({
                        status: "error",
                        title: "Error",
                        text: "Failed to update activity. Please try again.",
                        effect: "slide",
                        speed: 300,
                        position: "right top"
                    });
                }
            }
        );
    }

    /**
     * Handles completing an activity
     */
    onActivityCompleted(activityId: number): void {
        this._activityService.completeActivity(this.ticketId, activityId.toString()).subscribe(
            () => {
                // Reload activities to show the completion
                this.loadTicketActivities(this.activityPage);
            },
            (error) => {
                console.error("Error completing activity:", error);
                if (typeof Notify !== 'undefined') {
                    new Notify({
                        status: 'error',
                        title: 'Error',
                        text: 'Failed to complete activity. Please try again.',
                        effect: 'slide',
                        speed: 300,
                        position: 'right top'
                    });
                }
            }
        );
    }

    /**
     * Handles deleting an activity
     */
    onActivityDeleted(activityId: number): void {
        this._activityService.deleteActivity(this.ticketId, activityId.toString()).subscribe(
            () => {
                // Reload activities to reflect deletion
                this.loadTicketActivities(this.activityPage);

                // Show success notification
                if (typeof Notify !== 'undefined') {
                    new Notify({
                        status: 'success',
                        title: 'Success',
                        text: 'Activity deleted successfully',
                        effect: 'slide',
                        speed: 300,
                        position: 'right top',
                        autoclose: true
                    });
                }
            },
            (error) => {
                console.error("Error deleting activity:", error);
                if (typeof Notify !== 'undefined') {
                    new Notify({
                        status: 'error',
                        title: 'Error',
                        text: 'Failed to delete activity. Please try again.',
                        effect: 'slide',
                        speed: 300,
                        position: 'right top',
                        autoclose: true
                    });
                }
            }
        );
    }

    navigateBack(): void {
        this._router.navigate(["/dashboard"]);
    }


}
