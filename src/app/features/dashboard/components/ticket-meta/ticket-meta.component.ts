import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ticket-meta',
  templateUrl: './ticket-meta.component.html',
  styleUrls: ['./ticket-meta.component.css']
})
export class TicketMetaComponent {
  @Input() ticket: any;
}
