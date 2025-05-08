import { Component, EventEmitter, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../../../../core/services/auth/auth.service";
import { Router } from "@angular/router";

/**
 * LoginFormComponent handles the login form UI and logic.
 */
@Component({
  selector: "app-login-form",
  templateUrl: "./login-form.component.html",
  styleUrls: ["./login-form.component.css"]
})
export class LoginFormComponent {
  @Output() loginSuccess = new EventEmitter<void>();
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ["", [Validators.required]],
      password: ["", [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Handles login form submission.
   */
  async onSubmit(): Promise<void> {
    this.error = null;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    try {
      const sanitizedUsername = this.loginForm.value.username.trim();
      const sanitizedPassword = this.loginForm.value.password;
      await this.authService.login(sanitizedUsername, sanitizedPassword);
      this.loginSuccess.emit();
      this.router.navigate(["/dashboard"]);
    } catch (err: any) {
      this.error = err?.message || "Login failed. Please try again.";
    } finally {
      this.loading = false;
    }
  }
} 