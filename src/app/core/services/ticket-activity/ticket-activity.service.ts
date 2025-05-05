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
}
