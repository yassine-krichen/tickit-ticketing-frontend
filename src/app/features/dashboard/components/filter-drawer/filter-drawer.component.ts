import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  Priority,
  Status,
  CaseType,
  CaseStep,
} from 'src/app/core/models/ticket.model';
import {
  getCaseTypeLabel,
  getCaseStepLabel,
  getPriorityLabel,
  getStatusLabel,
  getValidStepsForType,
} from 'src/app/core/utils/ticket.util';

export interface FilterOptions {
  priorities: Priority[];
  statuses: Status[];
  types: CaseType[];
  steps: CaseStep[]; // Updated to use CaseStep
  subStatuses: string[];
}

@Component({
  selector: 'app-filter-drawer',
  templateUrl: './filter-drawer.component.html',
  styleUrls: ['./filter-drawer.component.css'],
})
export class FilterDrawerComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<FilterOptions>();

  // Track selected filters
  selectedPriorities: Priority[] = [];
  selectedStatuses: Status[] = [];
  selectedTypes: CaseType[] = [];
  selectedSteps: CaseStep[] = []; // Updated to use CaseStep
  selectedSubStatuses: string[] = [];

  // Filter options
  priorities = Object.values(Priority);
  statuses = Object.values(Status);
  caseTypes = Object.values(CaseType);
  caseSteps = Object.values(CaseStep); // All available steps

  // Helper methods to use utils
  getStatusLabel = getStatusLabel;
  getPriorityLabel = getPriorityLabel;
  getCaseTypeLabel = getCaseTypeLabel;
  getCaseStepLabel = getCaseStepLabel; // Added case step label helper

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

  toggleStep(step: CaseStep): void {
    // Updated to use CaseStep
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
      subStatuses: this.selectedSubStatuses,
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

  isStepSelected(step: CaseStep): boolean {
    // Updated to use CaseStep
    return this.selectedSteps.includes(step);
  }

  /**
   * Get steps organized by their parent type for better UI grouping
   */
  get stepsGroupedByType(): Array<{
    type: CaseType;
    typeLabel: string;
    steps: CaseStep[];
  }> {
    return this.caseTypes
      .map((type) => ({
        type,
        typeLabel: this.getCaseTypeLabel(type),
        steps: getValidStepsForType(type),
      }))
      .filter((group) => group.steps.length > 0); // Only show types that have steps
  }
}
