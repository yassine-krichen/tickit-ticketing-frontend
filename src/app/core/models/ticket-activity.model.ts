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
}

export interface PaginatedResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            sorted: boolean;
            unsorted: boolean;
            empty: boolean;
        };
        offset: number;
        unpaged: boolean;
        paged: boolean;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    size: number;
    number: number;
    sort: {
        sorted: boolean;
        unsorted: boolean;
        empty: boolean;
    };
    numberOfElements: number;
    first: boolean;
    empty: boolean;
}