import { Component, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.css']
})
export class BackButtonComponent {
  @Output() onClick = new EventEmitter<void>();

  constructor(private location: Location) { }

  goBack(): void {
    // Emit the event so parent components can handle it if needed
    this.onClick.emit();
    
    // Default behavior is to use the browser history
    this.location.back();
  }
}
