import { Component, AfterViewInit, OnInit, ElementRef, Renderer2, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { UserService, UserResponseDTO } from "src/app/core/services/user/user.service";
import { AuthService } from "src/app/core/services/auth/auth.service";
import { NotificationService } from "src/app/core/services/notification/notification.service";
import { NotificationResponse } from "src/app/core/models/notification.model";

/**
 * Navbar component for the dashboard displaying user info and notification controls
 */
@Component({
    selector: "app-dashboard-navbar",
    templateUrl: "./dashboard-navbar.component.html",
    styleUrls: ["./dashboard-navbar.component.css"]
})
export class DashboardNavbarComponent implements OnInit, AfterViewInit, OnDestroy {
    /**
     * Current user data
     */
    currentUser: UserResponseDTO = {};
    
    /**
     * Loading state for user data
     */
    loading = true;
    
    /**
     * Error message if user data fetch fails
     */
    errorMessage = "";

    /**
     * Track dropdown states
     */
    notificationsOpen = false;
    userMenuOpen = false;
    
    /**
     * Notification data
     */
    notifications: NotificationResponse[] = [];
    unreadCount = 0;
    isSocketConnected = false;
    
    /**
     * Subject for managing subscriptions
     */
    private _destroy$ = new Subject<void>();

    /**
     * Constructor for the DashboardNavbarComponent
     */
    constructor(
        private userService: UserService,
        private renderer: Renderer2,
        private elementRef: ElementRef,
        private notificationService: NotificationService,
        private authService: AuthService,
        private router: Router
    ) { }

    /**
     * Lifecycle hook that is called after data-bound properties are initialized
     */
    ngOnInit(): void {
        this._loadUserData();
        this._setupClickOutsideListener();
        this._subscribeToNotifications();
        
        // Initialize notification service if not already
        if (this.authService.isAuthenticated()) {
            this.notificationService.initialize();
        }
    }

    /**
     * After view is initialized
     */
    ngAfterViewInit(): void {
        // No longer needed as we're using CSS dropdowns
    }
    
    /**
     * Clean up subscriptions when component is destroyed
     */
    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    /**
     * Format user name from fingerprint if available
     * @returns Formatted user name or default text
     */
    getUserName(): string {
        if (!this.currentUser) {
            return "User";
        }
        
        const fingerprint = this.currentUser.fingerprint || this.currentUser.userFingerPrint;
        
        if (fingerprint) {
            const parts = fingerprint.split(".");
            if (parts.length >= 2) {
                // Format as "Firstname Lastname"
                return `${this._capitalizeFirst(parts[1])} ${this._capitalizeFirst(parts[0])}`;
            }
        }
        
        // Fallback to email if no fingerprint
        return this.currentUser.email ? this.currentUser.email.split("@")[0] : "User";
    }

    getUserRole(): string {
        if (!this.currentUser) {
            return "User";
        }

        const fingerprint = this.currentUser.fingerprint || this.currentUser.userFingerPrint;
        if (fingerprint) {  
            const parts = fingerprint.split(".");
            if (parts.length >= 3) {
                // Format as "Firstname Lastname"
                return this._capitalizeFirst(parts[2]);
            }
        }
        
        return "User";
    }

    /**
     * Toggle notifications dropdown
     */
    toggleNotifications(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.notificationsOpen = !this.notificationsOpen;
        this.userMenuOpen = false; // Close other dropdown
        if (this.notificationsOpen) {
            // Refresh notifications when opening dropdown
            this.notificationService.loadNotifications().subscribe();
        }
    }

    /**
     * Toggle user menu dropdown
     */
    toggleUserMenu(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.userMenuOpen = !this.userMenuOpen;
        this.notificationsOpen = false; // Close other dropdown
    }

    /**
     * Close all dropdowns
     */
    closeDropdowns(): void {
        this.notificationsOpen = false;
        this.userMenuOpen = false;
    }
    
    /**
     * Mark a single notification as read
     * @param notification - The notification to mark as read
     * @param event - The event object to prevent propagation
     */
    markAsRead(notification: NotificationResponse, event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        
        if (notification.readFlag) {
            return; // Already read
        }
        
        this.notificationService.markAsRead([notification.id]).subscribe(() => {
            console.log(`Notification ${notification.id} marked as read`);
        });
    }
    
    /**
     * Mark all notifications as read
     * @param event - The event object to prevent propagation
     */
    markAllAsRead(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        
        this.notificationService.markAllAsRead().subscribe(response => {
            console.log(`${response.count} notifications marked as read`);
        });
    }
    
    /**
     * Navigate to notification destination and mark as read
     * @param notification - The notification to navigate to
     * @param event - The event object to prevent propagation
     */
    navigateToNotification(notification: NotificationResponse, event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        
        // Mark as read first
        if (!notification.readFlag) {
            this.notificationService.markAsRead([notification.id]).subscribe();
        }
        
        // Extract route information from payload if available
        if (notification.payload && notification.payload.route) {
            this.router.navigateByUrl(notification.payload.route);
            this.closeDropdowns();
            return;
        }
        
        // Default routing based on notification type
        switch (notification.type) {
            case "TICKET_CREATED":
            case "TICKET_RESOLVED":
            case "PRIO_LEVELED":
            case "CASE_BLOCKED":
                if (notification.payload && notification.payload.ticketId) {
                    this.router.navigate(['/ticket-details', notification.payload.ticketId]);
                } else {
                    this.router.navigate(['/dashboard/tickets']);
                }
                break;
            case "ACTIVITY_STALLED":
                if (notification.payload && notification.payload.activityId) {
                    // Navigate to activity if you have a specific route
                    this.router.navigate(['/ticket-details', notification.payload.ticketId]);
                } else {
                    this.router.navigate(['/dashboard/tickets']);
                }
                break;
            case "DUE_DATE_APPROACHING":
            case "SLA_BREACH":
                if (notification.payload && notification.payload.ticketId) {
                    this.router.navigate(['/ticket-details', notification.payload.ticketId]);
                } else {
                    this.router.navigate(['/dashboard/tickets']);
                }
                break;
            case "SYSTEM_ANNOUNCEMENT":
                // Maybe navigate to announcements page if you have one
                this.router.navigate(['/dashboard']);
                break;
            case "UPDATE":
                if (notification.payload && notification.payload.ticketId) {
                    this.router.navigate(['/ticket-details', notification.payload.ticketId]);
                } else {
                    this.router.navigate(['/dashboard/tickets']);
                }
                break;
            default:
                this.router.navigate(['/dashboard']);
                break;
        }
        
        this.closeDropdowns();
    }
    
    /**
     * View all notifications
     * @param event - The event object to prevent propagation
     */
    viewAllNotifications(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.router.navigate(['/notifications']);
        this.closeDropdowns();
    }
    
    /**
     * Get color class for notification type
     * @param type - The notification type
     */
    getNotificationColorClass(type: string): string {
        return this.notificationService.getNotificationTypeColorClass(type);
    }
    
    /**
     * Get icon class for notification type
     * @param type - The notification type
     */
    getNotificationIcon(type: string): string {
        return this.notificationService.getNotificationTypeIcon(type);
    }
    
    /**
     * Format relative time for notification
     * @param dateStr - ISO date string
     */
    formatRelativeTime(dateStr: string): string {
        return this.notificationService.formatRelativeTime(dateStr);
    }
    
    /**
     * Log out the current user
     */
    logout(): void {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }

    /**
     * Set up click outside listener to close dropdowns
     * @private
     */
    private _setupClickOutsideListener(): void {
        this.renderer.listen("document", "click", (event: Event) => {
            const clickedInside = this.elementRef.nativeElement.contains(event.target);
            if (!clickedInside) {
                this.closeDropdowns();
            }
        });
    }
    
    /**
     * Subscribe to notification updates
     * @private
     */
    private _subscribeToNotifications(): void {
        this.notificationService.notifications$
            .pipe(takeUntil(this._destroy$))
            .subscribe(notifications => {
                this.notifications = notifications;
            });
            
        this.notificationService.unreadCount$
            .pipe(takeUntil(this._destroy$))
            .subscribe(count => {
                this.unreadCount = count;
            });
            
        this.notificationService.connectionStatus$
            .pipe(takeUntil(this._destroy$))
            .subscribe(connected => {
                this.isSocketConnected = connected;
            });
    }
    
    /**
     * Load current user data from API
     * @private
     */
    private _loadUserData(): void {
        this.loading = true;
        this.userService.getCurrentUser().subscribe({
            next: (user) => {
                this.currentUser = user;
                this.loading = false;
            },
            error: (err) => {
                console.error("Error loading user data:", err);
                this.errorMessage = "Failed to load user profile";
                this.loading = false;
            }
        });
    }
    
    /**
     * Helper method to capitalize the first letter of a string
     * @param str Input string
     * @returns String with first letter capitalized
     * @private
     */
    private _capitalizeFirst(str: string): string {
        if (!str || str.length === 0) {
            return "";
        }
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
}
