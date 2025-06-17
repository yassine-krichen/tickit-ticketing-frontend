import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

/**
 * LoginPageComponent handles user login functionality.
 */
@Component({
  selector: 'app-login-page',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginPageComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private titleService: Title
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle('Login | Tickit');
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
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error = err?.message || 'Login failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}
