import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { TreatmentAct, TreatmentActHistoryEntry, RawHistoryEntry } from "../../models/treatment-act.model";

@Injectable({
    providedIn: "root"
})
export class TreatmentActService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    /**
     * Fetches a treatment act by its ID
     * @param id The treatment act ID
     */
    getTreatmentAct(id: string): Observable<TreatmentAct> {
        // Updated to v1 API path and match ActeTraitementController
        return this.http.get<TreatmentAct>(`${this.apiUrl}/api/v1/treatments/${id}/populated`);
    }

    /**
     * Fetches the history of treatment acts for a case
     * @param caseId The case ID
     */
    getTreatmentActHistory(caseId: string): Observable<TreatmentActHistoryEntry[]> {
        // Updated to match LedgerController
        return this.http.get<RawHistoryEntry[]>(`${this.apiUrl}/api/v1/ledger-entries/treatment-acts?caseId=${caseId}`)
            .pipe(
                map(entries => {
                    // Convert string timestamps to Date objects and sort by date (oldest first)
                    const mappedEntries = entries
                        .map(entry => ({
                            ...entry,
                            timestamp: new Date(entry.timestamp)
                        }) as TreatmentActHistoryEntry)
                        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

                    // Mark the most recent entry as the latest
                    if (mappedEntries.length > 0) {
                        mappedEntries[mappedEntries.length - 1].isLatest = true;
                    }

                    return mappedEntries;
                })
            );
    }
}
