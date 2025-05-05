import { Component, EventEmitter, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../../../../core/services/auth/auth.service";
import { Router } from "@angular/router";

declare const Notify: any;

/**
 * SignupFormComponent handles the signup form UI and logic.
 */
@Component({
  selector: "app-signup-form",
  templateUrl: "./signup-form.component.html",
  styleUrls: ["./signup-form.component.css"]
})
export class SignupFormComponent {
  @Output() signupSuccess = new EventEmitter<void>();
  signupForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.signupForm = this.fb.group({
      username: ["", [Validators.required, Validators.maxLength(50)]],
      nom: ["", [Validators.required, Validators.maxLength(100)]],
      prenom: ["", [Validators.required, Validators.maxLength(100)]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      confirmPassword: ["", [Validators.required]],
      agree: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordsMatch });
  }

  /**
   * Custom validator to check if passwords match.
   */
  private passwordsMatch(form: FormGroup) {
    const password = form.get("password")?.value;
    const confirmPassword = form.get("confirmPassword")?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * Shows a success notification
   */
  private showSuccessNotification(): void {
    new Notify({
      status: "success",
      title: "Registration Successful",
      text: "Your account has been created successfully. Please login to continue.",
      effect: "fade",
      speed: 300,
      customClass: null,
      customIcon: null,
      showIcon: true,
      showCloseButton: true,
      autoclose: true,
      autotimeout: 3000,
      gap: 20,
      distance: 20,
      type: 1,
      position: "right top"
    });
  }

  /**
   * Shows an error notification
   */
  private showErrorNotification(message: string): void {
    new Notify({
      status: "error",
      title: "Registration Failed",
      text: message,
      effect: "fade",
      speed: 300,
      customClass: null,
      customIcon: null,
      showIcon: true,
      showCloseButton: true,
      autoclose: true,
      autotimeout: 3000,
      gap: 20,
      distance: 20,
      type: 1,
      position: "right top"
    });
  }

  /**
   * Handles signup form submission.
   */
  async onSubmit(): Promise<void> {
    this.error = null;
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    try {
      await this.authService.signup({
        username: this.signupForm.value.username.trim(),
        nom: this.signupForm.value.nom.trim(),
        prenom: this.signupForm.value.prenom.trim(),
        email: this.signupForm.value.email.trim(),
        password: this.signupForm.value.password,
        idEquipe: 1,
        telephone: null
      });
      this.signupSuccess.emit();
      this.showSuccessNotification();
      setTimeout(() => {
        this.router.navigate(["/auth/login"]);
      }, 1000);
    } catch (err: any) {
      const errorMessage = err?.message || "Signup failed. Please try again.";
      this.error = errorMessage;
      this.showErrorNotification(errorMessage);
    } finally {
      this.loading = false;
    }
  }
} 