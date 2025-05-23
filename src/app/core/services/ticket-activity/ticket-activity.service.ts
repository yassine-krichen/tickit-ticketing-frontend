import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { PaginatedResponse, TicketActivityDto, CommentDto, AttachmentDto } from "../../models/ticket-activity.model";

@Injectable({
    providedIn: "root"
})
export class TicketActivityService {
    private readonly _BASE_URL = `${environment.apiUrl}/api/v1`;

    constructor(private _http: HttpClient) {}

    /**
     * Gets a paginated list of activities for a ticket
     */
    getActivities(
        ticketId: string,
        page: number = 0,
        size: number = 10,
        sort?: string,
        filters?: { q?: string; type?: string; username?: string }
    ): Observable<PaginatedResponse<TicketActivityDto>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (sort) {
            params = params.set('sort', sort);
        }

        if (filters?.q) {
            params = params.set('q', filters.q);
        }

        if (filters?.type) {
            params = params.set('type', filters.type);
        }

        if (filters?.username) {
            params = params.set('username', filters.username);
        }

        return this._http.get<PaginatedResponse<TicketActivityDto>>(
            `${this._BASE_URL}/tickets/${ticketId}/activities`,
            { params }
        );
    }

    /**
     * Gets a single activity by ID
     */
    getActivityById(ticketId: string, activityId: string): Observable<TicketActivityDto> {
        return this._http.get<TicketActivityDto>(
            `${this._BASE_URL}/tickets/${ticketId}/activities/${activityId}`
        );
    }

    /**
     * Creates a new activity for a ticket
     */
    createActivity(ticketId: string, activityData: { type: string, description: string, username: string }): Observable<TicketActivityDto> {
        return this._http.post<TicketActivityDto>(
            `${this._BASE_URL}/tickets/${ticketId}/activities`,
            activityData
        );
    }

    /**
     * Updates an existing activity
     */
    updateActivity(ticketId: string, activityId: string, activityData: { description: string }): Observable<TicketActivityDto> {
        return this._http.put<TicketActivityDto>(
            `${this._BASE_URL}/tickets/${ticketId}/activities/${activityId}`,
            activityData
        );
    }

    /**
     * Completes an activity
     */
    completeActivity(ticketId: string, activityId: string): Observable<TicketActivityDto> {
        return this._http.put<TicketActivityDto>(
            `${this._BASE_URL}/tickets/${ticketId}/activities/${activityId}/complete`,
            {}
        );
    }

    /**
     * Deletes an activity
     */
    deleteActivity(ticketId: string, activityId: string): Observable<void> {
        return this._http.delete<void>(
            `${this._BASE_URL}/tickets/${ticketId}/activities/${activityId}`
        );
    }

    /**
     * Gets comments for an activity
     */
    getActivityComments(ticketId: string, activityId: string): Observable<CommentDto[]> {
        return this._http.get<CommentDto[]>(
            `${this._BASE_URL}/tickets/${ticketId}/activities/${activityId}/comments`
        );
    }

    /**
     * Adds a comment to an activity
     */
    addComment(ticketId: string, activityId: string, comment: { content: string }): Observable<CommentDto> {
        return this._http.post<CommentDto>(
            `${this._BASE_URL}/tickets/${ticketId}/activities/${activityId}/comments`,
            comment
        );
    }

    /**
     * Updates an existing comment
     */
    updateComment(activityId: string, commentId: string, comment: { content: string }): Observable<CommentDto> {
        return this._http.put<CommentDto>(
            `${this._BASE_URL}/tickets/activities/${activityId}/comments/${commentId}`,
            comment
        );
    }

    /**
     * Deletes a comment from an activity
     */
    deleteComment(activityId: string, commentId: string | number, ticketId: string): Observable<void> {
        return this._http.delete<void>(
            `${this._BASE_URL}/tickets/${ticketId}/activities/${activityId}/comments/${commentId}`
        );
    }

    /**
     * Gets attachments for an activity
     */
    getActivityAttachments(ticketId: string, activityId: string): Observable<AttachmentDto[]> {
        return this._http.get<AttachmentDto[]>(
            `${this._BASE_URL}/activities/${activityId}/attachments`
        );
    }

    /**
     * Uploads attachments to an activity
     */
    uploadAttachments(activityId: string, formData: FormData): Observable<AttachmentDto[]> {
        return this._http.post<AttachmentDto[]>(
            `${this._BASE_URL}/activities/${activityId}/attachments`,
            formData,
            {
                headers: new HttpHeaders({
                    'Accept': 'application/json'
                })
            }
        );
    }

    /**
     * Downloads an attachment
     */
    downloadAttachment(ticketId: string, activityId: string, attachmentId: string): Observable<Blob> {
        return this._http.get(
            `${this._BASE_URL}/activities/${activityId}/attachments/${attachmentId}`,
            {
                responseType: 'blob',
                headers: new HttpHeaders({
                    'Accept': 'application/octet-stream'
                })
            }
        );
    }

    /**
     * Deletes an attachment
     */
    deleteAttachment(ticketId: string, activityId: string, attachmentId: string): Observable<void> {
        return this._http.delete<void>(
            `${this._BASE_URL}/activities/${activityId}/attachments/${attachmentId}`
        );
    }
}
