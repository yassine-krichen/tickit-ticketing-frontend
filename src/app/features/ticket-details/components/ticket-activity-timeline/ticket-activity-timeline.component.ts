import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, AfterViewInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { TimelineEvent } from "src/app/core/models/ticket-activity.model";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

declare var bootstrap: any;

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
    
    @Output() pageChange = new EventEmitter<number>();
    @Output() filterChange = new EventEmitter<{
        q?: string;
        type?: string;
        username?: string;
        sortField?: string;
        sortDir?: string;
    }>();

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

    constructor(private _formBuilder: FormBuilder) {}

    /**
     * Initialize filter form
     */
    ngOnInit(): void {
        this._initFilterForm();
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
            if (filterCollapseElement && typeof bootstrap !== "undefined" && bootstrap.Collapse) {
                this._createCollapse(filterCollapseElement);
            } else {
                console.warn("Bootstrap JS not loaded or filter collapse element not found");
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
}