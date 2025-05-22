import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { TicketActivityService } from "../../../../core/services/ticket-activity/ticket-activity.service";

declare var bootstrap: any;

@Component({
    selector: "app-activity-comments",
    templateUrl: "./activity-comments.component.html",
    styleUrls: ["./activity-comments.component.css"]
})
export class ActivityCommentsComponent implements OnInit, AfterViewInit {
    @Input() activityId: string;
    @Input() ticketId: string;
    @Input() comments: any[] = [];
    @Output() commentAdded = new EventEmitter<void>();

    showCommentForm = false;
    commentForm: FormGroup;
    submitting = false;
    error: string | null = null;
    
    // Properties for delete confirmation modal
    private _deleteModal: any = null;
    private _commentToDelete: string | null = null;

    constructor(
        private fb: FormBuilder,
        private activityService: TicketActivityService
    ) {
        this.commentForm = this.fb.group({
            content: ["", [Validators.required, Validators.minLength(1)]]
        });
    }

    ngOnInit(): void {
        // Initialization logic
    }

    ngAfterViewInit(): void {
        // Initialize Bootstrap modal
        setTimeout(() => {
            this.initDeleteModal();
        }, 100);
    }

    /**
     * Initialize the delete confirmation modal
     */
    private initDeleteModal(): void {
        const modalElement = document.getElementById("deleteCommentModal");
        if (modalElement && typeof bootstrap !== "undefined" && bootstrap.Modal) {
            this._deleteModal = new bootstrap.Modal(modalElement);
        }
    }

    /**
     * Check if form is valid
     */
    get isFormValid(): boolean {
        return this.commentForm.valid && this.commentForm.get("content")?.value?.trim().length > 0;
    }

    /**
     * Submit a new comment
     */
    onSubmit(): void {
        if (this.isFormValid && !this.submitting) {
            this.submitting = true;
            this.error = null;

            this.activityService.addComment(
                this.ticketId,
                this.activityId,
                this.commentForm.value
            ).subscribe({
                next: () => {
                    this.submitting = false;
                    this.commentForm.reset();
                    this.commentAdded.emit();
                },
                error: (error) => {
                    this.submitting = false;
                    this.error = "Failed to add comment. Please try again.";
                    console.error("Error adding comment:", error);
                }
            });
        }
    }

    /**
     * Open delete confirmation modal for a comment
     * @param commentId - ID of the comment to delete
     */
    deleteComment(commentId: string): void {
        this._commentToDelete = commentId;
        
        if (this._deleteModal) {
            this._deleteModal.show();
        } else {
            // Fallback to browser confirm if modal isn't available
            if (confirm("Are you sure you want to delete this comment?")) {
                this.performDeleteComment();
            }
        }
    }

    /**
     * Confirm and perform comment deletion
     */
    confirmDeleteComment(): void {
        this.performDeleteComment();
        
        if (this._deleteModal) {
            this._deleteModal.hide();
        }
    }

    /**
     * Perform the actual API call to delete the comment
     */
    private performDeleteComment(): void {
        if (!this._commentToDelete) return;
        
        this.activityService.deleteComment(this.activityId, this._commentToDelete).subscribe({
            next: () => {
                this.commentAdded.emit();
                this._commentToDelete = null;
            },
            error: (error) => {
                this.error = "Failed to delete comment";
                console.error("Error deleting comment:", error);
                this._commentToDelete = null;
            }
        });
    }
}
