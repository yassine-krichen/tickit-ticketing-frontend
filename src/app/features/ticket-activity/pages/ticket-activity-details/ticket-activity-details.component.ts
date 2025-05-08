import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketActivityService } from '../../../../core/services/ticket-activity/ticket-activity.service';
import { FileUploadModalComponent } from '../../components/file-upload-modal/file-upload-modal.component';
import { TicketActivityDto, AttachmentDto, CommentDto } from '../../../../core/models/ticket-activity.model';

@Component({
  selector: 'app-ticket-activity-details',
  templateUrl: './ticket-activity-details.component.html',
  styleUrls: ['./ticket-activity-details.component.css']
})
export class TicketActivityDetailsComponent implements OnInit {
  @ViewChild(FileUploadModalComponent) fileUploadModal: FileUploadModalComponent;

  activity: TicketActivityDto;
  comments: CommentDto[] = [];
  attachments: AttachmentDto[] = [];
  loading = false;
  error: string | null = null;
  ticketId: string;
  activityId: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private activityService: TicketActivityService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.route.params.subscribe(params => {
      this.ticketId = params['ticketId'];
      this.activityId = params['activityId'];

      this.loadActivityDetails();
    });
  }

  private loadActivityDetails(): void {
    this.activityService.getActivityById(this.ticketId, this.activityId)
      .subscribe({
        next: (activity) => {
          this.activity = activity;
          this.loadAttachments();
          this.loadComments();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading activity:', error);
          this.error = 'Failed to load activity details';
          this.loading = false;
        }
      });
  }

  private loadAttachments(): void {
    this.activityService.getActivityAttachments(this.ticketId, this.activityId)
      .subscribe({
        next: (attachments) => {
          this.attachments = attachments;
        },
        error: (error) => {
          console.error('Error loading attachments:', error);
        }
      });
  }

  private loadComments(): void {
    this.activityService.getActivityComments(this.ticketId, this.activityId)
      .subscribe({
        next: (comments) => {
          this.comments = comments;
        },
        error: (error) => {
          console.error('Error loading comments:', error);
        }
      });
  }

  onUploadImage(): void {
    this.fileUploadModal.show();
  }

  onUploadComplete(): void {
    this.loadAttachments(); // Refresh attachments list
  }

  onUploadFiles(): void {
    // Navigate to attachments page
  }

  onEditActivity(): void {
    this.router.navigate(['/tickets', this.ticketId, 'activities', this.activityId, 'edit']);
  }

  downloadAttachment(ticketId: string, activityId: string, attachmentId: string): void {
    this.activityService.downloadAttachment(ticketId, activityId, attachmentId).subscribe({
      next: (response) => {
        // Handle file download
        const url = window.URL.createObjectURL(response);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'attachment'; // You might want to get the filename from response headers
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading attachment:', error);
      }
    });
  }

  formatIsoDuration(isoDuration: string): string {
    if (!isoDuration || isoDuration === "N/A") {
      return "Activity not completed";
    }

    const regex = /^P(?:T)?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/;
    const match = isoDuration.match(regex);

    if (!match) {
      return "Invalid duration format";
    }

    const [, hoursStr, minutesStr, secondsStr] = match;
    const hours = hoursStr ? parseInt(hoursStr, 10) : 0;
    const minutes = minutesStr ? parseInt(minutesStr, 10) : 0;
    const seconds = secondsStr ? Math.round(parseFloat(secondsStr)) : 0;

    const parts: string[] = [];
    if (hours) {
      parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
    }
    if (minutes) {
      parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
    }
    if (seconds) {
      parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);
    }

    return parts.length > 0 ? parts.join(" ") : "0 minutes";
  }
}
