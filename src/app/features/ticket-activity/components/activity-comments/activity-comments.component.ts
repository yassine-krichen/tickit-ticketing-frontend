import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketActivityService } from '../../../../core/services/ticket-activity/ticket-activity.service';

@Component({
  selector: 'app-activity-comments',
  templateUrl: './activity-comments.component.html',
  styleUrls: ['./activity-comments.component.css']
})
export class ActivityCommentsComponent {
  @Input() activityId: string;
  @Input() ticketId: string;
  @Input() comments: any[] = [];
  @Output() commentAdded = new EventEmitter<void>();

  commentForm = this.fb.group({
    content: ['', [Validators.required, Validators.minLength(1)]]
  });
  submitting = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private activityService: TicketActivityService
  ) {}

  // Add getter for form validation
  get isFormValid(): boolean {
    return this.commentForm.valid && this.commentForm.get('content')?.value?.trim().length > 0;
  }

  onSubmit(): void {
    if (this.isFormValid && !this.submitting) {
      this.submitting = true;
      this.error = null;

      this.activityService.addComment(
        this.ticketId,
        this.activityId,
        this.commentForm.value
      ).subscribe({
        next: () => {
          this.submitting = false;
          this.commentForm.reset();
          this.commentAdded.emit();
        },
        error: (error) => {
          this.submitting = false;
          this.error = 'Failed to add comment. Please try again.';
          console.error('Error adding comment:', error);
        }
      });
    }
  }

  deleteComment(commentId: string): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.activityService.deleteComment(this.activityId, commentId).subscribe({
        next: () => {
          this.commentAdded.emit();
        },
        error: (error) => {
          this.error = 'Failed to delete comment';
          console.error('Error deleting comment:', error);
        }
      });
    }
  }
}
