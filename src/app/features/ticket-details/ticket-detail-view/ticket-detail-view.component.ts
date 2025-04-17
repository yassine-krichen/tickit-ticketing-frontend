import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TicketResponse } from '../../../core/models/ticket.model';
import { getPriorityLabel, getStatusLabel, getCaseTypeLabel, formatSLA } from '../../../core/utils/ticket.util';

@Component({
  selector: 'app-ticket-detail-view',
  templateUrl: './ticket-detail-view.component.html',
  styleUrls: ['./ticket-detail-view.component.css']
})
export class TicketDetailViewComponent implements OnInit {
  @Input() ticket: TicketResponse | null = null;
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  onEdit(): void {
    this.edit.emit();
  }

  onDelete(): void {
    if (confirm('Are you sure you want to delete this ticket?')) {
      this.delete.emit();
    }
  }

  getPriorityLabel(priority: string): string {
    return getPriorityLabel(priority);
  }

  getStatusLabel(status: string): string {
    return getStatusLabel(status);
  }

  getCaseTypeLabel(type: string): string {
    return getCaseTypeLabel(type);
  }

  formatSLA(duration: any): string {
    return formatSLA(duration);
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'P1': return 'bg-info text-dark';
      case 'P2': return 'bg-success';
      case 'P3': return 'bg-warning text-dark';
      case 'P4': return 'bg-danger';
      case 'P5': return 'bg-dark';
      default: return 'bg-secondary';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'OPEN': return 'bg-info text-dark';
      case 'IN_PROGRESS': return 'bg-primary';
      case 'BLOCKED': return 'bg-danger';
      case 'RESOLVED': return 'bg-success';
      case 'CLOSED': return 'bg-secondary';
      default: return 'bg-light text-dark';
    }
  }
} 