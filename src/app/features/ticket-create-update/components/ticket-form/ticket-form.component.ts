import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CaseType, Priority, Status, TicketRequest, TicketResponse, TicketUpdateDTO } from 'src/app/core/models/ticket.model';
import { TicketService } from 'src/app/core/services/ticket/ticket.service';
import { formatSLA, getCaseTypeLabel, getPriorityLabel, getStatusLabel } from 'src/app/core/utils/ticket.util';

@Component({
  selector: 'app-ticket-form',
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.css']
})
export class TicketFormComponent implements OnInit {
  @Input() ticket: TicketResponse | null = null;
  @Input() editMode = false;
  @Output() formSubmit = new EventEmitter<TicketRequest | TicketUpdateDTO>();
  @Output() cancel = new EventEmitter<void>();

  ticketForm: FormGroup;
  validSteps: CaseType[] = [];
  stepValidationMessage = '';

  // All available case types from the enum
  caseTypes = Object.values(CaseType);

  // Priority options for dropdown
  priorityOptions = Object.values(Priority).map(value => ({
    value,
    label: getPriorityLabel(value)
  }));

  // Status options for dropdown
  statusOptions = Object.values(Status).map(value => ({
    value,
    label: getStatusLabel(value)
  }));

  // Helper to access form controls more easily in the template
  get f() { return this.ticketForm.controls; }

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService
  ) {
    this.ticketForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.editMode && this.ticket) {
      this.populateForm();
    } else {
      // For new tickets, disable the status field
      const statusControl = this.ticketForm.get("status");
      if (statusControl) {
        statusControl.disable();
      }
    }
    
    this.onTypeChange(); // Load valid steps for existing type
  }

  private createForm(): FormGroup {
    return this.fb.group({
      acteTraitement: ['', Validators.required],
      subject: ['', Validators.required],
      description: ['', Validators.required],
      type: ['', Validators.required],
      step: ['', Validators.required],
      subStatus: [''],
      priority: ['', Validators.required],
      status: ['', Validators.required],
    });
  }

  private populateForm(): void {
    if (!this.ticket) return;

    this.ticketForm.patchValue({
      acteTraitement: this.ticket.acteTraitement,
      subject: this.ticket.subject,
      description: this.ticket.description,
      type: this.ticket.type,
      step: this.ticket.step,
      subStatus: this.ticket.subStatus,
      priority: this.ticket.priority,
      status: this.ticket.status,
      issuedBy: this.ticket.issuedBy
    });
  }

  onTypeChange(): void {
    const selectedType = this.f.type.value as CaseType;
    if (!selectedType) {
      this.validSteps = [];
      this.stepValidationMessage = 'Please select a type first';
      this.f.step.setValue('');
      return;
    }

    this.ticketService.getValidStepsForType(selectedType).subscribe(
      steps => {
        this.validSteps = steps;

        if (steps.length === 0) {
          this.stepValidationMessage = 'No specific steps defined for this type. Any step can be selected.';
          // If no specific restrictions, we can use all steps
          this.validSteps = this.caseTypes;
        } else {
          this.stepValidationMessage = '';
        }

        // If current step is not valid for the new type, clear it
        const currentStep = this.f.step.value;
        if (currentStep && !this.validSteps.includes(currentStep)) {
          this.f.step.setValue('');
        }
      },
      error => {
        console.error('Error fetching valid steps:', error);
        this.stepValidationMessage = 'Error loading valid steps. Please try again.';
        this.validSteps = [];
      }
    );
  }

  validateTypeStepCombination(): void {
    const type = this.f.type.value as CaseType;
    const step = this.f.step.value as CaseType;

    if (!type || !step) return;

    this.ticketService.validateTypeStepCombination(type, step).subscribe(
      isValid => {
        if (!isValid) {
          this.stepValidationMessage = `The selected step is not valid for the ${getCaseTypeLabel(type)} type`;
          this.f.step.setErrors({ invalidCombination: true });
        } else {
          this.stepValidationMessage = '';
          // Clear the specific error but keep other validation errors if any
          const currentErrors = this.f.step.errors;
          if (currentErrors) {
            delete currentErrors.invalidCombination;
            this.f.step.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
          }
        }
      },
      error => {
        console.error('Error validating type-step combination:', error);
      }
    );
  }

  onSubmit(): void {
    console.log("Form submission triggered");

    if (this.ticketForm.invalid) {
        console.log("Form validation failed", this.ticketForm.errors);

        // Mark all form controls as touched to show validation errors
        Object.keys(this.ticketForm.controls).forEach(key => {
            const control = this.ticketForm.controls[key];
            control.markAsTouched();
            console.log(`Control ${key} errors:`, control.errors);
        });
        return;
    }

    const formData = this.ticketForm.value;
    console.log("Form data being emitted:", formData);
    this.formSubmit.emit(formData);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // Utility methods for the template
  getCaseTypeLabel(type: CaseType | string): string {
    return getCaseTypeLabel(type);
  }

  formatSLA(duration: any): string {
    return formatSLA(duration);
  }
}
