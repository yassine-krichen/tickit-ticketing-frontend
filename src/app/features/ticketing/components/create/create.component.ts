// create.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from '../../../../core/services/ticket/ticket.service';
import { Priority, Status } from '../../../../core/models/ticket.model';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  ticketId: string = null;
  showTip: boolean = true;
  
  // Define available options for dropdowns
  priorityOptions = Object.values(Priority);
  statusOptions = Object.values(Status);
  
  // Display mappings for enums
  priorityDisplayMap = {
    [Priority.P1]: 'Very Low',
    [Priority.P2]: 'Low',
    [Priority.P3]: 'Medium',
    [Priority.P4]: 'High',
    [Priority.P5]: 'Critical'
  };
  
  statusDisplayMap = {
    [Status.OPEN]: 'Open',
    [Status.IN_PROGRESS]: 'In Progress',
    [Status.BLOCKED]: 'Blocked',
    [Status.RESOLVED]: 'Resolved',
    [Status.CLOSED]: 'Closed'
  };
  
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
        () => {
          this.router.navigate(['/ticketing']);
        },
        error => {
          console.error('Error updating ticket:', error);
        }
      );
    } else {
      this.ticketService.createTicket(payload).subscribe(
        () => {
          this.router.navigate(['/ticketing']);
        },
        error => {
          console.error('Error creating ticket:', error);
        }
      );
    }
  }
  
  // Get display name for priority
  getPriorityDisplay(priority: Priority): string {
    return this.priorityDisplayMap[priority] || priority;
  }
  
  // Get display name for status
  getStatusDisplay(status: Status): string {
    return this.statusDisplayMap[status] || status;
  }
  
  onBackClick(): void {
    this.router.navigate(['/ticketing']);
  }
  
  onCancel(): void {
    this.router.navigate(['/ticketing']);
  }
  
  dismissTip(): void {
    this.showTip = false;
  }
}
