import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, AfterViewInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { TimelineEvent, TicketActivityDto } from "src/app/core/models/ticket-activity.model";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

declare var bootstrap: any;
declare var Notify: any;

/**
 * Component that displays ticket activities in a timeline format with filtering and pagination
 */
@Component({
    selector: "app-ticket-activity-timeline",
    templateUrl: "./ticket-activity-timeline.component.html",
    styleUrls: ["./ticket-activity-timeline.component.css"]
})
export class TicketActivityTimelineComponent implements OnChanges, OnInit, AfterViewInit {
    @Input() events: TimelineEvent[] = [];
    @Input() loading = false;
    @Input() error: string | null = null;
    @Input() currentPage = 0;
    @Input() totalPages = 0;
    @Input() type: string = "";
    @Input() username: string = "";
    @Input() query: string = "";
    @Input() sortField: string = "startTime";
    @Input() sortDir: string = "desc";
    @Input() ticketId: string = "";
    
    @Output() pageChange = new EventEmitter<number>();
    @Output() filterChange = new EventEmitter<{
        q?: string;
        type?: string;
        username?: string;
        sortField?: string;
        sortDir?: string;
    }>();
    @Output() activityCreated = new EventEmitter<any>();
    @Output() activityUpdated = new EventEmitter<any>();
    @Output() activityCompleted = new EventEmitter<number>();
    @Output() activityDeleted = new EventEmitter<number>();
    
    /**
     * Array of page numbers to display in pagination
     */
    pages: number[] = [];
    
    /**
     * Form for filtering and sorting
     */
    filterForm: FormGroup;
    
    /**
     * Flag to indicate if filters have been applied
     */
    filtersApplied = false;
    
    /**
     * Available activity types for dropdown
     */
    readonly ACTIVITY_TYPES = [
        { value: "", label: "All Types" },
        { value: "OPEN", label: "Open" },
        { value: "CLOSE", label: "Close" },
        { value: "UPDATE", label: "Update" },
        { value: "EMAIL", label: "Email" },
        { value: "CALL", label: "Call" },
        { value: "RESEARCH", label: "Research" },
        { value: "ASSIGNMENT", label: "Assignment" },
        { value: "OTHER", label: "Other" }
    ];
    
    /**
     * Available sort fields for dropdown
     */
    readonly SORT_FIELDS = [
        { value: "startTime", label: "Start Time" },
        { value: "createdAt", label: "Created At" },
        { value: "type", label: "Activity Type" },
        { value: "username", label: "Username" }
    ];
    
    /**
     * Available sort directions for dropdown
     */
    readonly SORT_DIRECTIONS = [
        { value: "desc", label: "Descending" },
        { value: "asc", label: "Ascending" }
    ];

    /**
     * Form for creating or editing activities
     */
    activityForm: FormGroup;
    
    /**
     * Current activity being edited
     */
    currentActivity: TimelineEvent | null = null;
    
    /**
     * Bootstrap Modal instances
     */
    private _editActivityModal: any = null;
    private _deleteActivityModal: any = null;

    constructor(private _formBuilder: FormBuilder) {}

    /**
     * Initialize filter form and activity form
     */
    ngOnInit(): void {
        this._initFilterForm();
        this._initActivityForm();
    }
    
    /**
     * Initialize Bootstrap components after view is initialized
     */
    ngAfterViewInit(): void {
        this._initBootstrapComponents();
    }

    /**
     * Respond to input changes
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes.totalPages) {
            this._generatePagination();
        }
        
        if (changes.type || changes.username || changes.query || 
            changes.sortField || changes.sortDir) {
            this._updateFormValues();
        }
    }

    /**
     * Initializes Bootstrap components
     */
    private _initBootstrapComponents(): void {
        setTimeout(() => {
            const filterCollapseElement = document.getElementById("filterCollapse");
            const activityFormCollapseElement = document.getElementById("activityFormCollapse");
            
            if (filterCollapseElement && typeof bootstrap !== "undefined" && bootstrap.Collapse) {
                this._createCollapse(filterCollapseElement);
            }
            
            if (activityFormCollapseElement && typeof bootstrap !== "undefined" && bootstrap.Collapse) {
                this._createCollapse(activityFormCollapseElement);
            }
            
            const editActivityModalElement = document.getElementById("editActivityModal");
            const deleteActivityModalElement = document.getElementById("deleteActivityModal");
            
            if (editActivityModalElement && typeof bootstrap !== "undefined" && bootstrap.Modal) {
                this._editActivityModal = new bootstrap.Modal(editActivityModalElement);
            }

            if (deleteActivityModalElement && typeof bootstrap !== "undefined" && bootstrap.Modal) {
                this._deleteActivityModal = new bootstrap.Modal(deleteActivityModalElement);
            }
        }, 100);
    }

    /**
     * Creates a Bootstrap collapse instance
     */
    private _createCollapse(element: HTMLElement): void {
        try {
            new bootstrap.Collapse(element, {
                toggle: false
            });
        } catch (error) {
            console.error("Error initializing Bootstrap collapse:", error);
        }
    }

    /**
     * Initializes the filter form and sets up value change observation
     */
    private _initFilterForm(): void {
        this.filterForm = this._formBuilder.group({
            q: [this.query],
            type: [this.type],
            username: [this.username],
            sortField: [this.sortField],
            sortDir: [this.sortDir]
        });
    }

    /**
     * Initialize the activity creation/editing form
     */
    private _initActivityForm(): void {
        this.activityForm = this._formBuilder.group({
            id: [null],
            type: ["", Validators.required],
            description: [""]
        });
    }

    /**
     * Updates form values when inputs change
     */
    private _updateFormValues(): void {
        if (this.filterForm) {
            this.filterForm.patchValue(
                {
                    q: this.query,
                    type: this.type,
                    username: this.username,
                    sortField: this.sortField,
                    sortDir: this.sortDir
                },
                { emitEvent: false }
            );
        }
    }

    /**
     * Apply filters and emit filter changes
     */
    applyFilters(): void {
        console.log("Applying filters...", this.filterForm.value);
        if (this.filterForm && this.filterForm.valid) {
            this.filtersApplied = true;
            // Ensure we're correctly emitting the event
            this.filterChange.emit({
                q: this.filterForm.value.q,
                type: this.filterForm.value.type,
                username: this.filterForm.value.username,
                sortField: this.filterForm.value.sortField,
                sortDir: this.filterForm.value.sortDir
            });
        }
    }

    /**
     * Handles page change events
     */
    onPageChange(page: number): void {
        if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
            this.pageChange.emit(page);
        }
    }

    /**
     * Resets all filters and emits filter change event
     */
    resetFilters(): void {
        this.filterForm.patchValue({
            q: "",
            type: "",
            username: "",
            sortField: "startTime",
            sortDir: "desc"
        });
        this.applyFilters();
        this.filtersApplied = false;
    }
    
    /**
     * Manually toggle filter collapse
     */
    toggleFilters(): void {
        const filterCollapse = document.getElementById("filterCollapse");
        if (filterCollapse) {
            if (typeof bootstrap !== "undefined" && bootstrap.Collapse) {
                const bsCollapse = bootstrap.Collapse.getInstance(filterCollapse);
                if (bsCollapse) {
                    bsCollapse.toggle();
                } else {
                    new bootstrap.Collapse(filterCollapse);
                }
            } else {
                // Fallback for when Bootstrap JS isn't loaded
                filterCollapse.classList.toggle("show");
            }
        }
    }

    /**
     * Toggles the activity creation form
     */
    toggleActivityForm(): void {
        const activityFormCollapse = document.getElementById("activityFormCollapse");
        if (activityFormCollapse) {
            // Reset form whenever we toggle
            this.activityForm.reset({
                type: "",
                description: ""
            });
            
            if (typeof bootstrap !== "undefined" && bootstrap.Collapse) {
                const bsCollapse = bootstrap.Collapse.getInstance(activityFormCollapse);
                if (bsCollapse) {
                    bsCollapse.toggle();
                } else {
                    new bootstrap.Collapse(activityFormCollapse);
                }
            } else {
                // Fallback for when Bootstrap JS isn't loaded
                activityFormCollapse.classList.toggle("show");
            }
        }
    }

    /**
     * Saves a new activity
     */
    saveActivity(): void {
        if (this.activityForm.valid) {
            const formData = this.activityForm.value;
            
            // Emit event to parent component to handle the API call
            this.activityCreated.emit({
                ticketId: this.ticketId,
                type: formData.type,
                description: formData.description,
                username: "jhon doe"
            });
            
            // Hide the form
            this.toggleActivityForm();
            
            // Show success notification
            this._showSuccessNotification("Activity created successfully");
        } else {
            // Mark all form fields as touched to show validation errors
            Object.keys(this.activityForm.controls).forEach(key => {
                this.activityForm.controls[key].markAsTouched();
            });
        }
    }
    
    /**
     * Toggles the action menu for an activity
     */
    toggleActionMenu(event: Event, activityId: number): void {
        event.preventDefault();
        event.stopPropagation();
        
        const menuId = `actionMenu-${activityId}`;
        const menuElement = document.getElementById(menuId);
        
        // Close all other open dropdowns first
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
            if (menu.id !== menuId) {
                menu.classList.remove('show');
            }
        });
        
        // Toggle the selected dropdown menu
        if (menuElement) {
            menuElement.classList.toggle('show');
        }
        
        // Add a click handler to close the dropdown when clicking outside
        setTimeout(() => {
            const clickHandler = (e: MouseEvent) => {
                if (!menuElement?.contains(e.target as Node)) {
                    menuElement?.classList.remove('show');
                    document.removeEventListener('click', clickHandler);
                }
            };
            document.addEventListener('click', clickHandler);
        }, 0);
    }
    
    /**
     * Opens the edit activity modal
     */
    editActivity(event: TimelineEvent): void {
        this.currentActivity = event;
        
        // Set form values from the activity (only description now)
        this.activityForm.patchValue({
            id: event.id,
            description: event.description
        });
        
        if (this._editActivityModal) {
            this._editActivityModal.show();
        } else {
            console.error("Edit activity modal not initialized");
            this._showErrorNotification("Could not open the edit form. Please try again.");
        }
    }
    
    /**
     * Updates an existing activity
     */
    updateActivity(): void {
        if (this.activityForm.valid && this.currentActivity) {
            const formData = this.activityForm.value;
            
            // Emit event to parent component to handle the API call
            this.activityUpdated.emit({
                id: this.currentActivity.id,
                ticketId: this.ticketId,
                description: formData.description
            });
            
            // Close modal
            if (this._editActivityModal) {
                this._editActivityModal.hide();
            }
            
            // Show success notification
            this._showSuccessNotification("Activity updated successfully");
        } else {
            // Mark all form fields as touched to show validation errors
            Object.keys(this.activityForm.controls).forEach(key => {
                this.activityForm.controls[key].markAsTouched();
            });
        }
    }
    
    /**
     * Marks an activity as complete
     */
    completeActivity(event: TimelineEvent): void {
        // Confirm before completing
        if (confirm(`Are you sure you want to mark "${event.title}" as complete?`)) {
            // Emit event to parent component to handle the API call
            this.activityCompleted.emit(event.id);
            
            // Show success notification
            this._showSuccessNotification('Activity marked as complete');
        }
    }

    /**
     * Opens the delete confirmation modal
     */
    confirmDeleteActivity(event: TimelineEvent): void {
        this.currentActivity = event;
        
        if (this._deleteActivityModal) {
            this._deleteActivityModal.show();
        } else {
            console.error('Delete activity modal not initialized');
            this._showErrorNotification('Could not open the delete confirmation. Please try again.');
        }
    }

    /**
     * Deletes the current activity
     */
    deleteActivity(): void {
        if (this.currentActivity) {
            // Emit event to parent component to handle the API call
            this.activityDeleted.emit(this.currentActivity.id);
            
            // Close modal
            if (this._deleteActivityModal) {
                this._deleteActivityModal.hide();
            }
            
            // Show success notification
            // this._showSuccessNotification('Activity deleted successfully');
        }
    }
    
    /**
     * Shows a success notification using Simple-Notify
     */
    private _showSuccessNotification(message: string): void {
        if (typeof Notify !== 'undefined') {
            new Notify({
                status: 'success',
                title: 'Success',
                text: message,
                effect: 'slide',
                speed: 300,
                showIcon: true,
                showCloseButton: true,
                autoclose: true,
                autotimeout: 3000,
                gap: 20,
                distance: 20,
                type: 'outline',
                position: 'right top'
            });
        } else {
            console.log('Success:', message);
        }
    }
    
    /**
     * Shows an error notification using Simple-Notify
     */
    private _showErrorNotification(message: string): void {
        if (typeof Notify !== 'undefined') {
            new Notify({
                status: 'error',
                title: 'Error',
                text: message,
                effect: 'slide',
                speed: 300,
                showIcon: true,
                showCloseButton: true,
                autoclose: true,
                autotimeout: 5000,
                gap: 20,
                distance: 20,
                type: 'outline',
                position: 'right top'
            });
        } else {
            console.error('Error:', message);
        }
    }

    /**
     * Generates an array of page numbers for pagination
     */
    private _generatePagination(): void {
        if (this.totalPages <= 7) {
            // Show all pages if 7 or fewer
            this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
            return;
        }

        const pages: number[] = [];
        pages.push(0); // Always add first page
        
        if (this.currentPage > 3) {
            pages.push(-1); // -1 represents ellipsis
        }
        
        const start = Math.max(1, this.currentPage - 1);
        const end = Math.min(this.totalPages - 2, this.currentPage + 1);
        
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        
        if (this.currentPage < this.totalPages - 4) {
            pages.push(-1); // Add ellipsis if current page is far from end
        }
        
        pages.push(this.totalPages - 1); // Always add last page
        
        this.pages = pages;
    }

    /**
     * Formats a duration string into a human-readable format
     * 
     * @param duration - ISO 8601 duration string or minutes
     * @returns Formatted duration string
     */
    formatDuration(duration: string | number): string {
        if (!duration) return "N/A";
        
        // If it's just a number, assume it's minutes
        if (typeof duration === "number") {
            const hours = Math.floor(duration / 60);
            const minutes = duration % 60;
            
            if (hours > 0) {
                return `${hours}h ${minutes}m`;
            } else {
                return `${minutes}m`;
            }
        }
        
        // If it's a string but numeric, treat as minutes
        if (!isNaN(Number(duration))) {
            const durationNum = Number(duration);
            const hours = Math.floor(durationNum / 60);
            const minutes = durationNum % 60;
            
            if (hours > 0) {
                return `${hours}h ${minutes}m`;
            } else {
                return `${minutes}m`;
            }
        }
        
        // Try to parse ISO 8601 duration
        try {
            // Parse ISO8601 duration like PT1H30M
            const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
            const matches = regex.exec(duration);
            
            if (matches) {
                const hours = matches[1] ? parseInt(matches[1]) : 0;
                const minutes = matches[2] ? parseInt(matches[2]) : 0;
                const seconds = matches[3] ? parseInt(matches[3]) : 0;
                
                let result = "";
                if (hours > 0) result += `${hours}h `;
                if (minutes > 0 || hours > 0) result += `${minutes}m `;
                if (seconds > 0) result += `${seconds}s`;
                
                return result.trim();
            }
        } catch (e) {
            console.error("Error parsing duration:", e);
        }
        
        return duration.toString();
    }
    
    /**
     * Formats a date string into a human-readable format
     * 
     * @param dateString - ISO date string
     * @returns Formatted date and time
     */
    formatDateTime(dateString: string): string {
        if (!dateString) return "N/A";
        
        try {
            const date = new Date(dateString);
            return date.toLocaleString();
        } catch (e) {
            console.error("Error formatting date:", e);
            return dateString;
        }
    }

    /**
 * Transforms an ISO 8601 duration string (e.g., "PT1H30M") into a human-readable format.
 * Accepts a string input, handles "N/A", empty, and malformed values.
 *
 * @param isoDuration - ISO 8601 duration string.
 * @returns Human-readable duration string.
 */
formatIsoDuration(isoDuration: string): string {
    if (!isoDuration || isoDuration === "N/A") {
        return "Activty not completed"; // Handle N/A or empty string
      }
    
      // Allow optional decimal part for seconds
      const regex = /^P(?:T)?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/;
      const match = isoDuration.match(regex);
    
      if (!match) {
        return "Invalid duration format"; // fallback for invalid format
      }
    
      const [, hoursStr, minutesStr, secondsStr] = match;
      const hours = hoursStr ? parseInt(hoursStr, 10) : 0;
      const minutes = minutesStr ? parseInt(minutesStr, 10) : 0;
      const seconds = secondsStr ? Math.round(parseFloat(secondsStr)) : 0;
    
      const parts: string[] = [];
      if (hours) {
        parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
      }
      if (minutes) {
        parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
      }
      if (seconds) {
        parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);
      }
  
    return parts.length > 0 ? parts.join(" ") : "0 minutes";
  }
  
}