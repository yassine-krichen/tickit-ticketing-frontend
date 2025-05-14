import { Component, AfterViewInit, OnInit, ElementRef, Renderer2 } from "@angular/core";
import { UserService, UserResponseDTO } from "src/app/core/services/user/user.service";

/**
 * Navbar component for the dashboard displaying user info and notification controls
 */
@Component({
    selector: "app-dashboard-navbar",
    templateUrl: "./dashboard-navbar.component.html",
    styleUrls: ["./dashboard-navbar.component.css"]
})
export class DashboardNavbarComponent implements OnInit, AfterViewInit {
    /**
     * Current user data
     */
    currentUser: UserResponseDTO = {};
    
    /**
     * Loading state for user data
     */
    loading = true;
    
    /**
     * Error message if user data fetch fails
     */
    errorMessage = "";

    /**
     * Track dropdown states
     */
    notificationsOpen = false;
    userMenuOpen = false;

    /**
     * Constructor for the DashboardNavbarComponent
     * @param userService - Service to fetch user data
     * @param renderer - Renderer2 for DOM manipulation
     * @param elementRef - Reference to component's host element
     */
    constructor(
        private userService: UserService,
        private renderer: Renderer2,
        private elementRef: ElementRef
    ) { }

    /**
     * Lifecycle hook that is called after data-bound properties are initialized
     */
    ngOnInit(): void {
        this._loadUserData();
        this._setupClickOutsideListener();
    }

    /**
     * After view is initialized
     */
    ngAfterViewInit(): void {
        // No longer needed as we're using CSS dropdowns
    }

    /**
     * Format user name from fingerprint if available
     * @returns Formatted user name or default text
     */
    getUserName(): string {
        if (!this.currentUser) {
            return "User";
        }
        
        const fingerprint = this.currentUser.fingerprint || this.currentUser.userFingerPrint;
        
        if (fingerprint) {
            const parts = fingerprint.split(".");
            if (parts.length >= 2) {
                // Format as "Firstname Lastname"
                return `${this._capitalizeFirst(parts[1])} ${this._capitalizeFirst(parts[0])}`;
            }
        }
        
        // Fallback to email if no fingerprint
        return this.currentUser.email ? this.currentUser.email.split("@")[0] : "User";
    }


    getUserRole(): string {
        if (!this.currentUser) {
            return "User";
        }

        const fingerprint = this.currentUser.fingerprint || this.currentUser.userFingerPrint;
        if (fingerprint) {  
            const parts = fingerprint.split(".");
            if (parts.length >= 3) {
                // Format as "Firstname Lastname"
                return this._capitalizeFirst(parts[2]);
            }
        }
        
        return "User";
    }

    /**
     * Toggle notifications dropdown
     */
    toggleNotifications(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.notificationsOpen = !this.notificationsOpen;
        this.userMenuOpen = false; // Close other dropdown
    }

    /**
     * Toggle user menu dropdown
     */
    toggleUserMenu(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.userMenuOpen = !this.userMenuOpen;
        this.notificationsOpen = false; // Close other dropdown
    }

    /**
     * Close all dropdowns
     */
    closeDropdowns(): void {
        this.notificationsOpen = false;
        this.userMenuOpen = false;
    }

    /**
     * Set up click outside listener to close dropdowns
     * @private
     */
    private _setupClickOutsideListener(): void {
        this.renderer.listen("document", "click", (event: Event) => {
            const clickedInside = this.elementRef.nativeElement.contains(event.target);
            if (!clickedInside) {
                this.closeDropdowns();
            }
        });
    }
    
    /**
     * Load current user data from API
     * @private
     */
    private _loadUserData(): void {
        this.loading = true;
        this.userService.getCurrentUser().subscribe({
            next: (user) => {
                this.currentUser = user;
                this.loading = false;
            },
            error: (err) => {
                console.error("Error loading user data:", err);
                this.errorMessage = "Failed to load user profile";
                this.loading = false;
            }
        });
    }
    
    /**
     * Helper method to capitalize the first letter of a string
     * @param str Input string
     * @returns String with first letter capitalized
     * @private
     */
    private _capitalizeFirst(str: string): string {
        if (!str || str.length === 0) {
            return "";
        }
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
}
