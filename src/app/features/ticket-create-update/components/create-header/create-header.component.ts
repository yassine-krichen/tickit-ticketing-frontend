import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-create-header',
  templateUrl: './create-header.component.html',
  styleUrls: ['./create-header.component.css']
})
export class CreateHeaderComponent {
  @Input() isEditMode = false;
  @Output() back = new EventEmitter<void>();

  onBackClick(): void {
    this.back.emit();
  }
}
