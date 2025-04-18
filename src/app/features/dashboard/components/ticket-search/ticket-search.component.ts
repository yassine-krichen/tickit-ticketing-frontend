import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';

export type SearchCategory = 'title' | 'description' | 'id' | 'assignee';

interface CategoryOption {
  value: SearchCategory;
  label: string;
}

@Component({
  selector: 'app-ticket-search',
  templateUrl: './ticket-search.component.html',
  styleUrls: ['./ticket-search.component.css']
})
export class TicketSearchComponent {
  @Input() searchTerm: string = '';
  @Output() search = new EventEmitter<{term: string, category: SearchCategory}>();
  
  searchCategory: SearchCategory = 'title';
  isDropdownOpen = false;
  
  searchCategories: CategoryOption[] = [
    { value: 'title', label: 'Title' },
    { value: 'description', label: 'Description' },
    { value: 'id', label: 'ID' },
    { value: 'assignee', label: 'Assignee' }
  ];

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onSearchChange(term: string): void {
    this.search.emit({ term, category: this.searchCategory });
  }
  
  onCategoryChange(category: SearchCategory, event: Event): void {
    event.stopPropagation();
    this.searchCategory = category;
    this.isDropdownOpen = false;
    this.search.emit({ term: this.searchTerm, category });
  }

  getCategoryLabel(): string {
    const category = this.searchCategories.find(c => c.value === this.searchCategory);
    return category ? category.label : 'Title';
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.search.emit({ term: '', category: this.searchCategory });
  }
}
