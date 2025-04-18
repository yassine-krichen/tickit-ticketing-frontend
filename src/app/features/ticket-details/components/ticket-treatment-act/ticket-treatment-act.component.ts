import { Component, Input } from "@angular/core";
import { TreatmentAct } from "src/app/core/models/treatment-act.model";

/**
 * Component that displays detailed information about a treatment act
 * including case information, task details, dates, and financial information
 */
@Component({
    selector: "app-ticket-treatment-act",
    templateUrl: "./ticket-treatment-act.component.html",
    styleUrls: ["./ticket-treatment-act.component.css"]
})
export class TicketTreatmentActComponent {
    @Input() acteTraitement: string;
    @Input() treatmentAct: TreatmentAct;

    // Status-to-color mapping constants
    private readonly _CASE_STATUS_CLASSES = {
        "ONGOING": "bg-primary",
        "COMPLETED": "bg-success",
        "CANCELLED": "bg-danger",
        "SUSPENDED": "bg-warning text-dark",
        "PENDING": "bg-info"
    };

    private readonly _PRIORITY_CLASSES = {
        "HIGH": "bg-danger",
        "MEDIUM": "bg-warning text-dark",
        "LOW": "bg-info",
        "P1": "bg-secondary",
        "P2": "bg-primary",
        "P3": "bg-info",
        "P4": "bg-warning text-dark",
        "P5": "bg-danger"
    };

    private readonly _BILLING_STATUS_CLASSES = {
        "PENDING": "bg-warning text-dark",
        "APPROVED": "bg-success",
        "REJECTED": "bg-danger",
        "PAID": "bg-info"
    };

    /**
     * Returns the appropriate Bootstrap class for a case status
     * @param status The case status string
     * @returns CSS class string for the badge
     */
    getCaseStatusClass(status: string): string {
        if (!status) {
            return "bg-secondary";
        }
        
        const normalizedStatus = status.toUpperCase();
        return this._CASE_STATUS_CLASSES[normalizedStatus] || "bg-secondary";
    }

    /**
     * Returns the appropriate Bootstrap class for a priority level
     * @param priority The priority string
     * @returns CSS class string for the badge
     */
    getPriorityClass(priority: string): string {
        if (!priority) {
            return "bg-secondary";
        }
        
        const normalizedPriority = priority.toUpperCase();
        return this._PRIORITY_CLASSES[normalizedPriority] || "bg-secondary";
    }

    /**
     * Returns the appropriate Bootstrap class for a billing status
     * @param status The billing status string
     * @returns CSS class string for the badge
     */
    getBillingStatusClass(status: string): string {
        if (!status) {
            return "bg-secondary";
        }
        
        const normalizedStatus = status.toUpperCase();
        return this._BILLING_STATUS_CLASSES[normalizedStatus] || "bg-secondary";
    }
}
