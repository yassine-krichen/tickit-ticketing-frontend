import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Priority, Status, CaseType } from 'src/app/core/models/ticket.model';
import { getCaseTypeLabel, getPriorityLabel, getStatusLabel } from 'src/app/core/utils/ticket.util';

export interface FilterOptions {
  priorities: Priority[];
  statuses: Status[];
  types: CaseType[];
  steps: CaseType[];
  subStatuses: string[];
}

@Component({
  selector: 'app-filter-drawer',
  templateUrl: './filter-drawer.component.html',
  styleUrls: ['./filter-drawer.component.css']
})
export class FilterDrawerComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<FilterOptions>();
  
  // Track selected filters
  selectedPriorities: Priority[] = [];
  selectedStatuses: Status[] = [];
  selectedTypes: CaseType[] = [];
  selectedSteps: CaseType[] = [];
  selectedSubStatuses: string[] = [];
  
  // Filter options
  priorities = Object.values(Priority);
  statuses = Object.values(Status);
  caseTypes = Object.values(CaseType);
  
  // Helper methods to use utils
  getStatusLabel = getStatusLabel;
  getPriorityLabel = getPriorityLabel;
  getCaseTypeLabel = getCaseTypeLabel;
  
  // Getter for step options to avoid filtering in the template
  get stepOptions(): CaseType[] {
    return this.caseTypes.filter(type => type.includes('_'));
  }
  
  closeDrawer(): void {
    this.close.emit();
  }
  
  togglePriority(priority: Priority): void {
    const index = this.selectedPriorities.indexOf(priority);
    if (index > -1) {
      this.selectedPriorities.splice(index, 1);
    } else {
      this.selectedPriorities.push(priority);
    }
    this.emitFilterChange();
  }
  
  toggleStatus(status: Status): void {
    const index = this.selectedStatuses.indexOf(status);
    if (index > -1) {
      this.selectedStatuses.splice(index, 1);
    } else {
      this.selectedStatuses.push(status);
    }
    this.emitFilterChange();
  }
  
  toggleType(type: CaseType): void {
    const index = this.selectedTypes.indexOf(type);
    if (index > -1) {
      this.selectedTypes.splice(index, 1);
    } else {
      this.selectedTypes.push(type);
    }
    this.emitFilterChange();
  }
  
  toggleStep(step: CaseType): void {
    const index = this.selectedSteps.indexOf(step);
    if (index > -1) {
      this.selectedSteps.splice(index, 1);
    } else {
      this.selectedSteps.push(step);
    }
    this.emitFilterChange();
  }
  
  clearFilters(): void {
    this.selectedPriorities = [];
    this.selectedStatuses = [];
    this.selectedTypes = [];
    this.selectedSteps = [];
    this.selectedSubStatuses = [];
    this.emitFilterChange();
  }
  
  emitFilterChange(): void {
    this.filterChange.emit({
      priorities: this.selectedPriorities,
      statuses: this.selectedStatuses,
      types: this.selectedTypes,
      steps: this.selectedSteps,
      subStatuses: this.selectedSubStatuses
    });
  }
  
  isPrioritySelected(priority: Priority): boolean {
    return this.selectedPriorities.includes(priority);
  }
  
  isStatusSelected(status: Status): boolean {
    return this.selectedStatuses.includes(status);
  }
  
  isTypeSelected(type: CaseType): boolean {
    return this.selectedTypes.includes(type);
  }
  
  isStepSelected(step: CaseType): boolean {
    return this.selectedSteps.includes(step);
  }
} 