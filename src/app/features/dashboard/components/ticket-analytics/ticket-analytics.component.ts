import { Component } from '@angular/core';
import {
  AIService,
  AIAnalysisResponse,
} from 'src/app/core/services/AI/ai.service';

@Component({
  selector: 'app-ticket-analytics',
  templateUrl: './ticket-analytics.component.html',
})
export class TicketAnalyticsComponent {
  analysis: AIAnalysisResponse | null = null;
  loading = false;
  error: string | null = null;

  constructor(private aiService: AIService) {}

  generateAnalysis() {
    this.loading = true;
    this.error = null;

    this.aiService.getSystemAnalysis().subscribe({
      next: (response) => {
        this.analysis = response;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to generate system analytics';
        this.loading = false;
        console.error('Analytics error:', err);
      },
    });
  }

  getRiskLevelClass(level: string): string {
    switch (level) {
      case 'HIGH':
        return 'badge bg-danger';
      case 'MEDIUM':
        return 'badge bg-warning';
      case 'LOW':
        return 'badge bg-success';
      default:
        return 'badge bg-secondary';
    }
  }

  formatMetricValue(value: number): string {
    return value.toFixed(1) + '%';
  }

  getTrendIcon(significance: number): string {
    if (significance >= 0.7) return 'trending_up';
    if (significance >= 0.3) return 'trending_flat';
    return 'trending_down';
  }

  getTrendClass(significance: number): string {
    if (significance >= 0.7) return 'text-success';
    if (significance >= 0.3) return 'text-warning';
    return 'text-danger';
  }
}
