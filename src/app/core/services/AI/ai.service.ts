import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  confidence: number;
  category: string;
  steps: Array<{
    order: number;
    description: string;
    completed: boolean;
  }>;
}

export interface TicketAnalysis {
  trends: string[];
  concerns: string[];
  recommendations: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private apiUrl = `${environment.apiUrl}/api/v1/ai`;

  // Set timeout to 10 minutes (600000 ms)
  private httpOptions = {
    timeout: 600000,
    responseType: 'json' as const
  };

  constructor(private http: HttpClient) {}

  getRecommendations(ticketId: string): Observable<AIRecommendation[]> {
    return this.http.get<AIRecommendation[]>(
      `${this.apiUrl}/recommendations/${ticketId}`,
      this.httpOptions
    );
  }

  analyzeTickets(): Observable<TicketAnalysis> {
    return this.http.post<TicketAnalysis>(
      `${this.apiUrl}/analyse`,
      {},
      this.httpOptions
    );
  }
}
