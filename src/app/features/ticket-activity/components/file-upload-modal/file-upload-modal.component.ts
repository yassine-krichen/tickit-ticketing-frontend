import { Component, Input, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { TicketActivityService } from '../../../../core/services/ticket-activity/ticket-activity.service';

@Component({
  selector: 'app-file-upload-modal',
  templateUrl: './file-upload-modal.component.html',
  styleUrls: ['./file-upload-modal.component.css']
})
export class FileUploadModalComponent {
  @Input() activityId: string;
  @Output() uploadComplete = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput: ElementRef;

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploading = false;
  error: string | null = null;
  isVisible = false;
  dragOver = false;

  constructor(private activityService: TicketActivityService) {}

  show(): void {
    this.isVisible = true;
  }

  hide(): void {
    this.isVisible = false;
    this.reset();
  }

  handleDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    this.selectedFile = file;
    this.error = null;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.previewUrl = null;
    }
  }

  uploadFile(): void {
    if (!this.selectedFile || this.uploading) return;

    this.uploading = true;
    this.error = null;

    const formData = new FormData();
    formData.append('files', this.selectedFile);

    this.activityService.uploadAttachments(this.activityId, formData).subscribe({
      next: () => {
        this.uploading = false;
        this.uploadComplete.emit();
        this.hide();
      },
      error: (error) => {
        this.uploading = false;
        this.error = 'Failed to upload file. Please try again.';
        console.error('Error uploading file:', error);
      }
    });
  }

  cancel(): void {
    this.hide();
  }

  private reset(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.error = null;
    this.uploading = false;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
