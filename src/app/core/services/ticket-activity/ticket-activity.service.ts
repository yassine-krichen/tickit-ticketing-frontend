import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { PaginatedResponse, TicketActivityDto } from "../../models/ticket-activity.model";

@Injectable({
    providedIn: "root"
})
export class TicketActivityService {
    private readonly _BASE_URL = `${environment.apiUrl}/api/v1/tickets`;

    constructor(private _http: HttpClient) {}

    /**
     * Fetches paginated activities for a specific ticket
     */
    getTicketActivities(
        ticketId: string,
        page: number = 0,
        size: number = 10,
        sortField: string = "startTime",
        sortDir: string = "desc",
        q?: string,
        type?: string,
        username?: string
    ): Observable<PaginatedResponse<TicketActivityDto>> {
        let params = new HttpParams()
            .set("page", page.toString())
            .set("size", size.toString())
            .set("sortField", sortField)
            .set("sortDir", sortDir);

        if (q) params = params.set("q", q);
        if (type) params = params.set("type", type);
        if (username) params = params.set("username", username);

        return this._http.get<PaginatedResponse<TicketActivityDto>>(
            `${this._BASE_URL}/${ticketId}/activities`,
            { params }
        );
    }

    /**
     * Creates a new activity for a ticket
     *
     * @param ticketId - ID of the ticket
     * @param activityData - Activity data containing type and description
     * @returns Observable of the created activity
     */
    createActivity(ticketId: string, activityData: { type: string, description: string, username: string }): Observable<TicketActivityDto> {
        return this._http.post<TicketActivityDto>(
            `${this._BASE_URL}/${ticketId}/activities`,
            activityData
        );
    }

    /**
     * Updates an existing activity
     *
     * @param ticketId - ID of the ticket
     * @param activityId - ID of the activity to update
     * @param activityData - Updated activity data (only description is required)
     * @returns Observable of the updated activity
     */
    updateActivity(ticketId: string, activityId: number, activityData: { description: string }): Observable<TicketActivityDto> {
        return this._http.put<TicketActivityDto>(
            `${this._BASE_URL}/${ticketId}/activities/${activityId}`,
            activityData
        );
    }

    /**
     * Completes an activity
     *
     * @param ticketId - ID of the ticket
     * @param activityId - ID of the activity to complete
     * @returns Observable of the completed activity
     */
    completeActivity(ticketId: string, activityId: number): Observable<TicketActivityDto> {
        return this._http.put<TicketActivityDto>(
            `${this._BASE_URL}/${ticketId}/activities/${activityId}/complete`,
            {}
        );
    }

    /**
     * Deletes an activity
     *
     * @param ticketId - ID of the ticket
     * @param activityId - ID of the activity to delete
     * @returns Observable indicating the success/failure of the operation
     */
    deleteActivity(ticketId: string, activityId: number): Observable<any> {
        return this._http.delete<any>(
            `${this._BASE_URL}/${ticketId}/activities/${activityId}`
        );
    }
}
