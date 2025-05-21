import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { TicketService } from "src/app/core/services/ticket/ticket.service";

declare var bootstrap: any; // Declare bootstrap variable for modal

/**
 * Component for displaying and managing the list of tickets
 */
@Component({
    selector: "app-ticket-list",
    templateUrl: "./ticket-list.component.html",
    styleUrls: ["./ticket-list.component.css"]
})
export class TicketListComponent implements OnInit, OnDestroy {
    // Existing properties
    tickets = [];
    loading = true;
    error = null;
    searchTerm = "";
    activeTab = "All Tickets";
    
    // Statistics
    totalTicketsCount = 0;
    inProgressCount = 0;
    blockedCount = 0;
    resolvedCount = 0;

    // New properties for delete modal
    ticketToDelete: any = null;
    private _deleteModal: any = null;

    constructor(
        private ticketService: TicketService,
        private router: Router
    ) { }

    /**
     * Initialize component and load tickets
     */
    ngOnInit(): void {
        this.loadTickets();
        
        // Initialize modal after DOM is ready
        setTimeout(() => {
            this.initDeleteModal();
        });
    }

    /**
     * Initialize the delete confirmation modal
     */
    private initDeleteModal(): void {
        const modalElement = document.getElementById("deleteTicketModal");
        if (modalElement && typeof bootstrap !== "undefined") {
            this._deleteModal = new bootstrap.Modal(modalElement);
        }
    }

    /**
     * Open delete confirmation modal for a ticket
     * 
     * @param ticket - The ticket to delete
     * @param event - The click event
     */
    deleteTicket(ticket: any, event?: Event): void {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        
        this.ticketToDelete = ticket;
        
        if (this._deleteModal) {
            this._deleteModal.show();
        } else {
            // Fallback to confirm dialog if modal isn't available
            if (confirm(`Are you sure you want to delete ticket #${ticket.id}?`)) {
                this.performDeleteTicket();
            }
        }
    }

    /**
     * Confirm and perform the ticket deletion
     */
    confirmDelete(): void {
        this.performDeleteTicket();
        
        if (this._deleteModal) {
            this._deleteModal.hide();
        }
    }

    /**
     * Perform the actual ticket deletion API call
     */
    private performDeleteTicket(): void {
        if (!this.ticketToDelete) return;
        
        this.ticketService.deleteTicket(this.ticketToDelete.id).subscribe({
            next: () => {
                this.tickets = this.tickets.filter(t => t.id !== this.ticketToDelete.id);
                this.calculateStatistics();
                this.ticketToDelete = null;
            },
            error: error => {
                console.error("Error deleting ticket:", error);
                this.error = "Failed to delete ticket. Please try again.";
            }
        });
    }

    /**
     * Clean up resources
     */
    ngOnDestroy(): void {
        // Clean up modal if needed
        if (this._deleteModal) {
            this._deleteModal.dispose();
        }
    }

    loadTickets(): void {
        this.loading = true;
        this.error = null;
        
        this.ticketService.getAllTickets().subscribe(
            (tickets) => {
                this.tickets = tickets;
                this.calculateStatistics();
                this.loading = false;
            },
            (error) => {
                this.error = "Failed to load tickets. Please try again later.";
                this.loading = false;
                console.error("Error loading tickets:", error);
            }
        );
    }

    calculateStatistics(): void {
        this.totalTicketsCount = this.tickets.length;
        this.inProgressCount = this.tickets.filter(ticket => ticket.status === "IN_PROGRESS").length;
        this.blockedCount = this.tickets.filter(ticket => ticket.status === "BLOCKED").length;
        this.resolvedCount = this.tickets.filter(ticket => ticket.status === "RESOLVED").length;
    }

    onSearchChange(term: string): void {
        this.searchTerm = term;
    }

    setActiveTab(tab: string): void {
        this.activeTab = tab;
    }

    filteredTickets(): any[] {
        let filtered = [...this.tickets];
        
        // Filter by tab (status)
        if (this.activeTab !== "All Tickets") {
            filtered = filtered.filter(ticket => ticket.status === this.activeTab);
        }
        
        // Filter by search term
        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(
                ticket => ticket.title?.toLowerCase().includes(term) || 
                         ticket.id?.toString().includes(term) ||
                         ticket.category?.toLowerCase().includes(term)
            );
        }
        
        return filtered;
    }

    clearFilter(): void {
        this.searchTerm = "";
        this.activeTab = "All Tickets";
    }

    toggleDropdown(event: Event, ticketId: string): void {
        event.stopPropagation();
        const dropdownMenu = document.getElementById(`dropdown-menu-${ticketId}`);
        if (dropdownMenu) {
            dropdownMenu.classList.toggle("show");
        }
    }

    navigateToTicketDetails(ticketId: string): void {
        this.router.navigate(["/ticket-details", ticketId]);
    }
}
