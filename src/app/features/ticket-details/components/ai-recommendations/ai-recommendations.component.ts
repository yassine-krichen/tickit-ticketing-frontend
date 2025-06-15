import { Component, Input, OnDestroy } from '@angular/core';
import {
  AIService,
  AIResolutionResponse,
} from 'src/app/core/services/AI/ai.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize, catchError, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-ai-recommendations',
  templateUrl: './ai-recommendations.component.html',
  styleUrls: ['./ai-recommendations.component.css'],
})
export class AiRecommendationsComponent implements OnDestroy {
  @Input() ticketId!: string;

  recommendations: AIResolutionResponse | null = null;
  loading = false;
  error: string | null = null;
  hasLoaded = false;
  startTime: number = 0;

  private destroy$ = new Subject<void>();

  constructor(private aiService: AIService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  generateRecommendations(): void {
    if (!this.ticketId) {
      this.error = 'No ticket ID provided';
      return;
    }

    this.loading = true;
    this.error = null;
    this.hasLoaded = true;
    this.startTime = Date.now();

    this.aiService
      .getTicketSuggestions(this.ticketId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error details:', error);

          // Check if it's a timeout error
          if (error.name === 'TimeoutError') {
            throw new Error('The request is still processing. Please wait...');
          }

          throw new Error(
            'An error occurred while getting recommendations. Please try again.'
          );
        }),
        finalize(() => {
          this.loading = false;
          const duration = (Date.now() - this.startTime) / 1000;
          console.log(`Request took ${duration} seconds`);
        })
      )
      .subscribe({
        next: (data) => {
          this.recommendations = data;
          this.error = null;
        },
        error: (err) => {
          this.error = err.message;
          this.recommendations = null;
        },
      });
  }

  // Helper method to show elapsed time
  get elapsedTime(): string {
    if (!this.loading || !this.startTime) return '';
    const seconds = Math.floor((Date.now() - this.startTime) / 1000);
    return `${seconds} seconds`;
  }
}
