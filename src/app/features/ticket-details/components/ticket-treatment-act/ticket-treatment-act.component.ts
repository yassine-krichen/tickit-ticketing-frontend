import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ticket-treatment-act',
  templateUrl: './ticket-treatment-act.component.html',
  styleUrls: ['./ticket-treatment-act.component.css']
})
export class TicketTreatmentActComponent {
  @Input() acteTraitement: string;
}
