import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketActivityService } from '../../../../core/services/ticket-activity/ticket-activity.service';

@Component({
  selector: 'app-ticket-activity-edit',
  templateUrl: './ticket-activity-edit.component.html',
  styleUrls: ['./ticket-activity-edit.component.css'],
})
export class TicketActivityEditComponent implements OnInit {
  activityId: string; // Change to string
  ticketId: string; // Change to string
  activityForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private activityService: TicketActivityService
  ) {
    this.activityForm = this.fb.group({
      type: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.activityId = this.route.snapshot.paramMap.get('activityId') || '';
    this.ticketId = this.route.snapshot.paramMap.get('ticketId') || '';

    if (this.activityId && this.ticketId) {
      this.loadActivityDetails();
    } else {
      this.error = 'Invalid activity or ticket ID';
    }
  }

  private loadActivityDetails(): void {
    this.loading = true;
    this.activityService
      .getActivityById(this.ticketId, this.activityId)
      .subscribe({
        next: (activity) => {
          this.activityForm.patchValue({
            description: activity.description,
            type: activity.type,
            duration: activity.duration,
          });
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading activity:', error);
          this.error = 'Failed to load activity details';
          this.loading = false;
        },
      });
  }

  onSubmit(): void {
    if (this.activityForm.valid) {
      this.loading = true;
      this.activityService
        .updateActivity(this.ticketId, this.activityId, this.activityForm.value)
        .subscribe({
          next: () => {
            this.router.navigate(['/ticket-details', this.ticketId]);
          },
          error: (error) => {
            console.error('Error updating activity:', error);
            this.error = 'Failed to update activity';
            this.loading = false;
          },
        });
    }
  }

  onCancel(): void {
    this.router.navigate([
      '/tickets',
      this.ticketId,
      'activities',
      this.activityId,
    ]);
  }
}
