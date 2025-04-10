// create.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from '../../../../core/services/ticket.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  ticketId: string = null;
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService
  ) { }
  
  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      category: [''],
      priority: [''],
      status: [''],
      treatmentActId: [''],
      description: ['']
    });
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.isEditMode = !!id;
      if (this.isEditMode) {
        this.ticketId = id;
        console.log(this.ticketId)
        this.ticketService.getTicketById(id).subscribe(ticket => {
          this.form.patchValue(ticket);
        });
      }
    });
  }
  
  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    const payload = this.form.value;
    if (this.isEditMode) {
      this.ticketService.updateTicket(this.ticketId, payload).subscribe(() => {
        this.router.navigate(['/ticketing']);
      });
    } else {
      this.ticketService.createTicket(payload).subscribe(() => {
        this.router.navigate(['/ticketing']);
      });
    }
  }
  
  onBackClick(): void {
    this.router.navigate(['/ticketing']);
  }
  
  onCancel(): void {
    this.router.navigate(['/ticketing']);
  }
  
  dismissTip(): void {
    // Implement your tip dismissal logic here (e.g., hide the alert)
  }
}
