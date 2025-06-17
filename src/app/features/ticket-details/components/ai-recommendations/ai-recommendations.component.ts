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
        // Add logging here to debug
        console.log('Received recommendations:', this.recommendations);
        console.log('Primary solution:', this.getFilteredPrimarySolution());
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

  getFilteredSteps(): string[] {
    if (!this.recommendations?.requiredSteps) return [];

    const steps: string[] = [];
    let isInStepsSection = true;

    for (const step of this.recommendations.requiredSteps) {
      // Check if we've hit a different section header
      if (
        step.toLowerCase().includes('known risks:') ||
        step.toLowerCase().includes('required resources:')
      ) {
        isInStepsSection = false;
        continue;
      }

      // Only add the step if we're still in the steps section
      if (
        isInStepsSection &&
        !step.startsWith('Risk:') &&
        !step.startsWith('Resource:')
      ) {
        steps.push(step);
      }
    }

    return steps;
  }

  getFilteredPrimarySolution(): string | null {
    console.log('getFilteredPrimarySolution called');
    if (!this.recommendations?.primarySolution) {
      console.log('No recommendations or primary solution');
      return null;
    }

    const solution = this.recommendations.primarySolution;
    console.log('Original solution:', solution);

    const sectionMarkers = [
      'alternative solutions:',
      'required steps:',
      'known risks:',
      'required resources:',
    ];

    let firstSectionIndex = solution.length;
    for (const marker of sectionMarkers) {
      const index = solution.toLowerCase().indexOf(marker);
      if (index !== -1 && index < firstSectionIndex) {
        firstSectionIndex = index;
      }
    }

    const primarySolution = solution.substring(0, firstSectionIndex).trim();
    console.log('Filtered primary solution:', primarySolution);

    return primarySolution || null;
  }
}
