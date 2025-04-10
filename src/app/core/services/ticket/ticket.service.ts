import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Ticket, 
  BackendTicket, 
  TicketRequest, 
  TicketResponse, 
  TicketUpdateDTO, 
  TicketCount,
  Status,
  Priority
} from '../../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private baseUrl = 'http://localhost:8080/tickets';

  constructor(private http: HttpClient) { }

  // Create a new ticket
  createTicket(ticketRequest: TicketRequest): Observable<TicketResponse> {
    return this.http.post<TicketResponse>(this.baseUrl, ticketRequest);
  }

  // Get a single ticket by ID
  getTicketById(ticketId: string): Observable<TicketResponse> {
    return this.http.get<TicketResponse>(`${this.baseUrl}/${ticketId}`);
  }

  // Get all tickets with optional filters
  getAllTickets(
    status?: Status,
    priority?: Priority,
    issuedBy?: string,
    acteTraitement?: string
  ): Observable<TicketResponse[]> {
    let url = this.baseUrl;
    const params = new URLSearchParams();
    
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    if (issuedBy) params.append('issuedBy', issuedBy);
    if (acteTraitement) params.append('acteTraitement', acteTraitement);

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    return this.http.get<TicketResponse[]>(url);
  }

  // Get ticket counts by status
  getTicketCountsByStatus(): Observable<TicketCount[]> {
    return this.http.get<TicketCount[]>(`${this.baseUrl}/counts-by-status`);
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

  // Delete a ticket
  deleteTicket(ticketId: string): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/${ticketId}`);
  }
}
