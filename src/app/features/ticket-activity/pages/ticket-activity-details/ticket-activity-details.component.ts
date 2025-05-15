import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { TicketActivityService } from "../../../../core/services/ticket-activity/ticket-activity.service";
import { FileUploadModalComponent } from "../../components/file-upload-modal/file-upload-modal.component";
import { TicketActivityDto, AttachmentDto, CommentDto } from "../../../../core/models/ticket-activity.model";

declare var bootstrap: any;
declare var Notify: any;

@Component({
    selector: "app-ticket-activity-details",
    templateUrl: "./ticket-activity-details.component.html",
    styleUrls: ["./ticket-activity-details.component.css"]
})
export class TicketActivityDetailsComponent implements OnInit, AfterViewInit {
    @ViewChild(FileUploadModalComponent) fileUploadModal: FileUploadModalComponent;

    activity: TicketActivityDto;
    comments: CommentDto[] = [];
    attachments: AttachmentDto[] = [];
    loading = false;
    error: string | null = null;
    ticketId: string;
    activityId: string;

    commentFormVisible = false;
    commentForm: FormGroup;
    submittingComment = false;

    // Bootstrap modal and collapse instances
    private _commentFormCollapse: any = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private activityService: TicketActivityService
    ) {
        this.commentForm = this.formBuilder.group({
            text: ["", [Validators.required]]
        });
    }

    ngOnInit(): void {
        this.loading = true;
        this.route.params.subscribe(params => {
            this.ticketId = params["ticketId"];
            this.activityId = params["activityId"];

            this.loadActivityDetails();
            this.loadComments();
        });
    }

    /**
     * Lifecycle hook called after the view is initialized
     * Sets up the file upload modal and other bootstrap components
     */
    ngAfterViewInit(): void {
        this._initBootstrapComponents();
        
        // Add a small delay to ensure ViewChild is available
        setTimeout(() => {
            if (!this.fileUploadModal) {
                console.warn("File upload modal component not found. Check that it's properly included in the template.");
            }
        }, 500);
    }

    /**
     * Initializes Bootstrap components with a small delay to ensure DOM is ready
     */
    private _initBootstrapComponents(): void {
        setTimeout(() => {
            const commentFormCollapseElement = document.getElementById("commentFormCollapse");
            
            if (commentFormCollapseElement && typeof bootstrap !== "undefined" && bootstrap.Collapse) {
                this._createCollapse(commentFormCollapseElement);
            }
            
            // Initialize other bootstrap components here as needed
        }, 100);
    }

    /**
     * Creates a Bootstrap collapse instance
     * @param element - The DOM element to create a collapse for
     */
    private _createCollapse(element: HTMLElement): void {
        try {
            new bootstrap.Collapse(element, {
                toggle: false
            });
        } catch (error) {
            console.error("Error initializing Bootstrap collapse:", error);
        }
    }

    private loadActivityDetails(): void {
        this.activityService.getActivityById(this.ticketId, this.activityId)
            .subscribe({
                next: (activity) => {
                    this.activity = activity;
                    this.loadAttachments();
                    this.loading = false;
                },
                error: (error) => {
                    console.error("Error loading activity:", error);
                    this.error = "Failed to load activity details";
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
                    console.error("Error loading attachments:", error);
                }
            });
    }

    loadComments(): void {
        this.activityService.getActivityComments(this.ticketId, this.activityId)
            .subscribe({
                next: (comments) => {
                    this.comments = comments;
                },
                error: (error) => {
                    console.error("Error loading comments:", error);
                    this._showErrorNotification("Failed to load comments.");
                }
            });
    }

    /**
     * Opens the file upload modal
     */
    onUploadImage(): void {
        if (this.fileUploadModal) {
            this.fileUploadModal.ticketId = this.ticketId;
            this.fileUploadModal.activityId = this.activityId;
            this.fileUploadModal.show();
        } else {
            this._showErrorNotification("File upload component is not available");
            console.error("File upload modal is undefined. Check component initialization.");
        }
    }

    /**
     * Handles file upload completion
     * @param attachments - The newly uploaded attachments
     */
    onUploadComplete(attachments: AttachmentDto[]): void {
        if (attachments && attachments.length > 0) {
            // Add the new attachments to the existing list
            this.attachments = [...attachments, ...this.attachments];
            
            // Show success notification
            this._showSuccessNotification(`Successfully uploaded ${attachments.length} file(s)`);
        }
    }

    onUploadFiles(): void {
        // Navigate to attachments page
    }

    onEditActivity(): void {
        this.router.navigate(["/tickets", this.ticketId, "activities", this.activityId, "edit"]);
    }

    /**
     * Downloads an attachment
     * @param ticketId - The ticket ID
     * @param activityId - The activity ID
     * @param attachmentId - The attachment ID to download
     */
    downloadAttachment(ticketId: string, activityId: string, attachmentId: string): void {
        this.activityService.downloadAttachment(ticketId, activityId, attachmentId).subscribe({
            next: (response) => {
                // Create a Blob URL and trigger download
                const url = window.URL.createObjectURL(response);
                
                // Find the attachment to get the filename
                const attachment = this.attachments.find(a => a.id === Number(attachmentId));
                const filename = attachment ? attachment.filename : "attachment";
                
                // Create a link element and click it to trigger download
                const link = document.createElement("a");
                link.href = url;
                link.download = filename;
                link.click();
                
                // Clean up the URL object
                setTimeout(() => window.URL.revokeObjectURL(url), 100);
            },
            error: (error) => {
                console.error("Error downloading attachment:", error);
                this._showErrorNotification("Failed to download attachment. Please try again.");
            }
        });
    }

    /**
     * Deletes an attachment
     * @param attachmentId - The attachment ID to delete
     */
    deleteAttachment(attachmentId: string): void {
        if (confirm("Are you sure you want to delete this attachment?")) {
            this.activityService.deleteAttachment(this.ticketId, this.activityId, attachmentId).subscribe({
                next: () => {
                    // Remove the deleted attachment from the list
                    this.attachments = this.attachments.filter(a => a.id !== Number(attachmentId));
                    this._showSuccessNotification("Attachment deleted successfully");
                },
                error: (error) => {
                    console.error("Error deleting attachment:", error);
                    this._showErrorNotification("Failed to delete attachment. Please try again.");
                }
            });
        }
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

    /**
     * Toggles the comment form visibility using Bootstrap collapse
     */
    toggleCommentForm(): void {
        const commentFormCollapse = document.getElementById("commentFormCollapse");
        if (commentFormCollapse) {
            // Reset form whenever we toggle
            this.commentForm.reset();
            
            // Update visible state for icon toggling
            this.commentFormVisible = !this.commentFormVisible;
            
            if (typeof bootstrap !== "undefined" && bootstrap.Collapse) {
                const bsCollapse = bootstrap.Collapse.getInstance(commentFormCollapse);
                if (bsCollapse) {
                    bsCollapse.toggle();
                } else {
                    new bootstrap.Collapse(commentFormCollapse);
                }
            } else {
                // Fallback for when Bootstrap JS isn't loaded
                commentFormCollapse.classList.toggle("show");
            }
        }
    }

    /**
     * Add a new comment to the activity
     */
    addComment(): void {
        if (this.commentForm.invalid) {
            return;
        }

        this.submittingComment = true;

        const commentText = this.commentForm.get("text").value;

        this.activityService.addComment(
            this.ticketId, 
            this.activityId, 
            { content: commentText }
        ).subscribe({
            next: (response) => {
                // Add new comment to the list (prepend to show newest first)
                this.comments.unshift(response);
                
                // Reset form
                this.commentForm.reset();
                this.submittingComment = false;
                
                // Hide the form
                this.toggleCommentForm();
                
                this._showSuccessNotification("Comment added successfully");
            },
            error: (error) => {
                console.error("Error adding comment:", error);
                this.submittingComment = false;
                this._showErrorNotification("Failed to add comment. Please try again.");
            }
        });
    }

    /**
     * Shows a success notification using Simple-Notify
     */
    private _showSuccessNotification(message: string): void {
        if (typeof Notify !== "undefined") {
            new Notify({
                status: "success",
                title: "Success",
                text: message,
                effect: "slide",
                speed: 300,
                showIcon: true,
                showCloseButton: true,
                autoclose: true,
                autotimeout: 3000,
                gap: 20,
                distance: 20,
                type: "outline",
                position: "right top"
            });
        } else {
            console.log("Success:", message);
        }
    }

    /**
     * Shows an error notification using Simple-Notify
     */
    private _showErrorNotification(message: string): void {
        if (typeof Notify !== "undefined") {
            new Notify({
                status: "error",
                title: "Error",
                text: message,
                effect: "slide",
                speed: 300,
                showIcon: true,
                showCloseButton: true,
                autoclose: true,
                autotimeout: 5000,
                gap: 20,
                distance: 20,
                type: "outline",
                position: "right top"
            });
        } else {
            console.error("Error:", message);
        }
    }
}
