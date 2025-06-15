import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AIAnalysisResponse {
  analysis: string;
  timestamp: Date;
  dataPoints: number;
}

export interface AIResolutionResponse {
  ticketId: string;
  suggestions: string;
  similarCasesFound: number;
  confidenceScore: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class AIService {
  private readonly baseUrl = `${environment.apiUrl}/api/v1/ai`;

  // Set timeout to 10 minutes (600000 ms)
  private httpOptions = {
    timeout: 600000,
    responseType: 'json' as const,
  };

  constructor(private http: HttpClient) {}

  getSystemAnalysis(): Observable<AIAnalysisResponse> {
    return this.http.post<AIAnalysisResponse>(`${this.baseUrl}/analyse`, {},
      this.httpOptions
    );
  }

  getTicketSuggestions(ticketId: string): Observable<AIResolutionResponse> {
    return this.http.post<AIResolutionResponse>(
      `${this.baseUrl}/suggest/${ticketId}`,
      {},
      this.httpOptions
    );
  }
}
