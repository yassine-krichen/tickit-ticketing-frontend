import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  Ticket,
  BackendTicket,
  TicketRequest,
  TicketResponse,
  TicketUpdateDTO,
  TicketCount,
  Status,
  Priority,
  CaseType,
  TypeStepValidation,
  PaginatedResponse
} from '../../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  // Update baseUrl to use environment and match the controller endpoint
  private readonly baseUrl = `${environment.apiUrl}/api/v1/tickets`;

  constructor(private http: HttpClient) { }

  // Get paginated tickets
  getPaginatedTickets(
    page: number = 0,
    size: number = 10,
    sortField: string = "timestamp",
    sortDir: string = "desc",
    q?: string,
    status?: Status,
    priority?: Priority
  ): Observable<PaginatedResponse<TicketResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortField', sortField)
      .set('sortDir', sortDir);

    if (q) params = params.set('q', q);
    if (status) params = params.set('status', status);
    if (priority) params = params.set('priority', priority);

    return this.http.get<PaginatedResponse<TicketResponse>>(this.baseUrl, { params })
      .pipe(
        catchError(error => {
          console.error('Error fetching paginated tickets:', error);
          throw error;
        })
      );
  }

  // Get all ticket statistics in a single call
  getAllTicketStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/stats/all`);
  }

  // Create a new ticket
  createTicket(ticketRequest: TicketRequest): Observable<TicketResponse> {
    return this.http.post<TicketResponse>(this.baseUrl, ticketRequest);
  }

  // Get a single ticket by ID
  getTicketById(ticketId: string): Observable<TicketResponse> {
    return this.http.get<TicketResponse>(`${this.baseUrl}/${ticketId}`);
  }

  // Get all tickets with optional filters - now points to /all endpoint
  getAllTickets(
    status?: Status,
    priority?: Priority,
    issuedBy?: string,
    acteTraitement?: string
  ): Observable<TicketResponse[]> {
    let params = new HttpParams();

    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    if (issuedBy) params.append('issuedBy', issuedBy);
    if (acteTraitement) params.append('acteTraitement', acteTraitement);
    if (status) params = params.set('status', status);
    if (priority) params = params.set('priority', priority);
    if (issuedBy) params = params.set('issuedBy', issuedBy);
    if (acteTraitement) params = params.set('acteTraitement', acteTraitement);

    return this.http.get<TicketResponse[]>(`${this.baseUrl}/all`, { params })
      .pipe(
        catchError(error => {
          console.error('Error fetching tickets:', error);
          return [];
        })
      );
  }

  // Enhanced search with new fields - points to /search endpoint
  searchTickets(
    status?: Status,
    priority?: Priority,
    issuedBy?: string,
    acteTraitement?: string,
    type?: CaseType,
    step?: CaseType,
    subStatus?: string
  ): Observable<TicketResponse[]> {
    let params = new HttpParams();

    if (status) params = params.set('status', status);
    if (priority) params = params.set('priority', priority);
    if (issuedBy) params = params.set('issuedBy', issuedBy);
    if (acteTraitement) params = params.set('acteTraitement', acteTraitement);
    if (type) params = params.set('type', type);
    if (step) params = params.set('step', step);
    if (subStatus) params = params.set('subStatus', subStatus);

    return this.http.get<TicketResponse[]>(`${this.baseUrl}/search`, { params })
      .pipe(
        catchError(error => {
          console.error('Error searching tickets:', error);
          return [];
        })
      );
  }

  // Get ticket counts by status
  getTicketCountsByStatus(): Observable<TicketCount[]> {
    return this.http.get<TicketCount[]>(`${this.baseUrl}/counts-by-status`)
      .pipe(
        catchError(error => {
          console.error('Error fetching ticket counts by status:', error);
          return [];
        })
      );
  }

  // Get ticket counts by type
  getTicketCountsByType(): Observable<TicketCount[]> {
    return this.http.get<TicketCount[]>(`${this.baseUrl}/counts-by-type`)
      .pipe(
        catchError(error => {
          console.error('Error fetching ticket counts by type:', error);
          return [];
        })
      );
  }

  // Get ticket counts by step
  getTicketCountsByStep(): Observable<TicketCount[]> {
    return this.http.get<TicketCount[]>(`${this.baseUrl}/counts-by-step`)
      .pipe(
        catchError(error => {
          console.error('Error fetching ticket counts by step:', error);
          return [];
        })
      );
  }

  // Get ticket counts by sub-status
  getTicketCountsBySubStatus(): Observable<TicketCount[]> {
    return this.http.get<TicketCount[]>(`${this.baseUrl}/counts-by-sub-status`)
      .pipe(
        catchError(error => {
          console.error('Error fetching ticket counts by sub-status:', error);
          return [];
        })
      );
  }

  // Get ticket statistics by period
  getTicketStatsByPeriod(period: string): Observable<Map<string, number>> {
    return this.http.get<Map<string, number>>(`${this.baseUrl}/stats/${period}`);
  }

  // Validate type-step combination
  validateTypeStepCombination(type: CaseType, step: CaseType): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/validate-type-step?type=${type}&step=${step}`);
  }

  // Get valid steps for a type
  getValidStepsForType(type: CaseType): Observable<CaseType[]> {
    return this.http.get<CaseType[]>(`${this.baseUrl}/valid-steps/${type}`);
  }

  // Update ticket status
  updateTicketStatus(ticketId: string, status: Status): Observable<TicketResponse> {
    return this.http.put<TicketResponse>(
      `${this.baseUrl}/${ticketId}/status`,
      null,
      { params: { status } }
    );
  }

  // Update ticket details
  updateTicket(ticketId: string, updateData: TicketUpdateDTO): Observable<TicketResponse> {
    return this.http.put<TicketResponse>(`${this.baseUrl}/${ticketId}`, updateData);
  }

  // Delete a ticket - Updated to handle plain text responses
  deleteTicket(ticketId: string): Observable<any> {
    const headers = new HttpHeaders().set('Accept', 'text/plain');
    return this.http.delete(`${this.baseUrl}/${ticketId}`, {
      headers,
      responseType: 'text'
    }).pipe(
      map(response => {
        // Return success object with the response message
        return { success: true, message: response };
      }),
      catchError(error => {
        console.error('Error deleting ticket:', error);
        throw error;
      })
    );
  }
}
