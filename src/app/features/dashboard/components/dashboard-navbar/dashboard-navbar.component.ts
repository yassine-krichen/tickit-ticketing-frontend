import { Component, AfterViewInit } from "@angular/core";

declare var bootstrap: any;

/**
 * Navbar component for the dashboard displaying user info and notification controls
 */
@Component({
    selector: "app-dashboard-navbar",
    templateUrl: "./dashboard-navbar.component.html",
    styleUrls: ["./dashboard-navbar.component.css"]
})
export class DashboardNavbarComponent implements AfterViewInit {
    /**
     * Constructor for the DashboardNavbarComponent
     */
    constructor() { }

    /**
     * Initialize Bootstrap components after view is initialized
     */
    ngAfterViewInit(): void {
        this._initializeDropdowns();
    }

    /**
     * Initialize Bootstrap dropdowns for notifications and user menu
     * @private
     */
    private _initializeDropdowns(): void {
        // Ensure Bootstrap JS is loaded
        if (typeof bootstrap !== "undefined") {
            // Initialize all dropdowns on the page
            const dropdownElementList = document.querySelectorAll(".dropdown-toggle");
            dropdownElementList.forEach(dropdownToggleEl => {
                new bootstrap.Dropdown(dropdownToggleEl);
            });
        }
    }
}
