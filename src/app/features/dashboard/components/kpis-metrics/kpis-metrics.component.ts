import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-kpis-metrics',
  templateUrl: './kpis-metrics.component.html',
  styleUrls: ['./kpis-metrics.component.css']
})
export class KpisMetricsComponent {
  @Input() totalTicketsCount: number = 0;
  @Input() inProgressCount: number = 0;
  @Input() blockedCount: number = 0;
  @Input() resolvedCount: number = 0;

  kpis = [
    {
      title: 'Total Tickets',
      icon: 'fas fa-ticket-alt',
      colorClass: 'warning',
      value: () => this.totalTicketsCount
    },
    {
      title: 'In Progress',
      icon: 'fas fa-sync-alt',
      colorClass: 'success',
      value: () => this.inProgressCount
    },
    {
      title: 'Blocked',
      icon: 'fas fa-exclamation-circle',
      colorClass: 'danger',
      value: () => this.blockedCount
    },
    {
      title: 'Resolved',
      icon: 'fas fa-check-circle',
      colorClass: 'primary',
      value: () => this.resolvedCount
    }
  ];
}
