import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface TrendInsight {
  category: string;
  description: string;
  significance: number;
}

export interface RiskArea {
  area: string;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  mitigationSteps: string[];
}

export interface EstimatedEffort {
  minHours: number;
  maxHours: number;
  difficulty: 'EASY' | 'MODERATE' | 'COMPLEX';
}

export interface AIAnalysisResponse {
  performanceMetrics: { [key: string]: number };
  trends: TrendInsight[];
  recommendations: string[];
  riskAreas: RiskArea[];
}

export interface AIResolutionResponse {
  primarySolution: string;
  alternativeSolutions: string[];
  requiredSteps: string[];
  potentialRisks: string[];
  confidenceScore: number;
  estimatedEffort: EstimatedEffort;
  requiredResources: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AIService {
  private readonly baseUrl = `${environment.apiUrl}/api/v1/ai`;

  private readonly REQUEST_TIMEOUT = 120000; // 2 minutes

  constructor(private http: HttpClient) {}

  getSystemAnalysis(): Observable<AIAnalysisResponse> {
    return this.http
      .post<AIAnalysisResponse>(`${this.baseUrl}/analyse`, {})
      .pipe(
        timeout(this.REQUEST_TIMEOUT)
      );
  }

  getTicketSuggestions(ticketId: string): Observable<AIResolutionResponse> {
    return this.http
      .post<AIResolutionResponse>(`${this.baseUrl}/suggest/${ticketId}`, {})
      .pipe(
        timeout(this.REQUEST_TIMEOUT)
      );
  }
}
