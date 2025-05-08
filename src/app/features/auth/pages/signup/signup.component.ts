import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../../../../core/services/auth/auth.service";

/**
 * SignupPageComponent handles user registration functionality.
 */
@Component({
    selector: "app-signup-page",
    templateUrl: "./signup.component.html",
    styleUrls: ["./signup.component.css"]
})
export class SignupPageComponent {
    signupForm: FormGroup;
    loading = false;
    error: string | null = null;

    constructor(private fb: FormBuilder, private authService: AuthService) {
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
            // Redirect or handle success
        } catch (err: any) {
            this.error = err?.message || "Signup failed. Please try again.";
        } finally {
            this.loading = false;
        }
    }
} 