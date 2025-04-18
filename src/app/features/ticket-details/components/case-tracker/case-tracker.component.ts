import { Component, Input } from "@angular/core";
import { TreatmentActHistoryEntry } from "src/app/core/models/treatment-act.model";
// import { string } from "@fortawesome/fontawesome-svg-core";

/**
 * Component for displaying the timeline of treatment act history
 * Shows chronological progression of actions with appropriate styling
 */
@Component({
    selector: "app-case-tracker",
    templateUrl: "./case-tracker.component.html",
    styleUrls: ["./case-tracker.component.css"]
})
export class CaseTrackerComponent {
    @Input() steps: TreatmentActHistoryEntry[] = [];
    
    // Constant mappings for icons and colors
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
    
    private readonly _ACTION_COLORS: Record<string, string> = {
        "CREATE": "bg-success",
        "UPDATE": "bg-primary",
        "DELETE": "bg-orange",
        "COMPLETE": "bg-info",
        "CANCEL": "bg-warning",
        "ASSIGN": "bg-purple",
        "COMMENT": "bg-secondary",
        "TRANSFER": "bg-info"
    };
    
    /**
     * Returns the appropriate icon name based on the entry's action type
     * @param step The history entry
     * @returns FontAwesome icon name
     */
    getIcon(step: TreatmentActHistoryEntry): string {
        if (!step || !step.actionType) {
            return "fa-circle" as string;
        }
        
        const actionKey = step.actionType.toUpperCase();
        return this._ACTION_ICONS[actionKey] || "fa-circle" as string;
    }
    
    /**
     * Returns the appropriate CSS class for the icon based on action type and latest status
     * @param step The history entry
     * @returns CSS class string for styling the icon
     */
    getIconClass(step: TreatmentActHistoryEntry): string {
        if (step.isLatest) {
            return "bg-danger text-white rounded-circle p-1";
        }
        
        if (!step.actionType) {
            return "bg-secondary text-white rounded-circle p-1";
        }
        
        const actionKey = step.actionType.toUpperCase();
        const bgClass = this._ACTION_COLORS[actionKey] || "bg-secondary";
        return `${bgClass} text-white rounded-circle p-1`;
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
        
        const lastName = this.capitalizeFirst(parts[0]);
        const firstName = this.capitalizeFirst(parts[1]);
        const role = this.capitalizeFirst(parts[2]);
        const team = this.capitalizeFirst(parts[3]);
        
        return `${lastName} ${firstName} (${role}) - ${team}`;
    }
    
    /**
     * Helper method to capitalize the first letter of a string
     * @param str Input string
     * @returns String with first letter capitalized
     */
    private capitalizeFirst(str: string): string {
        if (!str || str.length === 0) {
            return "";
        }
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
}
