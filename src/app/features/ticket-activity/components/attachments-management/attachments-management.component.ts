import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TicketActivityService } from '../../../../core/services/ticket-activity/ticket-activity.service';

@Component({
  selector: 'app-attachments-management',
  templateUrl: './attachments-management.component.html',
  styleUrls: ['./attachments-management.component.css']
})
export class AttachmentsManagementComponent implements OnInit {
  activityId: string;
  ticketId: string;
  attachments: any[] = [];
  activeTab = 'list'; // 'list' or 'upload'
  dragOver = false;
  uploading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private activityService: TicketActivityService
  ) {}

  ngOnInit(): void {
    this.activityId = this.route.snapshot.paramMap.get('activityId');
    this.ticketId = this.route.snapshot.paramMap.get('ticketId');
    this.loadAttachments();
  }

  loadAttachments(): void {
    this.activityService.getActivityAttachments(this.ticketId, this.activityId).subscribe({
      next: (attachments) => {
        this.attachments = attachments;
      },
      error: (error) => {
        console.error('Error loading attachments:', error);
        this.error = 'Failed to load attachments';
      }
    });
  }

  onTabChange(tab: string): void {
    this.activeTab = tab;
    this.error = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.uploadFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files?.length) {
      this.uploadFiles(Array.from(files));
    }
  }

  uploadFiles(files: File[]): void {
    this.uploading = true;
    this.error = null;

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    this.activityService.uploadAttachments(this.activityId, formData).subscribe({
      next: () => {
        this.uploading = false;
        this.loadAttachments();
        this.activeTab = 'list';
      },
      error: (error) => {
        this.uploading = false;
        this.error = 'Failed to upload files. Please try again.';
        console.error('Error uploading files:', error);
      }
    });
  }

  downloadAttachment(attachmentId: string, filename: string): void {
    this.activityService.downloadAttachment(this.ticketId,this.activityId, attachmentId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading attachment:', error);
        this.error = 'Failed to download file';
      }
    });
  }

  deleteAttachment(attachmentId: string): void {
    if (confirm('Are you sure you want to delete this attachment?')) {
      this.activityService.deleteAttachment(this.ticketId, this.activityId, attachmentId).subscribe({
        next: () => {
          this.loadAttachments();
        },
        error: (error) => {
          console.error('Error deleting attachment:', error);
          this.error = 'Failed to delete attachment';
        }
      });
    }
  }
}
