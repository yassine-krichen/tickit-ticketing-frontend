import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from "@angular/core";
import { TicketActivityService } from "../../../../core/services/ticket-activity/ticket-activity.service";
import { AttachmentDto } from "../../../../core/models/ticket-activity.model";

/**
 * Modal component for uploading files to ticket activities
 * Supports multiple file uploads, drag & drop, and file previews
 */
@Component({
    selector: "app-file-upload-modal",
    templateUrl: "./file-upload-modal.component.html",
    styleUrls: ["./file-upload-modal.component.css"]
})
export class FileUploadModalComponent {
    @Input() activityId: string;
    @Input() ticketId: string;
    @Output() uploadComplete = new EventEmitter<AttachmentDto[]>();
    @ViewChild("fileInput") fileInput: ElementRef;

    selectedFiles: File[] = [];
    previewUrls: { [key: string]: string } = {};
    uploading = false;
    uploadProgress = 0;
    error: string | null = null;
    isVisible = false;
    dragOver = false;
    
    readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    readonly ALLOWED_TYPES = [
        "image/jpeg", 
        "image/png", 
        "image/gif", 
        "application/pdf", 
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
    ];

    constructor(private activityService: TicketActivityService) {}

    /**
     * Shows the modal
     */
    show(): void {
        this.isVisible = true;
    }

    /**
     * Hides the modal and resets state
     */
    hide(): void {
        this.isVisible = false;
        this.reset();
    }

    /**
     * Handles files dropped into the drop zone
     */
    handleDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.dragOver = false;

        if (event.dataTransfer?.files?.length) {
            this.handleFiles(Array.from(event.dataTransfer.files));
        }
    }

    /**
     * Handles files selected via the file input
     */
    onFilesSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files?.length) {
            this.handleFiles(Array.from(input.files));
        }
    }

    /**
     * Processes multiple files for upload
     */
    private handleFiles(files: File[]): void {
        this.error = null;
        
        for (const file of files) {
            // Validate file type
            if (!this.ALLOWED_TYPES.includes(file.type)) {
                this.error = `File type not supported: ${file.type}`;
                continue;
            }
            
            // Validate file size
            if (file.size > this.MAX_FILE_SIZE) {
                this.error = `File too large: ${file.name} (max size: 10MB)`;
                continue;
            }
            
            // Add valid file
            this.selectedFiles.push(file);
            
            // Generate preview for image files
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = () => {
                    this.previewUrls[file.name] = reader.result as string;
                };
                reader.readAsDataURL(file);
            }
        }
    }

    /**
     * Removes a file from the selected files
     */
    removeFile(index: number): void {
        const file = this.selectedFiles[index];
        this.selectedFiles.splice(index, 1);
        
        if (this.previewUrls[file.name]) {
            delete this.previewUrls[file.name];
        }
    }

    /**
     * Returns the appropriate icon class based on file type
     */
    getFileIconClass(file: File): string {
        if (file.type.startsWith("image/")) {
            return "fa-file-image text-primary";
        } else if (file.type === "application/pdf") {
            return "fa-file-pdf text-danger";
        } else if (file.type === "application/msword" || 
                  file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            return "fa-file-word text-primary";
        } else if (file.type === "text/plain") {
            return "fa-file-alt text-secondary";
        }
        return "fa-file text-secondary";
    }

    /**
     * Uploads all selected files
     */
    uploadFiles(): void {
        if (!this.selectedFiles.length || this.uploading) {
            return;
        }

        this.uploading = true;
        this.error = null;
        this.uploadProgress = 0;

        const formData = new FormData();
        this.selectedFiles.forEach(file => {
            formData.append("files", file);
        });

        // Subscribe to the upload service
        this.activityService.uploadAttachments(this.activityId, formData).subscribe({
            next: (attachments) => {
                this.uploading = false;
                this.uploadProgress = 100;
                this.uploadComplete.emit(attachments);
                
                // Show success message with a slight delay for UX
                setTimeout(() => {
                    this.hide();
                }, 500);
            },
            error: (error) => {
                this.uploading = false;
                this.error = "Failed to upload files. Please try again.";
                console.error("Error uploading files:", error);
            }
        });
    }

    /**
     * Cancels the upload and closes the modal
     */
    cancel(): void {
        this.hide();
    }

    /**
     * Resets the component state
     */
    private reset(): void {
        this.selectedFiles = [];
        this.previewUrls = {};
        this.error = null;
        this.uploading = false;
        this.uploadProgress = 0;
        
        if (this.fileInput) {
            this.fileInput.nativeElement.value = "";
        }
    }

    /**
     * Formats a file size in bytes to a human-readable format
     */
    formatFileSize(bytes: number): string {
        if (bytes === 0) return "0 Bytes";
        
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }
}
