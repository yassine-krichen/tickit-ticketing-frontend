import { Component, Input } from '@angular/core';
import {
  AIService,
  AIResolutionResponse,
} from 'src/app/core/services/AI/ai.service';

@Component({
  selector: 'app-ai-recommendations',
  templateUrl: './ai-recommendations.component.html',
})
export class AiRecommendationsComponent {
  @Input() ticketId!: string;

  recommendations: AIResolutionResponse | null = null;
  loading = false;
  error: string | null = null;

  constructor(private aiService: AIService) {}

  generateRecommendations() {
    if (!this.ticketId) return;

    this.loading = true;
    this.error = null;

    this.aiService.getTicketSuggestions(this.ticketId).subscribe({
      next: (response) => {
        this.recommendations = response;
        this.loading = false;
      },
      error: (err) => {
        console.error('AI recommendations error:', err);
        this.error = 'Failed to generate recommendations';
        this.loading = false;
      },
    });
  }

  getDifficultyClass(difficulty: string): string {
    switch (difficulty) {
      case 'EASY':
        return 'badge bg-success';
      case 'MODERATE':
        return 'badge bg-warning';
      case 'COMPLEX':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  getConfidenceClass(score: number): string {
    if (score >= 0.8) return 'text-success';
    if (score >= 0.6) return 'text-warning';
    return 'text-danger';
  }
}
