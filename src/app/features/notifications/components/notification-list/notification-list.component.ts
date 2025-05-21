import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, AfterViewInit } from "@angular/core";
import { NotificationResponse } from "src/app/core/models/notification.model";
import { NotificationService } from "src/app/core/services/notification/notification.service";

declare var bootstrap: any; // Declare bootstrap for modal handling

/**
 * Component responsible for rendering a list of notifications with pagination
 */
@Component({
    selector: "app-notification-list",
    templateUrl: "./notification-list.component.html",
    styleUrls: ["./notification-list.component.css"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationListComponent implements AfterViewInit {
    @Input() notifications: NotificationResponse[] = [];
    @Input() loading = false;
    @Input() loadingError = false;
    @Input() newlyArrivedIds: Set<number> = new Set();
    @Input() totalCount = 0;
    @Input() currentPage = 1;
    @Input() pageSize = 10;

    @Output() pageChange = new EventEmitter<number>();
    @Output() retryLoad = new EventEmitter<void>();
    @Output() markAsRead = new EventEmitter<number>();
    @Output() deleteNotification = new EventEmitter<number>();

    private _deleteModal: any = null;
    private _notificationToDelete: number | null = null;

    constructor(public notificationService: NotificationService) {}

    ngAfterViewInit(): void {
        // Initialize the delete confirmation modal
        const deleteModalElement = document.getElementById("deleteConfirmModal");
        if (deleteModalElement && typeof bootstrap !== "undefined" && bootstrap.Modal) {
            this._deleteModal = new bootstrap.Modal(deleteModalElement);
        }
    }

    /**
     * Check if a notification is newly arrived for animation
     */
    isNewlyArrived(id: number): boolean {
        return this.newlyArrivedIds.has(id);
    }

    /**
     * Handle page change from pagination component
     */
    onPageChange(page: number): void {
        this.pageChange.emit(page);
    }

    /**
     * Request retry when loading fails
     */
    retry(): void {
        this.retryLoad.emit();
    }

    /**
     * Mark a single notification as read
     */
    markNotificationAsRead(id: number, event: Event): void {
        event.stopPropagation();
        this.markAsRead.emit(id);
    }

    /**
     * Delete a single notification
     */
    deleteNotificationItem(id: number, event: Event): void {
        event.stopPropagation();
        this._notificationToDelete = id;
        
        if (this._deleteModal) {
            this._deleteModal.show();
        } else {
            // Fallback if modal isn't available
            if (confirm("Are you sure you want to delete this notification?")) {
                this.deleteNotification.emit(id);
            }
        }
    }

    /**
     * Confirm deletion of a notification
     */
    confirmDelete(): void {
        if (this._notificationToDelete !== null) {
            this.deleteNotification.emit(this._notificationToDelete);
            this._notificationToDelete = null;
            
            if (this._deleteModal) {
                this._deleteModal.hide();
            }
        }
    }

    /**
     * Calculate the total number of pages
     */
    getPageCount(): number {
        return Math.ceil(this.totalCount / this.pageSize);
    }

    /**
     * Generate an array of page numbers to display
     * Includes current page, some pages before and after, and possibly ellipses
     */
    getPageRange(): number[] {
        const pageCount = this.getPageCount();
        const visiblePages = 5; // Same as maxSize in the ngb-pagination
        const pages: number[] = [];
        
        // If we have few pages, show all of them
        if (pageCount <= visiblePages) {
            for (let i = 1; i <= pageCount; i++) {
                pages.push(i);
            }
            return pages;
        }
        
        // Always include first page
        pages.push(1);
        
        // Current page and surroundings
        const leftBound = Math.max(2, this.currentPage - 1);
        const rightBound = Math.min(pageCount - 1, this.currentPage + 1);
        
        // Add ellipsis if there's a gap after first page
        if (leftBound > 2) {
            pages.push(-1); // -1 represents ellipsis
        }
        
        // Add visible pages
        for (let i = leftBound; i <= rightBound; i++) {
            pages.push(i);
        }
        
        // Add ellipsis if there's a gap before last page
        if (rightBound < pageCount - 1) {
            pages.push(-1); // -1 represents ellipsis
        }
        
        // Always include last page
        if (pageCount > 1) {
            pages.push(pageCount);
        }
        
        return pages;
    }
}