import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, Renderer2, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-ticket-actions',
  templateUrl: './ticket-actions.component.html',
  styleUrls: ['./ticket-actions.component.css']
})
export class TicketActionsComponent implements AfterViewInit {
  @Input() ticketId: string;
  @Output() toggleDropdown = new EventEmitter<Event>();
  @Output() delete = new EventEmitter<void>();
  @ViewChild('dropdownMenu') dropdownMenu: ElementRef;
  @ViewChild('dropdownButton') dropdownButton: ElementRef;
  
  isOpen = false;
  isNearBottom = false;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    // Check position on init
    setTimeout(() => this.checkPosition(), 0);
  }

  onToggleDropdown(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    
    // Check position before showing dropdown
    this.checkPosition();
    this.isOpen = !this.isOpen;
    
    // Position the dropdown using fixed positioning if it's open
    if (this.isOpen && this.dropdownMenu) {
      setTimeout(() => this.positionDropdown(), 0);
    }
    
    // Add global click handler to close dropdown when clicking outside
    if (this.isOpen) {
      setTimeout(() => {
        document.addEventListener('click', this.closeDropdown);
      }, 0);
    } else {
      document.removeEventListener('click', this.closeDropdown);
    }
    
    this.toggleDropdown.emit(event);
  }

  private positionDropdown(): void {
    if (!this.dropdownMenu || !this.dropdownButton) return;
    
    const dropdown = this.dropdownMenu.nativeElement;
    const button = this.dropdownButton.nativeElement;
    const rect = button.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Use fixed positioning to bypass any container overflow constraints
    this.renderer.setStyle(dropdown, 'position', 'fixed');
    
    // Determine if there's enough space below
    const spaceBelow = windowHeight - rect.bottom;
    const dropdownHeight = 150; // Approximate height of dropdown
    
    if (spaceBelow < dropdownHeight) {
      // Position above the button
      this.renderer.setStyle(dropdown, 'bottom', `${windowHeight - rect.top}px`);
      this.renderer.setStyle(dropdown, 'top', 'auto');
    } else {
      // Position below the button
      this.renderer.setStyle(dropdown, 'top', `${rect.bottom}px`);
      this.renderer.setStyle(dropdown, 'bottom', 'auto');
    }
    
    // Align to the right of the button
    this.renderer.setStyle(dropdown, 'right', `${window.innerWidth - rect.right}px`);
    this.renderer.setStyle(dropdown, 'left', 'auto');
  }

  private checkPosition(): void {
    if (this.dropdownButton) {
      const button = this.dropdownButton.nativeElement;
      const rect = button.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // If button is in the bottom 30% of the screen, show dropdown above
      if (rect.bottom > windowHeight * 0.7) {
        this.isNearBottom = true;
      } else {
        this.isNearBottom = false;
      }
    }
  }

  private closeDropdown = (e: MouseEvent) => {
    // Only close if click is outside our component
    if (!this.elementRef.nativeElement.contains(e.target)) {
      this.isOpen = false;
      document.removeEventListener('click', this.closeDropdown);
    }
  }

  onDelete(): void {
    // Close dropdown when an action is taken
    this.isOpen = false;
    this.delete.emit();
  }
  
  ngOnDestroy(): void {
    // Clean up any event listeners
    document.removeEventListener('click', this.closeDropdown);
  }
}
