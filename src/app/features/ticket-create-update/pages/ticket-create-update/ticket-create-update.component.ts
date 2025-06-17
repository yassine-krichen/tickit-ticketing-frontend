import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TicketService } from 'src/app/core/services/ticket/ticket.service';
import {
  TicketResponse,
  Priority,
  Status,
} from 'src/app/core/models/ticket.model';
import {
  getPriorityLabel,
  getStatusLabel,
} from 'src/app/core/utils/ticket.util';

/**
 * Component responsible for creating new tickets or editing existing ones
 */
@Component({
  selector: 'app-ticket-create-update',
  templateUrl: './ticket-create-update.component.html',
  styleUrls: ['./ticket-create-update.component.css'],
})
export class TicketCreateUpdateComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isEditMode = false;
  ticketId: string = null;
  showTip: boolean = true;
  ticket: TicketResponse | null = null;
  loading = false;
  error: string | null = null;

  // Track subscription cleanup
  private _destroy$ = new Subject<void>();

  // Define available options for dropdowns
  priorityOptions = [
    Priority.P1,
    Priority.P2,
    Priority.P3,
    Priority.P4,
    Priority.P5,
  ];

  statusOptions = [
    Status.OPEN,
    Status.IN_PROGRESS,
    Status.BLOCKED,
    Status.RESOLVED,
    Status.CLOSED,
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService
  ) {}

  /**
   * Initialize the component, setup form, and fetch ticket data if in edit mode
   */
  ngOnInit(): void {
    this.initializeForm();

    this.route.paramMap.pipe(takeUntil(this._destroy$)).subscribe((params) => {
      const id = params.get('id');
      this.isEditMode = !!id;

      if (this.isEditMode && id) {
        this.ticketId = id;
        this.loadTicketData(id);
      } else {
        // For new ticket creation, disable the status field
        const statusControl = this.form.get('status');
        if (statusControl) {
          statusControl.disable();
        }
      }
    });
  }

  /**
   * Initialize the form with default values
   */
  private initializeForm(): void {
    this.form = this.fb.group({
      subject: ['', Validators.required],
      description: [''],
      priority: [Priority.P3, Validators.required],
      status: [Status.OPEN, Validators.required],
      acteTraitement: [''],
      issuedBy: ['system'], // Default value
    });
  }

  /**
   * Load ticket data from server when in edit mode
   * @param id - Ticket ID to fetch
   */
  private loadTicketData(id: string): void {
    this.loading = true;
    this.error = null;

    this.ticketService
      .getTicketById(id)
      .pipe(takeUntil(this._destroy$))
      .subscribe(
        (ticket) => {
          this.loading = false;

          if (ticket) {
            this.ticket = ticket;
            // Update form with ticket data
            this.form.patchValue({
              subject: ticket.subject,
              description: ticket.description,
              priority: ticket.priority,
              status: ticket.status,
              acteTraitement: ticket.acteTraitement,
              issuedBy: ticket.issuedBy,
            });

            // Disable acteTraitement field in edit mode
            if (this.form.get('acteTraitement')) {
              this.form.get('acteTraitement').disable();
            }
          } else {
            this.error = 'Ticket not found';
          }
        },
        (err) => {
          this.loading = false;
          console.error('Error loading ticket:', err);
          this.error = 'Failed to load ticket data. Please try again.';
        }
      );
  }

  /**
   * Handle form submission for creating or updating tickets
   * @param formData - Form data to submit
   */
  onSubmit(formData: any): void {
    console.log('Parent component received form data:', formData);

    if (!this.form.valid && this.form.errors !== null) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      console.log('Form is invalid', this.form.errors);
      return;
    }

    // Create a copy of the form value for submission
    const payload = { ...formData };

    // If acteTraitement is disabled (in edit mode), we need to include its value
    const acteTraitementControl = this.form.get('acteTraitement');
    if (acteTraitementControl && acteTraitementControl.disabled) {
      payload.acteTraitement = acteTraitementControl.value;
    }

    if (this.isEditMode && this.ticketId) {
      // Update existing ticket
      this.ticketService.updateTicket(this.ticketId, formData).subscribe(
        (response) => {
          console.log('Ticket updated successfully:', response);
          this.router.navigate(['/ticket-details', this.ticketId]);
        },
        (error) => {
          console.error('Error updating ticket:', error);
          this.error = 'Failed to update ticket. Please try again.';
        }
      );
    } else {
      // Create new ticket
      console.log('Creating new ticket with payload:', formData);
      formData.status = Status.OPEN; // Set default status for new tickets
      this.ticketService.createTicket(formData).subscribe(
        (response) => {
          console.log('Ticket created successfully:', response);
          this.router.navigate(['/dashboard']);
        },
        (error) => {
          console.error('Error creating ticket:', error);
          this.error = 'Failed to create ticket. Please try again.';
        }
      );
    }
  }

  /**
   * Get display name for priority
   */
  getPriorityDisplay(priority: Priority): string {
    return getPriorityLabel(priority);
  }

  /**
   * Get display name for status
   */
  getStatusDisplay(status: Status): string {
    return getStatusLabel(status);
  }

  /**
   * Navigate back to previous page based on context
   * - Returns to ticket details when in edit mode
   * - Returns to dashboard when creating new ticket
   */
  onBackClick(): void {
    if (this.isEditMode && this.ticketId) {
      // Navigate back to the ticket details page when editing
      this.router.navigate(['/ticket-details', this.ticketId]);
    } else {
      // Navigate to dashboard when creating new ticket
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Handle cancel button click
   */
  onCancel(): void {
    if (this.isEditMode && this.ticketId) {
      // Navigate back to ticket details if editing
      this.router.navigate(['/ticket-details', this.ticketId]);
    } else {
      // Navigate to dashboard if creating new ticket
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Dismiss the tip alert
   */
  dismissTip(): void {
    this.showTip = false;
  }

  /**
   * Cleanup subscriptions on component destruction
   */
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
