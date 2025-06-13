import { Component, OnDestroy } from '@angular/core';
import { AIService, TicketAnalysis } from 'src/app/core/services/AI/ai.service';
import { finalize, takeUntil, catchError } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-ticket-analytics',
  templateUrl: './ticket-analytics.component.html',
  styleUrls: ['./ticket-analytics.component.css']
})
export class TicketAnalyticsComponent implements OnDestroy {
  loading = false;
  error: string | null = null;
  analysis: TicketAnalysis | null = null;
  startTime: number = 0;

  private destroy$ = new Subject<void>();

  constructor(private aiService: AIService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  runAnalysis(): void {
    this.loading = true;
    this.error = null;
    this.startTime = Date.now();

    this.aiService.analyzeTickets()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error: any) => {
          console.error('Error details:', error);

          if (error instanceof HttpErrorResponse) {
            // Handle HTTP errors
            const message = error.error?.message || error.message || 'An error occurred during analysis';
            return of({ error: message });
          }

          // Handle non-HTTP errors
          return of({ error: error.message || 'An unknown error occurred' });
        }),
        finalize(() => {
          this.loading = false;
          const duration = (Date.now() - this.startTime) / 1000;
          console.log(`Analysis took ${duration} seconds`);
        })
      )
      .subscribe({
        next: (result: any) => {
          if (result.error) {
            this.error = result.error;
            this.analysis = null;
            return;
          }
          this.analysis = result as TicketAnalysis;
          this.error = null;
        },
        error: (err) => {
          this.error = 'Failed to process analysis results';
          this.analysis = null;
        }
      });
  }

  get elapsedTime(): string {
    if (!this.loading || !this.startTime) return '';
    const seconds = Math.floor((Date.now() - this.startTime) / 1000);
    return `${seconds} seconds`;
  }
}
