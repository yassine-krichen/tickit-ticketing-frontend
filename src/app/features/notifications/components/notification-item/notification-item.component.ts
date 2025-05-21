import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from "@angular/core";
import { NotificationResponse } from "src/app/core/models/notification.model";
import { NotificationService } from "src/app/core/services/notification/notification.service";

/**
 * Component for displaying a single notification item
 */
@Component({
    selector: "app-notification-item",
    templateUrl: "./notification-item.component.html",
    styleUrls: ["./notification-item.component.css"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationItemComponent {
    @Input() notification!: NotificationResponse;
    @Input() isSelected = false;
    @Input() isNewlyArrived = false;

    @Output() toggle = new EventEmitter<Event>();
    @Output() markRead = new EventEmitter<Event>();
    @Output() delete = new EventEmitter<Event>();

    constructor(public notificationService: NotificationService) {}

    /**
     * Checks if the notification has target roles
     * @returns boolean - true if the notification has role-based targeting
     */
    hasTargetRoles(): boolean {
        return Array.isArray(this.notification.target) && this.notification.target.length > 0;
    }

    /**
     * Formats the target roles for display in tooltip
     * @returns string - formatted list of roles
     */
    formatTargetRoles(): string {
        if (!Array.isArray(this.notification.target) || this.notification.target.length === 0) {
            return "";
        }
        
        // Clean up role names by removing the ROLE_ prefix and capitalizing
        return this.notification.target.map(role => {
            const roleName = role.replace("ROLE_", "");
            return roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase();
        }).join(", ");
    }

    /**
     * Emit toggle selection event
     */
    onToggle(event: Event): void {
        this.toggle.emit(event);
    }

    /**
     * Emit mark as read event
     */
    onMarkRead(event: Event): void {
        this.markRead.emit(event);
    }

    /**
     * Emit delete event
     */
    onDelete(event: Event): void {
        this.delete.emit(event);
    }

    /**
     * Navigate to the target of the notification
     */
    navigateToTarget(event: Event): void {
        event.stopPropagation();
        
        // Skip if no targetId or targetType
        if (!this.notification.payload?.targetId || !this.notification.payload?.targetType) {
            return;
        }
        
        // Handle based on target type
        let url: string;
        switch (this.notification.payload.targetType) {
            case "TICKET":
                url = `/ticket-details/${this.notification.payload.targetId}`;
                break;
            case "ACTIVITY":
                // Assuming activities are linked within tickets
                url = `/tickets/${this.notification.payload.targetId}`;
                break;
            default:
                // No known target route
                return;
        }
        
        // Mark as read and navigate
        this.markRead.emit(event);
        
        // Use setTimeout to allow the mark-as-read operation to happen first
        setTimeout(() => {
            // Navigate - we would need to inject Router to actually navigate
            console.log(`Navigating to: ${url}`);
            // this.router.navigate([url]);
        }, 100);
    }
}