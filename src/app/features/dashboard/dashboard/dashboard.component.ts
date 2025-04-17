import { Component, OnInit } from '@angular/core';
import { TicketCount, TicketResponse } from '../../../core/models/ticket.model';
import { TicketService } from '../../../core/services/ticket/ticket.service';
import { getCaseTypeLabel, getPriorityLabel, getStatusLabel } from '../../../core/utils/ticket.util';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  tickets: TicketResponse[] = [];
  statusCounts: TicketCount[] = [];
  typeCounts: TicketCount[] = [];
  stepCounts: TicketCount[] = [];
  subStatusCounts: TicketCount[] = [];
  periodStats: Record<string, number> = {};
  selectedPeriod = 'weekly';

  constructor(private ticketService: TicketService) { }

  ngOnInit(): void {
    this.loadAllTickets();
    this.loadStatusCounts();
    this.loadTypeCounts();
    this.loadStepCounts();
    this.loadSubStatusCounts();
    this.loadStatsByPeriod(this.selectedPeriod);
  }

  loadAllTickets(): void {
    this.ticketService.getAllTickets().subscribe(
      data => {
        this.tickets = data;
      },
      error => {
        console.error('Error loading tickets:', error);
      }
    );
  }

  loadStatusCounts(): void {
    this.ticketService.getTicketCountsByStatus().subscribe(
      data => {
        this.statusCounts = data;
      },
      error => {
        console.error('Error loading status counts:', error);
      }
    );
  }

  loadTypeCounts(): void {
    this.ticketService.getTicketCountsByType().subscribe(
      data => {
        this.typeCounts = data;
      },
      error => {
        console.error('Error loading type counts:', error);
      }
    );
  }

  loadStepCounts(): void {
    this.ticketService.getTicketCountsByStep().subscribe(
      data => {
        this.stepCounts = data;
      },
      error => {
        console.error('Error loading step counts:', error);
      }
    );
  }

  loadSubStatusCounts(): void {
    this.ticketService.getTicketCountsBySubStatus().subscribe(
      data => {
        this.subStatusCounts = data;
      },
      error => {
        console.error('Error loading subStatus counts:', error);
      }
    );
  }

  loadStatsByPeriod(period: string): void {
    this.selectedPeriod = period;
    this.ticketService.getTicketStatsByPeriod(period).subscribe(
      data => {
        this.periodStats = data as any;
      },
      error => {
        console.error(`Error loading ${period} stats:`, error);
      }
    );
  }

  getTotalTickets(): number {
    if (this.statusCounts.length > 0) {
      return this.statusCounts.reduce((sum, item) => sum + item.count, 0);
    }
    return this.tickets.length;
  }

  getTicketCountByStatus(status: string): number {
    const found = this.statusCounts.find(item => item.category === status);
    return found ? found.count : 0;
  }

  getTicketCountByPriority(priority: string): number {
    // In real implementation, you would have priority counts from backend
    return this.tickets.filter(ticket => ticket.priority === priority).length;
  }

  calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  calculateResolutionRate(): number {
    const created = this.periodStats?.created || 0;
    const resolved = this.periodStats?.resolved || 0;
    
    if (created === 0) return 0;
    return Math.round((resolved / created) * 100);
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'P1': return 'bg-info';
      case 'P2': return 'bg-success';
      case 'P3': return 'bg-warning';
      case 'P4': return 'bg-danger';
      case 'P5': return 'bg-dark';
      default: return 'bg-secondary';
    }
  }

  // Utility methods for templates
  getStatusLabel(status: string): string {
    return getStatusLabel(status);
  }

  getPriorityLabel(priority: string): string {
    return getPriorityLabel(priority);
  }

  getCaseTypeLabel(type: string): string {
    return getCaseTypeLabel(type);
  }
} 