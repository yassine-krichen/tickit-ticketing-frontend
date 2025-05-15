/**
 * Possible roles for notification targeting
 */
export enum ERole {
    ROLE_USER = 'ROLE_USER',
    ROLE_PRODUCTEUR = 'ROLE_PRODUCTEUR',
    ROLE_PILOTE = 'ROLE_PILOTE', 
    ROLE_DIRECTION = 'ROLE_DIRECTION',
    ROLE_ADMIN = 'ROLE_ADMIN'
}

/**
 * Types of notifications supported by the system
 */
export enum NotificationType {
    TICKET_CREATED = 'TICKET_CREATED',
    TICKET_RESOLVED = 'TICKET_RESOLVED',
    PRIO_LEVELED = 'PRIO_LEVELED',
    ACTIVITY_STALLED = 'ACTIVITY_STALLED',
    CASE_BLOCKED = 'CASE_BLOCKED',
    DUE_DATE_APPROACHING = 'DUE_DATE_APPROACHING',
    SLA_BREACH = 'SLA_BREACH',
    SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
    UPDATE = 'UPDATE'
}

/**
 * Notification data received from backend
 */
export interface NotificationResponse {
    id: number;
    userId: number;
    target: ERole[];
    message: string;
    payload: any;
    readFlag: boolean;
    createdAt: string;
    readAt: string | null;
    type: NotificationType;
}

/**
 * Request to mark notifications as read
 */
export interface MarkNotificationsReadRequest {
    ids: number[];
}

/**
 * Response from marking notifications as read
 */
export interface MarkNotificationsReadResponse {
    count: number;
}