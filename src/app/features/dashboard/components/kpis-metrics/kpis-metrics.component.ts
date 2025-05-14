import { Component, Input } from "@angular/core";

interface KpiMetric {
    title: string;
    icon: string;
    colorClass: string;
    value: () => number;
    momPercentage?: number | null; // Month-over-month percentage change
}

@Component({
    selector: "app-kpis-metrics",
    templateUrl: "./kpis-metrics.component.html",
    styleUrls: ["./kpis-metrics.component.css"]
})
export class KpisMetricsComponent {
    @Input() totalTicketsCount: number = 0;
    @Input() inProgressCount: number = 0;
    @Input() blockedCount: number = 0;
    @Input() resolvedCount: number = 0;
    
    // New inputs for MoM percentages
    @Input() totalTicketsMoM: number | null = null;
    @Input() inProgressMoM: number | null = null;
    @Input() blockedMoM: number | null = null;
    @Input() resolvedMoM: number | null = null;

    /**
     * Returns a formatted string for displaying MoM percentage
     * @param value The MoM percentage value
     * @returns Formatted percentage string with + prefix for positive values
     */
    formatMoMPercentage(value: number | null): string {
        if (value === null) return "N/A";
        
        const sign = value > 0 ? "+" : "";
        return `${sign}${value.toFixed(1)}%`;
    }

    /**
     * Determines if the MoM change is positive (success) or negative (danger)
     * For some metrics like 'Blocked', negative change is actually positive
     * @param value The MoM percentage value
     * @param metric The metric name to determine context-specific coloring
     * @returns CSS class for the badge
     */
    getMoMClass(value: number | null, metric: string): string {
        if (value === null) return "text-secondary";
        
        // For exactly 0% change, use neutral gray
        if (value === 0) return "text-secondary";
        
        // For 'Blocked' tickets, decrease is good
        if (metric === "Blocked") {
            return value < 0 ? "text-success" : "text-danger";
        }
        
        // For all other metrics, increase is good
        return value > 0 ? "text-success" : "text-danger";
    }

    /**
     * Gets the appropriate icon for MoM change
     * @param value The MoM percentage value
     * @param metric The metric name
     * @returns FontAwesome icon class
     */
    getMoMIcon(value: number | null, metric: string): string {
        if (value === null) return "fas fa-minus";
        
        // For exactly 0% change, use horizontal icon
        if (value === 0) return "fas fa-equals";
        
        // For 'Blocked' tickets, down arrow is good
        if (metric === "Blocked") {
            return value < 0 ? "fas fa-caret-down" : "fas fa-caret-up";
        }
        
        // For all other metrics, up arrow is good
        return value > 0 ? "fas fa-caret-up" : "fas fa-caret-down";
    }

    kpis: KpiMetric[] = [
        {
            title: "Total Tickets",
            icon: "fas fa-ticket-alt",
            colorClass: "warning",
            value: () => this.totalTicketsCount,
            momPercentage: this.totalTicketsMoM
        },
        {
            title: "In Progress",
            icon: "fas fa-sync-alt",
            colorClass: "success", 
            value: () => this.inProgressCount,
            momPercentage: this.inProgressMoM
        },
        {
            title: "Blocked",
            icon: "fas fa-exclamation-circle",
            colorClass: "danger",
            value: () => this.blockedCount,
            momPercentage: this.blockedMoM
        },
        {
            title: "Resolved",
            icon: "fas fa-check-circle",
            colorClass: "primary",
            value: () => this.resolvedCount,
            momPercentage: this.resolvedMoM
        }
    ];

    /**
     * Updates MoM percentages from input properties
     * This ensures that changes to inputs are reflected in the KPI objects
     */
    ngOnChanges(): void {
        this.kpis[0].momPercentage = this.totalTicketsMoM;
        this.kpis[1].momPercentage = this.inProgressMoM;
        this.kpis[2].momPercentage = this.blockedMoM;
        this.kpis[3].momPercentage = this.resolvedMoM;
    }
}
