import { Component } from '@angular/core';
import {
  AIService,
  AIAnalysisResponse,
} from 'src/app/core/services/AI/ai.service';

@Component({
  selector: 'app-ticket-analytics',
  templateUrl: './ticket-analytics.component.html',
  styleUrls: ['./ticket-analytics.component.css'],
})
export class TicketAnalyticsComponent {
  loading = false;
  error: string | null = null;
  analysis: AIAnalysisResponse | null = null;

  constructor(private aiService: AIService) {}

  generateAnalysis(): void {
    this.loading = true;
    this.error = null;

    this.aiService.getSystemAnalysis().subscribe({
      next: (response) => {
        this.analysis = response;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error getting AI analysis:', err);
        this.error = 'Failed to generate analysis. Please try again.';
        this.loading = false;
      },
    });
  }
}
