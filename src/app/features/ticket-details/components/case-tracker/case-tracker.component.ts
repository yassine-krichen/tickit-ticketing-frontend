import { Component, Input, OnInit } from "@angular/core";
import { TreatmentActHistoryEntry } from "src/app/core/models/treatment-act.model";

declare var bootstrap: any;

/**
 * Component for displaying the timeline of treatment act history
 * Shows chronological progression of actions with appropriate styling
 */
@Component({
    selector: "app-case-tracker",
    templateUrl: "./case-tracker.component.html",
    styleUrls: ["./case-tracker.component.css"]
})
export class CaseTrackerComponent implements OnInit {
    @Input() steps: TreatmentActHistoryEntry[] = [];
    
    /**
     * Currently selected step for detailed view
     */
    selectedStep: TreatmentActHistoryEntry | null = null;
    
    /**
     * Bootstrap modal instance for details
     */
    private _detailsModal: any = null;
    
    // Constant mappings for icons and colors with correct icon names
    private readonly _ACTION_ICONS: Record<string, string> = {
        "CREATE": "plus",
        "UPDATE": "pen",
        "DELETE": "trash-alt",
        "COMPLETE": "check",
        "CANCEL": "ban",
        "ASSIGN": "user-plus",
        "COMMENT": "comment",
        "TRANSFER": "exchange-alt"
    };
    
    // Simplified color mapping with more fitting colors
    private readonly _ACTION_COLORS: Record<string, string> = {
        "CREATE": "bg-success",
        "UPDATE": "bg-info",
        "DELETE": "bg-primary"
    };
    
    /**
     * Initialize component
     */
    ngOnInit(): void {
        this._initializeModal();
    }
    
    /**
     * Initialize the details modal
     */
    private _initializeModal(): void {
        setTimeout(() => {
            const modalElement = document.getElementById("detailsModal");
            if (modalElement && typeof bootstrap !== "undefined" && bootstrap.Modal) {
                this._detailsModal = new bootstrap.Modal(modalElement);
            }
        }, 100);
    }
    
    /**
     * Returns the appropriate icon name based on the entry's action type
     * @param step The history entry
     * @returns FontAwesome icon name (without fa- prefix)
     */
    getIcon(step: TreatmentActHistoryEntry): string {
        if (!step || !step.actionType) {
            return "circle";
        }
        
        const actionKey = step.actionType.toUpperCase();
        return this._ACTION_ICONS[actionKey] || "circle";
    }
    
    /**
     * Returns the appropriate CSS class for the background color
     * The last entry always gets danger color as it represents the issue that caused the ticket
     * @param step The history entry
     * @returns CSS class for background color
     */
    getActionColor(step: TreatmentActHistoryEntry): string {
        // If this is the last step in the array, it's the one that caused the ticket
        if (this.steps.length > 0 && step === this.steps[this.steps.length - 1]) {
            return "bg-danger";
        }
        
        if (!step.actionType) {
            return "bg-secondary";
        }
        
        const actionKey = step.actionType.toUpperCase();
        return this._ACTION_COLORS[actionKey] || "bg-secondary";
    }
    
    /**
     * Formats the title for a history entry
     * @param step The history entry
     * @returns Formatted title string
     */
    formatTitle(step: TreatmentActHistoryEntry): string {
        return `${step.actionType} on ${step.entityType}`;
    }
    
    /**
     * Formats a user fingerprint from dot notation to readable format
     * @param fingerprint User fingerprint in format "lastname.firstname.role.team"
     * @returns Formatted string as "Lastname Firstname (Role) - Team"
     */
    formatUserFingerprint(fingerprint: string): string {
        if (!fingerprint) {
            return "Unknown User";
        }
        
        const parts = fingerprint.split(".");
        if (parts.length < 4) {
            return fingerprint;
        }
        
        const lastName = this._capitalizeFirst(parts[0]);
        const firstName = this._capitalizeFirst(parts[1]);
        const role = this._capitalizeFirst(parts[2]);
        const team = this._capitalizeFirst(parts[3]);
        
        return `${lastName} ${firstName} (${role}) - ${team}`;
    }
    
    /**
     * Helper method to capitalize the first letter of a string
     * @param str Input string
     * @returns String with first letter capitalized
     */
    private _capitalizeFirst(str: string): string {
        if (!str || str.length === 0) {
            return "";
        }
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * Gets the header class based on step type
     * @param step The case history step
     * @returns CSS class for the header background
     */
    getHeaderClass(step: any): string {
        if (!step || !step.actionType) {
            return "header-default";
        }
        
        const actionType = step.actionType.toLowerCase();
        
        switch (actionType) {
            case "create":
                return "header-create";
            case "update":
                return "header-update";
            case "delete":
                return "header-close";
            case "assign":
                return "header-assignment";
            default:
                return "header-default";
        }
    }

    /**
     * Checks if the step has a status change
     * @param step The case history step
     * @returns True if the step has a status change
     */
    hasStatusChange(step: any): boolean {
        return step?.dataSnapshot && 
               step.dataSnapshot.oldStatus && 
               step.dataSnapshot.newStatus;
    }

    /**
     * Gets the old status from a step
     * @param step The case history step
     * @returns The old status value
     */
    getOldStatus(step: any): string {
        return step?.dataSnapshot?.oldStatus || "";
    }

    /**
     * Gets the new status from a step
     * @param step The case history step
     * @returns The new status value
     */
    getNewStatus(step: any): string {
        return step?.dataSnapshot?.newStatus || "";
    }

    /**
     * Gets the CSS class for the status badge
     * @param step The case history step
     * @returns CSS class for the badge
     */
    getStatusBadgeClass(step: any): string {
        const status = this.getNewStatus(step).toLowerCase();
        
        switch (status) {
            case "open":
                return "bg-primary";
            case "in progress":
                return "bg-info";
            case "pending":
                return "bg-warning";
            case "resolved":
                return "bg-success";
            case "closed":
                return "bg-secondary";
            default:
                return "bg-secondary";
        }
    }

    /**
     * Checks if the step has additional details worth showing in the modal
     * @param step The case history step
     * @returns True if there are additional details
     */
    hasAdditionalDetails(step: any): boolean {
        return this.hasStatusChange(step) || this.hasMetadata(step);
    }

    /**
     * Checks if the step has additional metadata
     * @param step The case history step
     * @returns True if the step has metadata
     */
    hasMetadata(step: any): boolean {
        return step?.dataSnapshot && Object.keys(step.dataSnapshot).some(
            key => !["oldStatus", "newStatus", "commentaire"].includes(key)
        );
    }

    /**
     * Gets the metadata items for display
     * @param step The case history step
     * @returns Array of metadata items with label and value
     */
    getMetadataItems(step: any): Array<{label: string, value: string}> {
        if (!step?.dataSnapshot) return [];
        
        const items: Array<{label: string, value: string}> = [];
        const excludedKeys = ["oldStatus", "newStatus", "commentaire"];
        
        Object.keys(step.dataSnapshot).forEach(key => {
            if (!excludedKeys.includes(key) && step.dataSnapshot[key] !== null && step.dataSnapshot[key] !== undefined) {
                items.push({
                    label: this._formatMetadataLabel(key),
                    value: this._formatMetadataValue(step.dataSnapshot[key])
                });
            }
        });
        
        return items;
    }

    /**
     * Formats a metadata key into a readable label
     * @param key The metadata key
     * @returns Formatted label
     */
    private _formatMetadataLabel(key: string): string {
        // Convert camelCase to Title Case with spaces
        return key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, str => str.toUpperCase());
    }

    /**
     * Formats a metadata value for display
     * @param value The metadata value
     * @returns Formatted value
     */
    private _formatMetadataValue(value: any): string {
        if (value === null || value === undefined) return "";
        if (typeof value === "boolean") return value ? "Yes" : "No";
        if (typeof value === "object" && value instanceof Date) {
            return value.toLocaleDateString();
        }
        return String(value);
    }
    
    /**
     * Shows the details modal for a selected step
     * @param step The step to show details for
     */
    showDetails(step: TreatmentActHistoryEntry): void {
        this.selectedStep = step;
        
        if (this._detailsModal) {
            this._detailsModal.show();
        } else {
            console.error("Details modal not initialized");
        }
    }
}
