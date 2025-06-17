import {
  Component,
  EventEmitter,
  Input,
  Output,
  AfterViewInit,
} from '@angular/core';
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

// Declare bootstrap for TypeScript
declare const bootstrap: any;

export interface FilterOptions {
  priorities: Priority[];
  statuses: Status[];
  types: CaseType[];
  steps: CaseStep[];
  subStatuses: string[];
}

@Component({
  selector: 'app-filter-drawer',
  templateUrl: './filter-drawer.component.html',
  styleUrls: ['./filter-drawer.component.css'],
})
export class FilterDrawerComponent implements AfterViewInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<FilterOptions>();

  // Track selected filters
  selectedPriorities: Priority[] = [];
  selectedStatuses: Status[] = [];
  selectedTypes: CaseType[] = [];
  selectedSteps: CaseStep[] = [];
  selectedSubStatuses: string[] = [];

  // Filter options
  priorities = Object.values(Priority);
  statuses = Object.values(Status);
  caseTypes = Object.values(CaseType);

  // Helper methods to use utils
  getStatusLabel = getStatusLabel;
  getPriorityLabel = getPriorityLabel;
  getCaseTypeLabel = getCaseTypeLabel;
  getCaseStepLabel = getCaseStepLabel;

  ngAfterViewInit(): void {
    // Initialize Bootstrap collapse components after view is ready
    setTimeout(() => {
      this.initializeBootstrapComponents();
    }, 100);
  }

  private initializeBootstrapComponents(): void {
    if (typeof bootstrap !== 'undefined') {
      // Find all collapse elements and initialize them
      const collapseElements = document.querySelectorAll(
        '[data-bs-toggle="collapse"]'
      );
      collapseElements.forEach((element) => {
        if (!element.getAttribute('data-bs-initialized')) {
          new bootstrap.Collapse(element, { toggle: false });
          element.setAttribute('data-bs-initialized', 'true');
        }
      });
    }
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
      // Also remove any steps that belong to this type
      const typeSteps = getValidStepsForType(type);
      this.selectedSteps = this.selectedSteps.filter(
        (step) => !typeSteps.includes(step)
      );
    } else {
      this.selectedTypes.push(type);
    }
    this.emitFilterChange();

    // Force change detection to update button styles
    setTimeout(() => {
      // Trigger change detection by accessing the DOM
    }, 0);
  }

  toggleStep(step: CaseStep): void {
    const index = this.selectedSteps.indexOf(step);
    if (index > -1) {
      this.selectedSteps.splice(index, 1);
    } else {
      this.selectedSteps.push(step);

      // Auto-select the parent type if not already selected
      const parentType = this.getParentTypeForStep(step);
      if (parentType && !this.selectedTypes.includes(parentType)) {
        this.selectedTypes.push(parentType);
      }
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
    return this.selectedSteps.includes(step);
  }

  /**
   * Get parent type for a given step
   */
  private getParentTypeForStep(step: CaseStep): CaseType | null {
    for (const type of this.caseTypes) {
      const validSteps = getValidStepsForType(type);
      if (validSteps.includes(step)) {
        return type;
      }
    }
    return null;
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

  /**
   * Get count of selected steps for a specific type
   */
  getSelectedStepsCountForType(type: CaseType): number {
    const typeSteps = getValidStepsForType(type);
    return this.selectedSteps.filter((step) => typeSteps.includes(step)).length;
  }

  /**
   * Check if all steps for a type are selected
   */
  areAllStepsSelectedForType(type: CaseType): boolean {
    const typeSteps = getValidStepsForType(type);
    return (
      typeSteps.length > 0 &&
      typeSteps.every((step) => this.selectedSteps.includes(step))
    );
  }

  /**
   * Toggle all steps for a type
   */
  toggleAllStepsForType(type: CaseType): void {
    const typeSteps = getValidStepsForType(type);
    const allSelected = this.areAllStepsSelectedForType(type);

    if (allSelected) {
      // Remove all steps of this type
      this.selectedSteps = this.selectedSteps.filter(
        (step) => !typeSteps.includes(step)
      );
    } else {
      // Add all steps of this type
      typeSteps.forEach((step) => {
        if (!this.selectedSteps.includes(step)) {
          this.selectedSteps.push(step);
        }
      });

      // Ensure parent type is selected
      if (!this.selectedTypes.includes(type)) {
        this.selectedTypes.push(type);
      }
    }

    this.emitFilterChange();
  }

  /**
   * Toggle collapse for a specific accordion item
   */
  toggleCollapse(index: number): void {
    const targetId = `collapse${index}`;
    const targetElement = document.getElementById(targetId);

    if (targetElement && typeof bootstrap !== 'undefined') {
      const collapseInstance =
        bootstrap.Collapse.getOrCreateInstance(targetElement);
      collapseInstance.toggle();
    }
  }

  /**
   * TrackBy function for type buttons
   */
  trackByType(index: number, type: CaseType): CaseType {
    return type;
  }

  /**
   * TrackBy function for step groups
   */
  trackByGroup(index: number, group: any): CaseType {
    return group.type;
  }

  /**
   * TrackBy function for step buttons
   */
  trackByStep(index: number, step: CaseStep): CaseStep {
    return step;
  }
}
