import { Injectable, OnDestroy } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, BehaviorSubject, Subject, of, throwError } from "rxjs";
import { catchError, map, takeUntil, tap } from "rxjs/operators";
import { Client, IMessage } from "@stomp/stompjs";
import * as SockJS from "sockjs-client";
import { environment } from "../../../../environments/environment";
import { AuthService } from "../auth/auth.service";
import { 
    NotificationResponse, 
    MarkNotificationsReadRequest, 
    MarkNotificationsReadResponse 
} from "../../models/notification.model";
import { NotificationEventService } from "./notification-event.service";

// Add at the top of the file, after imports
declare var Notify: any;


/**
 * Service for managing real-time notifications via WebSocket
 */
@Injectable({
    providedIn: "root"
})
export class NotificationService implements OnDestroy {
    private readonly _baseUrl = environment.apiUrl + "/api/v1/notifications";
    private readonly _wsUrl = environment.apiUrl + "/ws";
    private _stompClient: Client | null = null;
    private _connected = false;
    private _destroy$ = new Subject<void>();
    
    // Observable sources
    private _notifications = new BehaviorSubject<NotificationResponse[]>([]);
    private _unreadCount = new BehaviorSubject<number>(0);
    private _connectionStatus = new BehaviorSubject<boolean>(false);
    
    // Observable streams
    readonly notifications$ = this._notifications.asObservable();
    readonly unreadCount$ = this._unreadCount.asObservable();
    readonly connectionStatus$ = this._connectionStatus.asObservable();
    
    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private notificationEventService: NotificationEventService
    ) {
        // Subscribe to notification events
        this.notificationEventService.initializeNotifications$
            .pipe(takeUntil(this._destroy$))
            .subscribe(() => {
                this.initialize();
            });
            
        this.notificationEventService.disconnectNotifications$
            .pipe(takeUntil(this._destroy$))
            .subscribe(() => {
                this.disconnect();
            });
    }
    
    /**
     * Initialize notification service and connect to WebSocket if authenticated
     */
    initialize(): void {
        if (this.authService.isAuthenticated()) {
            this.connect();
            this.loadNotifications();
        }
    }
    
    /**
     * Connect to WebSocket server and subscribe to notification channels
     */
    connect(): void {
        if (this._connected) {
            return;
        }
        
        // Create a new STOMP client over SockJS
        const socket = new SockJS(this._wsUrl);
        this._stompClient = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${this.authService.getToken()}`
            },
            debug: function(str) {
                console.log("STOMP: " + str);
            },
            reconnectDelay: 5000
        });
        
        // Set connection handlers
        this._stompClient.onConnect = (frame) => {
            this._connected = true;
            this._connectionStatus.next(true);
            console.log("Connected to WebSocket server: " + frame);
            
            // Subscribe to notifications
            this._stompClient?.subscribe("/user/queue/notifications", (message) => {
                this.handleNotificationMessage(message);
            });
            
            // Subscribe to unread count updates
            this._stompClient?.subscribe("/user/queue/notifications/count", (message) => {
                this.handleUnreadCountMessage(message);
            });
        };
        
        this._stompClient.onStompError = (frame) => {
            console.error("STOMP error", frame);
            this._connectionStatus.next(false);
        };
        
        this._stompClient.onDisconnect = () => {
            this._connected = false;
            this._connectionStatus.next(false);
            console.log("Disconnected from WebSocket server");
        };
        
        // Start connection
        this._stompClient.activate();
    }
    
    /**
     * Disconnect from WebSocket server
     */
    disconnect(): void {
        if (this._stompClient) {
            this._stompClient.deactivate();
            this._stompClient = null;
            this._connected = false;
            this._connectionStatus.next(false);
        }
    }
    
    /**
     * Load all notifications for the current user
     */
    loadNotifications(): Observable<NotificationResponse[]> {
        return this.http.get<NotificationResponse[]>(`${this._baseUrl}`).pipe(
            map(notifications => {
                this._notifications.next(notifications);
                const unreadCount = notifications.filter(n => !n.readFlag).length;
                this._unreadCount.next(unreadCount);
                return notifications;
            }),
            catchError(error => {
                console.error("Error loading notifications:", error);
                return of([]);
            })
        );
    }
    
    /**
     * Load notifications with pagination and filtering
     * @param page - Page number (1-based)
     * @param pageSize - Number of items per page
     * @param filters - Optional filters (readFlag, type, dates, searchTerm)
     */
    loadNotificationsPage(
        page = 1, 
        pageSize = 10, 
        filters?: { 
            readFlag?: boolean, 
            type?: string, 
            startDate?: string, 
            endDate?: string, 
            searchTerm?: string 
        }
    ): Observable<{ notifications: NotificationResponse[], totalCount: number }> {
        let params = new HttpParams()
            .set("page", page.toString())
            .set("size", pageSize.toString());
        
        if (filters) {
            if (filters.readFlag !== undefined && filters.readFlag !== null) {
                params = params.set("readFlag", filters.readFlag.toString());
            }
            if (filters.type) {
                params = params.set("type", filters.type);
            }
            if (filters.startDate) {
                params = params.set("startDate", filters.startDate);
            }
            if (filters.endDate) {
                params = params.set("endDate", filters.endDate);
            }
            if (filters.searchTerm) {
                params = params.set("search", filters.searchTerm);
            }
        }
        
        console.log('API request parameters:', params.toString());
        
        return this.http.get<{ content: NotificationResponse[], totalElements: number }>(
            `${this._baseUrl}/paged`, { params }
        ).pipe(
            map(response => {
                console.log('API response:', response);
                return {
                    notifications: response.content,
                    totalCount: response.totalElements
                };
            }),
            catchError(error => {
                console.error("Error loading notifications page:", error);
                return of({ notifications: [], totalCount: 0 });
            })
        );
    }
    
    /**
     * Mark specific notifications as read
     * @param ids - Array of notification IDs to mark as read
     */
    markAsRead(ids: number[]): Observable<MarkNotificationsReadResponse> {
        const request: MarkNotificationsReadRequest = { ids };
        return this.http.post<MarkNotificationsReadResponse>(`${this._baseUrl}/read`, request).pipe(
            map(response => {
                // Update local state
                const currentNotifications = this._notifications.value;
                const updatedNotifications = currentNotifications.map(notification => {
                    if (ids.includes(notification.id)) {
                        return {
                            ...notification,
                            readFlag: true,
                            readAt: new Date().toISOString()
                        };
                    }
                    return notification;
                });
                
                this._notifications.next(updatedNotifications);
                const unreadCount = updatedNotifications.filter(n => !n.readFlag).length;
                this._unreadCount.next(unreadCount);
                
                return response;
            }),
            catchError(error => {
                console.error("Error marking notifications as read:", error);
                return of({ count: 0 });
            })
        );
    }
    
    /**
     * Mark all notifications as read
     */
    markAllAsRead(): Observable<MarkNotificationsReadResponse> {
        const unreadIds = this._notifications.value
            .filter(n => !n.readFlag)
            .map(n => n.id);
            
        if (unreadIds.length === 0) {
            return of({ count: 0 });
        }
        
        return this.markAsRead(unreadIds);
    }
    
    /**
     * Delete specific notifications by IDs
     * @param ids - Array of notification IDs to delete
     */
    deleteNotifications(ids: number[]): Observable<{ count: number }> {
        return this.http.post<{ count: number }>(`${this._baseUrl}/delete`, { ids }).pipe(
            tap(() => {
                // Remove deleted notifications from the current list
                const currentNotifications = this._notifications.value;
                const updatedNotifications = currentNotifications.filter(n => !ids.includes(n.id));
                this._notifications.next(updatedNotifications);
                
                // Update unread count if needed
                const removedUnreadCount = currentNotifications
                    .filter(n => ids.includes(n.id) && !n.readFlag)
                    .length;
                    
                if (removedUnreadCount > 0) {
                    const currentUnreadCount = this._unreadCount.value;
                    this._unreadCount.next(Math.max(0, currentUnreadCount - removedUnreadCount));
                }
            }),
            catchError(error => {
                console.error("Error deleting notifications:", error);
                return throwError(() => new Error("Failed to delete notifications"));
            })
        );
    }
    
    /**
     * Handle incoming notification message
     * @param message - STOMP message
     */
    private handleNotificationMessage(message: IMessage): void {
        try {
            const notification: NotificationResponse = JSON.parse(message.body);
            const currentNotifications = this._notifications.value;
            
            // Check if notification already exists in our array
            const notificationExists = currentNotifications.some(n => n.id === notification.id);
            
            if (!notificationExists) {
                // Add new notification to the beginning of the array
                this._notifications.next([notification, ...currentNotifications]);
                
                // Update unread count if the notification is unread
                if (!notification.readFlag) {
                    this._unreadCount.next(this._unreadCount.value + 1);
                }
                
                // Show notification toast (for real-time notifications)
                this.showNotificationToast(notification);
            }
        } catch (error) {
            console.error("Error parsing notification message:", error);
        }
    }
    
    /**
     * Handle incoming unread count message
     * @param message - STOMP message
     */
    private handleUnreadCountMessage(message: IMessage): void {
        try {
            const count = parseInt(message.body, 10);
            if (!isNaN(count)) {
                this._unreadCount.next(count);
            }
        } catch (error) {
            console.error("Error parsing unread count message:", error);
        }
    }
    
    /**
     * Display a toast notification for real-time notifications
     * @param notification - The notification to display
     */
    private showNotificationToast(notification: NotificationResponse): void {
        if (typeof Notify !== 'undefined') {
            new Notify({
                status: this.getNotificationToastStatus(notification.type),
                title: this.getNotificationTypeLabel(notification.type),
                text: notification.message,
                effect: 'slide',
                speed: 300,
                showIcon: true,
                showCloseButton: true,
                autoclose: true,
                autotimeout: 5000,
                gap: 20,
                distance: 20,
                type: 'outline',
                position: 'right top'
            });
        } else {
            console.log('Notification received:', notification.message);
        }
    }

    /**
 * Get the appropriate notification status for toast display
 * @param type - Notification type
 */
private getNotificationToastStatus(type: string): string {
    switch (type) {
        case "TICKET_RESOLVED":
            return "success";
        case "SLA_BREACH":
        case "CASE_BLOCKED":
            return "error";
        case "PRIO_LEVELED":
        case "DUE_DATE_APPROACHING":
            return "warning";
        default:
            return "info";
    }
}
    
    /**
     * Get readable label for notification type
     * @param type - Notification type enum value
     */
    getNotificationTypeLabel(type: string): string {
        switch (type) {
            case "TICKET_CREATED": return "New Ticket";
            case "TICKET_RESOLVED": return "Ticket Resolved";
            case "PRIO_LEVELED": return "Priority Changed";
            case "ACTIVITY_STALLED": return "Activity Stalled";
            case "CASE_BLOCKED": return "Case Blocked";
            case "DUE_DATE_APPROACHING": return "Due Date Approaching";
            case "SLA_BREACH": return "SLA Breach";
            case "SYSTEM_ANNOUNCEMENT": return "System Announcement";
            case "UPDATE": return "Update";
            default: return "Notification";
        }
    }
    
    /**
     * Get icon class for notification type
     * @param type - Notification type enum value
     */
    getNotificationTypeIcon(type: string): string {
        switch (type) {
            case "TICKET_CREATED": return "fas fa-ticket-alt";
            case "TICKET_RESOLVED": return "fas fa-check-circle";
            case "PRIO_LEVELED": return "fas fa-arrow-up";
            case "ACTIVITY_STALLED": return "fas fa-hourglass-end";
            case "CASE_BLOCKED": return "fas fa-ban";
            case "DUE_DATE_APPROACHING": return "fas fa-calendar-alt";
            case "SLA_BREACH": return "fas fa-exclamation-triangle";
            case "SYSTEM_ANNOUNCEMENT": return "fas fa-bullhorn";
            case "UPDATE": return "fas fa-sync";
            default: return "fas fa-bell";
        }
    }
    
    /**
     * Get background color class for notification type
     * @param type - Notification type enum value
     */
    getNotificationTypeColorClass(type: string): string {
        switch (type) {
            case "TICKET_CREATED": return "bg-primary-subtle";
            case "TICKET_RESOLVED": return "bg-success-subtle";
            case "PRIO_LEVELED": return "bg-warning-subtle";
            case "ACTIVITY_STALLED": return "bg-warning-subtle";
            case "CASE_BLOCKED": return "bg-danger-subtle";
            case "DUE_DATE_APPROACHING": return "bg-info-subtle";
            case "SLA_BREACH": return "bg-danger-subtle";
            case "SYSTEM_ANNOUNCEMENT": return "bg-info-subtle";
            case "UPDATE": return "bg-primary-subtle";
            default: return "bg-light";
        }
    }
    
    /**
     * Format relative time (e.g., "2 hours ago")
     * @param dateStr - ISO date string
     */
    formatRelativeTime(dateStr: string): string {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.round(diffMs / 1000);
        const diffMin = Math.round(diffSec / 60);
        const diffHour = Math.round(diffMin / 60);
        const diffDay = Math.round(diffHour / 24);
        
        if (diffSec < 60) {
            return "just now";
        } else if (diffMin < 60) {
            return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
        } else if (diffHour < 24) {
            return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
        } else if (diffDay < 30) {
            return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
    
    /**
     * Clean up resources when service is destroyed
     */
    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
        this.disconnect();
    }
}