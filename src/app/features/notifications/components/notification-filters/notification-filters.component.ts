import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Component for filtering notifications by various criteria
 */
@Component({
  selector: 'app-notification-filters',
  templateUrl: './notification-filters.component.html',
  styleUrls: ['./notification-filters.component.css'],
})
export class NotificationFiltersComponent implements OnInit, OnDestroy {
  @Input() currentFilters: any = {};
  @Output() filtersChange = new EventEmitter<any>();

  filterForm: FormGroup;

  // Available notification types for the dropdown - updated to match backend enum
  notificationTypes = [
    { value: '', label: 'All Types' },
    { value: 'TICKET_CREATED', label: 'Ticket Created' },
    { value: 'TICKET_RESOLVED', label: 'Ticket Resolved' },
    { value: 'PRIO_LEVELED', label: 'Priority Escalated' },
    { value: 'ACTIVITY_STALLED', label: 'Activity Stalled' },
    { value: 'CASE_BLOCKED', label: 'Case Blocked' },
    { value: 'DUE_DATE_APPROACHING', label: 'Due Date Approaching' },
    { value: 'SLA_BREACH', label: 'SLA Breach' },
    { value: 'SYSTEM_ANNOUNCEMENT', label: 'System Announcement' },
    { value: 'UPDATE', label: 'Ticket Updated' },
  ];

  // Available read status options
  readStatusOptions = [
    { value: null, label: 'All Notifications' },
    { value: false, label: 'Unread Only' },
    { value: true, label: 'Read Only' },
  ];

  private _destroy$ = new Subject<void>();

  /**
   * Initialize the filter form
   */
  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      readFlag: [null],
      type: [''],
      startDate: [null],
      endDate: [null],
      searchTerm: [''],
    });

    // Add date validation listeners
    this.filterForm
      .get('startDate')
      ?.valueChanges.pipe(takeUntil(this._destroy$))
      .subscribe((startDate) => {
        const endDate = this.filterForm.get('endDate')?.value;
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
          this.filterForm.patchValue({ endDate: startDate });
        }
      });

    this.filterForm
      .get('endDate')
      ?.valueChanges.pipe(takeUntil(this._destroy$))
      .subscribe((endDate) => {
        const startDate = this.filterForm.get('startDate')?.value;
        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
          this.filterForm.patchValue({ startDate: endDate });
        }
      });
  }

  /**
   * Set initial form values from input
   */
  ngOnInit(): void {
    // Set initial values from input
    this.filterForm.patchValue(this.currentFilters);
  }

  /**
   * Cleanup subscriptions on component destruction
   */
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Apply current form values as filters - only called on button click
   */
  applyFilters(): void {
    this.filtersChange.emit(this.filterForm.value);
  }

  /**
   * Reset all filters to default values
   */
  resetFilters(): void {
    this.filterForm.reset({
      readFlag: null,
      type: '',
      startDate: null,
      endDate: null,
      searchTerm: '',
    });
    // Apply filters after reset so changes take effect
    this.applyFilters();
  }
}
