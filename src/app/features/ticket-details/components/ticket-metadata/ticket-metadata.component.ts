import { Component, Input } from '@angular/core';
import { TicketResponse } from 'src/app/core/models/ticket.model';

@Component({
  selector: 'app-ticket-metadata',
  templateUrl: './ticket-metadata.component.html',
  styleUrls: ['./ticket-metadata.component.css']
})
export class TicketMetadataComponent {
  @Input() ticket: TicketResponse;
  @Input() assignee: any;
  copied = false;

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    });
  }
} 