export interface TicketActivityDto {
    id: number;
    ticketId: string;
    username: string;
    type: "OPEN" | "CLOSE" | "UPDATE" | "EMAIL" | "CALL" | "RESEARCH" | "ASSIGNMENT" | "OTHER";
    description: string;
    startTime: string;    // ISO timestamp
    endTime?: string;     // ISO timestamp or null
    duration?: string;    // ISO 8601 Duration
    createdAt: string;    // ISO timestamp
    updatedAt: string;    // ISO timestamp
}

export interface TimelineEvent {
    id: number;
    type: string;
    title: string;
    timeDisplay: string;  // Human-friendly time (e.g., "2 hours ago")
    description: string;
    iconClass: string;    // FontAwesome icon class
    colorClass: string;   // Bootstrap color class
    timestamp: Date;      // JavaScript Date object for sorting/filtering
    metadata?: {          // Optional metadata for special events
        oldStatus?: string;
        newStatus?: string;
        changedFields?: string[];
    };
    username: string;
    duration: string; // Duration in ISO 8601 format (e.g., "PT1H30M")
}

export interface CommentDto {
    id: number;
    activityId: number;
    content: string;
    username: string;
    createdAt: string;    // ISO timestamp
    updatedAt?: string;   // ISO timestamp
    canDelete?: boolean;  // Whether current user can delete this comment
    canEdit?: boolean;    // Whether current user can edit this comment
    isEditing?: boolean;  // UI state for edit mode
}

export interface AttachmentDto {
    id: number;
    activityId: number;
    filename: string;
    contentType: string;
    type: string;        // Mime type (e.g., 'image/jpeg')
    size: number;        // Size in bytes
    url?: string;        // URL to access the file (for images)
    thumbnailUrl?: string; // URL for thumbnail preview
    createdAt: string;   // ISO timestamp
    updatedAt: string;   // ISO timestamp
    createdBy?: string;  // Username of uploader
    canDelete?: boolean; // Whether current user can delete this attachment
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;      // Current page number (0-based)
    first: boolean;      // Whether this is the first page
    last: boolean;       // Whether this is the last page
    empty: boolean;      // Whether the page is empty
}
