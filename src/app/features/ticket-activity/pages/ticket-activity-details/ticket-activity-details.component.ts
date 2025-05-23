import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { TicketActivityService } from "../../../../core/services/ticket-activity/ticket-activity.service";
import { FileUploadModalComponent } from "../../components/file-upload-modal/file-upload-modal.component";
import { TicketActivityDto, AttachmentDto, CommentDto } from "../../../../core/models/ticket-activity.model";
import { HttpErrorResponse } from "@angular/common/http";
import { UserService } from "../../../../core/services/user/user.service";
import { forkJoin, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

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
    private _deleteAttachmentModal: any = null;
    private _deleteCommentModal: any = null;
    private _attachmentToDelete: string | null = null;
    private _commentToDelete: string | number | null = null;

    // Add new property to track permissions for each comment
    commentsPermissions: Map<string | number, boolean> = new Map();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private activityService: TicketActivityService,
        private userService: UserService
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
        console.log('[DEBUG] Initializing Bootstrap components');
        
        setTimeout(() => {
            const commentFormCollapseElement = document.getElementById("commentFormCollapse");
            const deleteAttachmentModalElement = document.getElementById("deleteAttachmentModal");
            const deleteCommentModalElement = document.getElementById("deleteCommentModal");
            
            console.log('[DEBUG] Form collapse element found:', !!commentFormCollapseElement);
            console.log('[DEBUG] Attachment modal element found:', !!deleteAttachmentModalElement);
            console.log('[DEBUG] Comment modal element found:', !!deleteCommentModalElement);
            console.log('[DEBUG] Bootstrap available:', typeof bootstrap !== "undefined");
            
            if (commentFormCollapseElement && typeof bootstrap !== "undefined" && bootstrap.Collapse) {
                this._createCollapse(commentFormCollapseElement);
                console.log('[DEBUG] Comment form collapse initialized');
            }
            
            if (deleteAttachmentModalElement && typeof bootstrap !== "undefined" && bootstrap.Modal) {
                this._deleteAttachmentModal = new bootstrap.Modal(deleteAttachmentModalElement);
                console.log('[DEBUG] Delete attachment modal initialized');
            }
            
            if (deleteCommentModalElement && typeof bootstrap !== "undefined" && bootstrap.Modal) {
                this._deleteCommentModal = new bootstrap.Modal(deleteCommentModalElement);
                console.log('[DEBUG] Delete comment modal initialized');
            } else {
                console.warn('[DEBUG] Failed to initialize delete comment modal:', 
                         !deleteCommentModalElement ? 'Element not found' : 
                         typeof bootstrap === "undefined" ? 'Bootstrap not defined' : 
                         !bootstrap.Modal ? 'Bootstrap.Modal not available' : 'Unknown reason');
            }
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

    /**
     * Load comments and their associated permissions
     */
    loadComments(): void {
        console.log('[DEBUG] loadComments called');
        this.loading = true; // Show loading state while fetching comments and permissions
        
        this.activityService.getActivityComments(this.ticketId, this.activityId)
            .subscribe({
                next: (comments) => {
                    console.log(`[DEBUG] Loaded ${comments.length} comments`);
                    
                    // Store comments temporarily
                    const tempComments = comments;
                    
                    if (tempComments.length === 0) {
                        console.log('[DEBUG] No comments to process');
                        // No comments to process, just set empty array and hide loading
                        this.comments = [];
                        this.loading = false;
                        return;
                    }
                    
                    console.log('[DEBUG] Creating permission check observables');
                    // Create an array of observables for permission checks
                    const permissionChecks = tempComments.map(comment => {
                        console.log(`[DEBUG] Creating permission check for comment by: ${comment.username}`);
                        return this.userService.canDeleteComment(comment.username)
                            .pipe(
                                map(canDelete => {
                                    console.log(`[DEBUG] Permission for comment ${comment.id} by ${comment.username}: ${canDelete}`);
                                    return { commentId: comment.id, canDelete };
                            }),
                            catchError((err) => {
                                console.error(`[DEBUG] Error checking permission for comment ${comment.id}:`, err);
                                return of({ commentId: comment.id, canDelete: false });
                            })
                        );
                    });
                    
                    console.log('[DEBUG] Waiting for all permission checks to complete');
                    // Wait for all permission checks to complete
                    forkJoin(permissionChecks).subscribe(results => {
                        console.log('[DEBUG] All permission checks completed:', results);
                        
                        // Populate the permissions map
                        this.commentsPermissions.clear(); // Clear existing permissions first
                        results.forEach(result => {
                            console.log(`[DEBUG] Setting permission for comment ${result.commentId}: ${result.canDelete}`);
                            this.commentsPermissions.set(result.commentId, result.canDelete);
                        });
                        
                        console.log('[DEBUG] Permissions map after update:', 
                            Array.from(this.commentsPermissions.entries()).map(([id, can]) => `${id}: ${can}`).join(', '));
                        
                        // Now that we have all permissions, set the comments and hide loading
                        this.comments = tempComments;
                        this.loading = false;
                    });
                },
                error: (error) => {
                    console.error('[DEBUG] Error loading comments:', error);
                    this._showErrorNotification("Failed to load comments.");
                    this.loading = false;
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
        this._attachmentToDelete = attachmentId;
        
        if (this._deleteAttachmentModal) {
            this._deleteAttachmentModal.show();
        } else {
            // Fallback to confirm dialog if modal isn't available
            if (confirm("Are you sure you want to delete this attachment?")) {
                this.performDeleteAttachment();
            }
        }
    }

    /**
     * Confirms and performs attachment deletion
     */
    confirmDeleteAttachment(): void {
        this.performDeleteAttachment();
        
        if (this._deleteAttachmentModal) {
            this._deleteAttachmentModal.hide();
        }
    }

    /**
     * Performs the actual attachment deletion API call
     */
    private performDeleteAttachment(): void {
        if (!this._attachmentToDelete) return;
        
        this.activityService.deleteAttachment(
            this.ticketId, 
            this.activityId, 
            this._attachmentToDelete
        ).subscribe({
            next: () => {
                // Remove the deleted attachment from the list
                this.attachments = this.attachments.filter(a => a.id !== Number(this._attachmentToDelete));
                this._showSuccessNotification("Attachment deleted successfully");
                this._attachmentToDelete = null;
            },
            error: (error) => {
                console.error("Error deleting attachment:", error);
                this._showErrorNotification("Failed to delete attachment. Please try again.");
                this._attachmentToDelete = null;
            }
        });
    }

    /**
     * Delete a comment after confirmation
     * @param commentId - ID of the comment to delete
     */
    deleteComment(commentId: string, commentUsername: string): void {
        console.log(`[DEBUG] deleteComment called with commentId: ${commentId}, username: ${commentUsername}`);
        
        // First check if user has permission to delete this comment
        this.userService.canDeleteComment(commentUsername)
            .pipe(catchError((error) => {
                console.error('[DEBUG] Error in canDeleteComment:', error);
                return of(false);
            }))
            .subscribe(canDelete => {
                console.log(`[DEBUG] Permission check result for comment ${commentId}: ${canDelete}`);
                
                if (canDelete) {
                    this._commentToDelete = commentId;
                    console.log(`[DEBUG] Setting _commentToDelete: ${this._commentToDelete}`);
                    
                    if (this._deleteCommentModal) {
                        console.log('[DEBUG] Modal exists, showing delete confirmation');
                        this._deleteCommentModal.show();
                    } else {
                        console.warn('[DEBUG] Modal not found, falling back to confirm dialog');
                        if (confirm("Are you sure you want to delete this comment?")) {
                            this.performDeleteComment();
                        }
                    }
                } else {
                    console.log('[DEBUG] Permission denied for deleting comment');
                    this._showErrorNotification(
                        "You don't have permission to delete this comment. Only comment owners or administrators can delete comments."
                    );
                }
            });
    }

    /**
     * Confirm and perform comment deletion
     */
    confirmDeleteComment(): void {
        console.log('[DEBUG] confirmDeleteComment called, _commentToDelete:', this._commentToDelete);
        
        this.performDeleteComment();
        
        if (this._deleteCommentModal) {
            console.log('[DEBUG] Hiding comment deletion modal');
            this._deleteCommentModal.hide();
        } else {
            console.warn('[DEBUG] Modal not found when trying to hide');
        }
    }

    /**
     * Perform the actual API call to delete the comment
     */
    private performDeleteComment(): void {
        if (!this._commentToDelete) {
            console.warn('[DEBUG] performDeleteComment called but _commentToDelete is null/undefined');
            return;
        }
        
        console.log(`[DEBUG] Attempting to delete comment with ID: ${this._commentToDelete}`);
        console.log(`[DEBUG] API parameters - activityId: ${this.activityId}, ticketId: ${this.ticketId}`);
        
        this.activityService.deleteComment(this.activityId, this._commentToDelete, this.ticketId).subscribe({
            next: () => {
                console.log('[DEBUG] Comment deleted successfully');
                
                // Remove the deleted comment from the list
                const previousCount = this.comments.length;
                this.comments = this.comments.filter(c => c.id !== this._commentToDelete);
                console.log(`[DEBUG] Removed comment from list (before: ${previousCount}, after: ${this.comments.length})`);
                
                this._showSuccessNotification("Comment deleted successfully");
                this._commentToDelete = null;
            },
            error: (error: any) => {
                console.log('[DEBUG] Error deleting comment - Full error object:', error);
                console.log('[DEBUG] Error type:', typeof error);
                console.log('[DEBUG] Error keys:', error ? Object.keys(error) : 'No keys (error is null/undefined)');
                console.log('[DEBUG] Error status:', error?.status);
                console.log('[DEBUG] Error message:', error?.message);
                console.log('[DEBUG] Error response:', error?.error);
                
                if (error?.error) {
                    console.log('[DEBUG] Error response body:', error.error);
                }
                
                this._commentToDelete = null;
                
                // Check for 403 in the URL itself since the error object isn't giving us the status
                const responseText = error?.message || error?.toString() || "";
                console.log('[DEBUG] Response text for status check:', responseText);
                
                // Look for any indication of a 403 status
                const is403 = responseText.includes("403") || 
                              (error?.rejection?.status === 403) ||
                              (error?.status === 403);
                
                console.log('[DEBUG] Is 403 error?', is403);
                
                if (is403) {
                    console.log('[DEBUG] Permission denied detected (403)');
                    this._showErrorNotification(
                        "You don't have permission to delete this comment. Only comment owners or administrators can delete comments."
                    );
                } else {
                    console.error('[DEBUG] Other error deleting comment:', error);
                    this._showErrorNotification("Failed to delete comment. Please try again.");
                }
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
                // For new comments, the current user is always the owner
                // So they should have permission to delete their own comment
                this.commentsPermissions.set(response.id, true);
                
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

    /**
     * Add a method to check if a comment can be deleted
     */
    canDeleteComment(commentId: string | number): boolean {
        const canDelete = this.commentsPermissions.get(commentId) || false;
        console.log(`[DEBUG] Checking if can delete comment ${commentId}: ${canDelete}`);
        console.log('[DEBUG] Current permissions map:', 
            Array.from(this.commentsPermissions.entries()).map(([id, can]) => `${id}: ${can}`).join(', '));
        return canDelete;
    }
}
