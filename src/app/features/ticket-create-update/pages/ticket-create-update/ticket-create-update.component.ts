import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from 'src/app/core/services/ticket/ticket.service';
import { Priority, Status } from 'src/app/core/models/ticket.model';
import { getPriorityLabel, getStatusLabel } from 'src/app/core/utils/ticket.util';

@Component({
  selector: 'app-ticket-create-update',
  templateUrl: './ticket-create-update.component.html',
  styleUrls: ['./ticket-create-update.component.css']
})
export class TicketCreateUpdateComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  ticketId: string = null;
  showTip: boolean = true;
  
  // Define available options for dropdowns
  priorityOptions = [
    Priority.P1,
    Priority.P2,
    Priority.P3,
    Priority.P4,
    Priority.P5
  ];
  
  statusOptions = [
    Status.OPEN,
    Status.IN_PROGRESS,
    Status.BLOCKED,
    Status.RESOLVED,
    Status.CLOSED
  ];
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService
  ) { }
  
  ngOnInit(): void {
    this.form = this.fb.group({
      subject: ['', Validators.required],
      description: [''],
      priority: [Priority.P3, Validators.required],
      status: [Status.OPEN, Validators.required],
      acteTraitement: [''],
      issuedBy: ['system'] // Default value, will be updated later
    });
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.isEditMode = !!id;
      if (this.isEditMode) {
        this.ticketId = id;
        this.ticketService.getTicketById(id).subscribe(ticket => {
          if (ticket) {
            this.form.patchValue({
              subject: ticket.subject,
              description: ticket.description,
              priority: ticket.priority,
              status: ticket.status,
              acteTraitement: ticket.acteTraitement,
              issuedBy: ticket.issuedBy
            });
            
            // Disable acteTraitement field in edit mode
            this.form.get('acteTraitement').disable();
          }
        });
      }
    });
  }
  
  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    
    // Create a copy of the form value for submission
    const payload = {...this.form.value};
    
    // If acteTraitement is disabled (in edit mode), we need to include its value
    if (this.form.get('acteTraitement').disabled) {
      payload.acteTraitement = this.form.get('acteTraitement').value;
    }
    
    if (this.isEditMode) {
      this.ticketService.updateTicket(this.ticketId, payload).subscribe(
        response => {
          this.router.navigate(['/dashboard']);
        },
        error => {
          console.error('Error updating ticket:', error);
        }
      );
    } else {
      this.ticketService.createTicket(payload).subscribe(
        response => {
          this.router.navigate(['/dashboard']);
        },
        error => {
          console.error('Error creating ticket:', error);
        }
      );
    }
  }
  
  // Get display name for priority
  getPriorityDisplay(priority: Priority): string {
    return getPriorityLabel(priority);
  }
  
  // Get display name for status
  getStatusDisplay(status: Status): string {
    return getStatusLabel(status);
  }
  
  onBackClick(): void {
    this.router.navigate(['/dashboard']);
  }
  
  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }
  
  dismissTip(): void {
    this.showTip = false;
  }
}
