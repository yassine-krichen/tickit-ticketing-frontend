import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { AuthService } from "../../services/auth/auth.service";
import { UserResponseDTO, UserService } from "../../services/user/user.service";

/**
 * Sidebar component providing navigation and user controls
 */
@Component({
    selector: "app-sidebar",
    templateUrl: "./sidebar.component.html",
    styleUrls: ["./sidebar.component.css"]
})
export class SidebarComponent implements OnInit {
    /**
     * Current user data
     */
    user: UserResponseDTO | null = null;
    
    /**
     * Loading state for user data
     */
    loading: boolean = true;
    
    /**
     * Error message if user data fetch fails
     */
    error: string | null = null;

    /**
     * Currently active navigation item
     */
    activeItem: string = "dashboard";
    
    /**
     * Track which dropdown is currently open (if any)
     */
    openDropdown: string | null = null;

    /**
     * Extract username from fingerprint for display purposes
     */
    get userName(): string {
        if (!this.user?.fingerprint) return "User";

        // Fingerprint format is expected to be: lastName.firstName.role.team
        const parts = this.user.fingerprint.split(".");
        if (parts.length >= 2) {
            // Capitalize first letters and combine first and last name
            return this.capitalize(parts[1]) + " " + this.capitalize(parts[0]);
        }
        return "User";
    }

    /**
     * Extract role from fingerprint
     */
    get userRole(): string {
        if (!this.user?.fingerprint) return "User";

        const parts = this.user.fingerprint.split(".");
        if (parts.length >= 3) {
            return this.capitalize(parts[2]);
        }
        return "User";
    }

    /**
     * Constructor for SidebarComponent
     */
    constructor(
        private router: Router,
        private authService: AuthService,
        private userService: UserService,
        private translate: TranslateService
    ) {
        // Set the default language
        translate.setDefaultLang("en");
        // Use default language
        translate.use("en");
    }

    /**
     * Initialize component
     */
    ngOnInit(): void {
        this.loadUserData();
        this.initializeActiveItem();
    }

    /**
     * Set initial active item based on current route
     */
    private initializeActiveItem(): void {
        const currentUrl = this.router.url;
        
        if (currentUrl.includes("/dashboard/tickets")) {
            this.activeItem = "tickets";
            this.openDropdown = "dashboard";
        } else if (currentUrl.includes("/dashboard/analytics")) {
            this.activeItem = "analytics";
            this.openDropdown = "dashboard";
        } else if (currentUrl.includes("/dashboard/ai-insights")) {
            this.activeItem = "ai-insights";
            this.openDropdown = "dashboard";
        } else if (currentUrl.includes("/dashboard")) {
            this.activeItem = "dashboard";
        } else if (currentUrl.includes("/ticket-create-update/ticket/new")) {
            this.activeItem = "create-ticket";
        } else if (currentUrl.includes("/notifications")) {
            this.activeItem = "notifications";
        }
    }

    /**
     * Toggle dropdown for a specific navitem
     * @param item - The navigation item identifier
     */
    toggleDropdown(item: string): void {
        if (this.openDropdown === item) {
            this.openDropdown = null;
        } else {
            this.openDropdown = item;
        }
    }

    /**
     * Set active navigation item
     * @param item - The navigation item identifier
     */
    setActiveItem(item: string): void {
        this.activeItem = item;
    }

    /**
     * Log out the current user
     */
    logout(): void {
        this.authService.logout();
        this.router.navigate(["/auth/login"]);
    }

    /**
     * Load current user data from API
     */
    private loadUserData(): void {
        this.loading = true;
        this.userService.getCurrentUser().subscribe({
            next: (userData) => {
                this.user = userData;
                this.loading = false;
            },
            error: (err) => {
                console.error("Error loading user data:", err);
                this.error = "Failed to load user profile";
                this.loading = false;
            }
        });
    }

    /**
     * Helper method to capitalize first letter
     * @param str - Input string
     * @returns String with first letter capitalized
     */
    private capitalize(str: string): string {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

