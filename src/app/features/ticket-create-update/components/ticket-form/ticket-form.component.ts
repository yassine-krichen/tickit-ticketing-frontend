import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Priority, Status } from 'src/app/core/models/ticket.model';

@Component({
  selector: 'app-ticket-form',
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.css']
})
export class TicketFormComponent {
  @Input() form: FormGroup;
  @Input() isEditMode: boolean;
  @Input() priorityOptions: Priority[];
  @Input() statusOptions: Status[];
  @Input() getPriorityDisplay: (priority: Priority) => string;
  @Input() getStatusDisplay: (status: Status) => string;
}
