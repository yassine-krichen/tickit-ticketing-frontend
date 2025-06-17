import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil, finalize } from "rxjs/operators";
import { Title } from "@angular/platform-browser";
import { NotificationService } from "src/app/core/services/notification/notification.service";
import { NotificationResponse } from "src/app/core/models/notification.model";

declare var Notify: any;
declare var bootstrap: any; // Declare bootstrap for modal handling

@Component({
    selector: "app-notifications-page",
    templateUrl: "./notifications-page.component.html",
    styleUrls: ["./notifications-page.component.css"]
})
export class NotificationsPageComponent implements OnInit, OnDestroy {
    // Notification data
    notifications: NotificationResponse[] = [];
    totalCount = 0;
    
    // Pagination
    currentPage = 1;
    pageSize = 10;
    
    // Selection
    selectedNotifications: Set<number> = new Set();
    allSelected = false;
    
    // UI states
    loading = false;
    loadingError = false;
    actionLoading = false;
    
    // Filters
    filters = {
        readFlag: null as boolean | null,
        type: null as string | null,
        startDate: null as string | null,
        endDate: null as string | null,
        searchTerm: ""
    };
    
    // Animation states
    newlyArrivedIds: Set<number> = new Set();
    
    // Observable for cleanup
    private _destroy$ = new Subject<void>();
    
    // Bootstrap modal instances
    private _bulkDeleteModal: any = null;
    private _bulkMarkReadModal: any = null;
    
    constructor(
        public notificationService: NotificationService,
        private titleService: Title
    ) { }
    
    ngOnInit(): void {
        this.titleService.setTitle("Notifications | Tickit");
        this.loadNotifications();
        this.subscribeToRealtimeUpdates();
        setTimeout(() => {
            this.initializeModals();
        }); // Delay to ensure DOM is ready
    }

    private initializeModals(): void {
        const bulkDeleteModalElement = document.getElementById("bulkDeleteModal");
        const bulkMarkReadModalElement = document.getElementById("bulkMarkReadModal");
        
        if (bulkDeleteModalElement && typeof bootstrap !== "undefined" && bootstrap.Modal) {
            this._bulkDeleteModal = new bootstrap.Modal(bulkDeleteModalElement);
        }
        
        if (bulkMarkReadModalElement && typeof bootstrap !== "undefined" && bootstrap.Modal) {
            this._bulkMarkReadModal = new bootstrap.Modal(bulkMarkReadModalElement);
        }
    }
    
    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
    
    /**
     * Load notifications with current filters and pagination
     */
    loadNotifications(): void {
        this.loading = true;
        this.loadingError = false;
        
        // Log the current state for debugging
        console.log(`Loading page ${this.currentPage} with pageSize ${this.pageSize}`);
        console.log('Using filters:', this.filters);
        
        this.notificationService.loadNotificationsPage(
            this.currentPage, 
            this.pageSize, 
            this.filters
        )
        .pipe(
            takeUntil(this._destroy$),
            finalize(() => {
                this.loading = false;
            })
        )
        .subscribe({
            next: (result) => {
                this.notifications = result.notifications;
                this.totalCount = result.totalCount;
                this.selectedNotifications.clear();
                this.allSelected = false;
                
                // Log the results for debugging
                console.log(`Loaded ${this.notifications.length} notifications. Total count: ${this.totalCount}`);
            },
            error: (error) => {
                console.error("Failed to load notifications:", error);
                this.loadingError = true;
                this.showNotification("error", "Failed to load notifications. Please try again.");
            }
        });
    }
    
    /**
     * Handle page change from notification list
     */
    onPageChange(page: number): void {
        if (this.currentPage !== page) {
            this.currentPage = page;
            this.loadNotifications();
            // Scroll to top when page changes
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }
    
    /**
     * Apply filters from the filter component
     */
    onFiltersChange(newFilters: any): void {
        this.filters = { ...newFilters };
        this.currentPage = 1; // Reset to first page when filters change
        this.loadNotifications();
    }
    
    /**
     * Toggle selection of a single notification
     */
    toggleSelect(id: number): void {
        if (this.selectedNotifications.has(id)) {
            this.selectedNotifications.delete(id);
        } else {
            this.selectedNotifications.add(id);
        }
        
        // Update "all selected" state
        this.allSelected = this.notifications.length > 0 && 
            this.selectedNotifications.size === this.notifications.length;
    }
    
    /**
     * Toggle selection of all notifications on current page
     */
    toggleSelectAll(): void {
        if (this.allSelected) {
            this.selectedNotifications.clear();
        } else {
            this.notifications.forEach(notification => {
                this.selectedNotifications.add(notification.id);
            });
        }
        this.allSelected = !this.allSelected;
    }
    
    /**
     * Mark selected notifications as read
     */
    markSelectedAsRead(): void {
        if (this.selectedNotifications.size === 0) return;
        
        const ids = Array.from(this.selectedNotifications);
        this.actionLoading = true;
        
        this.notificationService.markAsRead(ids)
            .pipe(
                takeUntil(this._destroy$),
                finalize(() => {
                    this.actionLoading = false;
                })
            )
            .subscribe({
                next: (response) => {
                    this.showNotification("success", `${response.count} notifications marked as read`);
                    this.loadNotifications();
                },
                error: (error) => {
                    console.error("Failed to mark notifications as read:", error);
                    this.showNotification("error", "Failed to mark notifications as read. Please try again.");
                }
            });
    }
    
    /**
     * Mark a single notification as read
     */
    markNotificationAsRead(id: number): void {
        this.actionLoading = true;
        
        this.notificationService.markAsRead([id])
            .pipe(
                takeUntil(this._destroy$),
                finalize(() => {
                    this.actionLoading = false;
                })
            )
            .subscribe({
                next: () => {
                    // Update the UI immediately before reloading
                    this.notifications = this.notifications.map(n => {
                        if (n.id === id) {
                            return { ...n, readFlag: true, readAt: new Date().toISOString() };
                        }
                        return n;
                    });
                    
                    // Remove from selected if it was selected
                    if (this.selectedNotifications.has(id)) {
                        this.selectedNotifications.delete(id);
                    }
                    
                    this.showNotification("success", "Notification marked as read");
                },
                error: (error) => {
                    console.error("Failed to mark notification as read:", error);
                    this.showNotification("error", "Failed to mark notification as read. Please try again.");
                }
            });
    }
    
    /**
     * Mark all notifications on the current page as read
     */
    markAllAsRead(): void {
        if (this.notifications.length === 0 || this.unreadCount === 0) return;
        
        if (this._bulkMarkReadModal) {
            this._bulkMarkReadModal.show();
        } else {
            // Fallback
            this.performMarkAllAsRead();
        }
    }
    
    /**
     * Delete all notifications on the current page
     */
    deleteAll(): void {
        if (this.notifications.length === 0) return;
        
        if (this._bulkDeleteModal) {
            this._bulkDeleteModal.show();
        } else {
            // Fallback to confirm dialog if modal isn't available
            const count = this.notifications.length;
            const message = `Are you sure you want to delete all ${count} notification${count > 1 ? 's' : ''} on this page?`;
            
            if (confirm(message)) {
                this.performBulkDelete();
            }
        }
    }
    
    /**
     * New method to confirm and perform bulk delete
     */
    confirmDeleteAll(): void {
        this.performBulkDelete();
        
        if (this._bulkDeleteModal) {
            this._bulkDeleteModal.hide();
        }
    }
    
    /**
     * Extracted delete logic to avoid duplication
     */
    private performBulkDelete(): void {
        const ids = this.notifications.map(n => n.id);
        this.actionLoading = true;
        
        this.notificationService.deleteNotifications(ids)
            .pipe(
                takeUntil(this._destroy$),
                finalize(() => {
                    this.actionLoading = false;
                })
            )
            .subscribe({
                next: (response) => {
                    this.showNotification("success", `${response.count} notifications deleted`);
                    this.loadNotifications();
                },
                error: (error) => {
                    console.error("Failed to delete notifications:", error);
                    this.showNotification("error", "Failed to delete notifications. Please try again.");
                }
            });
    }
    
    /**
     * New method to confirm and perform mark all as read
     */
    confirmMarkAllAsRead(): void {
        this.performMarkAllAsRead();
        
        if (this._bulkMarkReadModal) {
            this._bulkMarkReadModal.hide();
        }
    }
    
    /**
     * Extracted mark as read logic to avoid duplication
     */
    private performMarkAllAsRead(): void {
        // Get IDs of all unread notifications on the current page
        const unreadIds = this.notifications
            .filter(n => !n.readFlag)
            .map(n => n.id);
        
        if (unreadIds.length === 0) {
            this.showNotification("info", "No unread notifications on this page");
            return;
        }
        
        this.actionLoading = true;
        
        this.notificationService.markAsRead(unreadIds)
            .pipe(
                takeUntil(this._destroy$),
                finalize(() => {
                    this.actionLoading = false;
                })
            )
            .subscribe({
                next: (response) => {
                    this.showNotification("success", `${response.count} notifications marked as read`);
                    this.loadNotifications();
                },
                error: (error) => {
                    console.error("Failed to mark notifications as read:", error);
                    this.showNotification("error", "Failed to mark notifications as read. Please try again.");
                }
            });
    }
    
    /**
     * Delete selected notifications after confirmation
     */
    deleteSelected(): void {
        if (this.selectedNotifications.size === 0) return;
        
        const count = this.selectedNotifications.size;
        const message = `Are you sure you want to delete ${count} notification${count > 1 ? 's' : ''}?`;
        
        if (confirm(message)) {
            const ids = Array.from(this.selectedNotifications);
            this.actionLoading = true;
            
            this.notificationService.deleteNotifications(ids)
                .pipe(
                    takeUntil(this._destroy$),
                    finalize(() => {
                        this.actionLoading = false;
                    })
                )
                .subscribe({
                    next: (response) => {
                        this.showNotification("success", `${response.count} notifications deleted`);
                        this.loadNotifications();
                    },
                    error: (error) => {
                        console.error("Failed to delete notifications:", error);
                        this.showNotification("error", "Failed to delete notifications. Please try again.");
                    }
                });
        }
    }
    
    /**
     * Delete a single notification
     */
    deleteNotification(id: number): void {
        this.actionLoading = true;
        
        this.notificationService.deleteNotifications([id])
            .pipe(
                takeUntil(this._destroy$),
                finalize(() => {
                    this.actionLoading = false;
                })
            )
            .subscribe({
                next: () => {
                    // Update UI immediately
                    this.notifications = this.notifications.filter(n => n.id !== id);
                    
                    // Remove from selected if it was selected
                    if (this.selectedNotifications.has(id)) {
                        this.selectedNotifications.delete(id);
                    }
                    
                    // Update "all selected" state
                    this.allSelected = this.notifications.length > 0 && 
                        this.selectedNotifications.size === this.notifications.length;
                    
                    this.showNotification("success", "Notification deleted");
                },
                error: (error) => {
                    console.error("Failed to delete notification:", error);
                    this.showNotification("error", "Failed to delete notification. Please try again.");
                }
            });
    }
    
    /**
     * Get count of selected unread notifications
     */
    get selectedUnreadCount(): number {
        return this.notifications
            .filter(n => !n.readFlag && this.selectedNotifications.has(n.id))
            .length;
    }
    
    /**
     * Get count of unread notifications on the current page
     */
    get unreadCount(): number {
        return this.notifications.filter(n => !n.readFlag).length;
    }
    
    /**
     * Subscribe to real-time notification updates
     */
    private subscribeToRealtimeUpdates(): void {
        this.notificationService.notifications$
            .pipe(takeUntil(this._destroy$))
            .subscribe(notifications => {
                // If we receive a new notification that's not already in our list
                const currentIds = this.notifications.map(n => n.id);
                const newNotifications = notifications.filter(n => !currentIds.includes(n.id));
                
                if (newNotifications.length > 0) {
                    // Mark for animation
                    newNotifications.forEach(n => this.newlyArrivedIds.add(n.id));
                    
                    // Only reload if we're on the first page
                    if (this.currentPage === 1) {
                        this.loadNotifications();
                        
                        // Clear animation markers after 3 seconds
                        setTimeout(() => {
                            this.newlyArrivedIds.clear();
                        }, 3000);
                    }
                }
            });
    }
    
    /**
     * Display a notification toast
     */
    private showNotification(status: string, message: string): void {
        if (typeof Notify !== "undefined") {
            new Notify({
                status: status,
                title: status === "success" ? "Success" : "Error",
                text: message,
                effect: "slide",
                speed: 300,
                showIcon: true,
                showCloseButton: true,
                autoclose: true,
                autotimeout: 3000,
                gap: 20,
                distance: 20,
                type: "outline",
                position: "right top"
            });
        } else {
            console.log(`${status.toUpperCase()}: ${message}`);
        }
    }
    
    /**
     * Debug method to check pagination status
     */
    debugPagination(): void {
        const debugInfo = `
        Current Page: ${this.currentPage}
        Page Size: ${this.pageSize}
        Total Count: ${this.totalCount}
        Number of Loaded Notifications: ${this.notifications.length}
        Should Show Pagination: ${this.totalCount > this.pageSize}
        `;
        
        alert(debugInfo);
    }
}