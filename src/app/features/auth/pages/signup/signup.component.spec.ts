import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { SignupPageComponent } from "./signup.component";
import { AuthService } from "../../../../core/services/auth/auth.service";

class MockAuthService {
    signup = jasmine.createSpy().and.returnValue(Promise.resolve({}));
}

describe("SignupPageComponent", () => {
    let component: SignupPageComponent;
    let fixture: ComponentFixture<SignupPageComponent>;
    let authService: MockAuthService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule],
            declarations: [SignupPageComponent],
            providers: [
                { provide: AuthService, useClass: MockAuthService }
            ]
        }).compileComponents();
        fixture = TestBed.createComponent(SignupPageComponent);
        component = fixture.componentInstance;
        authService = TestBed.inject(AuthService) as any;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should not submit if form is invalid", async () => {
        component.signupForm.setValue({ fullName: "", email: "", password: "", confirmPassword: "", agree: false });
        await component.onSubmit();
        expect(authService.signup).not.toHaveBeenCalled();
    });

    it("should call AuthService.signup on valid form", async () => {
        component.signupForm.setValue({ fullName: "John Doe", email: "john@example.com", password: "password123", confirmPassword: "password123", agree: true });
        await component.onSubmit();
        expect(authService.signup).toHaveBeenCalled();
    });

    it("should set error on signup failure", async () => {
        authService.signup.and.returnValue(Promise.reject(new Error("Signup failed")));
        component.signupForm.setValue({ fullName: "John Doe", email: "john@example.com", password: "password123", confirmPassword: "password123", agree: true });
        await component.onSubmit();
        expect(component.error).toBe("Signup failed");
    });
}); 