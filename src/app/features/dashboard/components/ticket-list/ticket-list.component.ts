import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TicketService } from "src/app/core/services/ticket/ticket.service";

@Component({
    selector: "app-ticket-list",
    templateUrl: "./ticket-list.component.html",
    styleUrls: ["./ticket-list.component.css"]
})
export class TicketListComponent implements OnInit {
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

    constructor(
        private ticketService: TicketService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadTickets();
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

    deleteTicket(ticket: any): void {
        if (confirm(`Are you sure you want to delete ticket #${ticket.id}?`)) {
            this.ticketService.deleteTicket(ticket.id).subscribe(
                () => {
                    this.tickets = this.tickets.filter(t => t.id !== ticket.id);
                    this.calculateStatistics();
                },
                error => {
                    console.error("Error deleting ticket:", error);
                    alert("Failed to delete ticket. Please try again.");
                }
            );
        }
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
