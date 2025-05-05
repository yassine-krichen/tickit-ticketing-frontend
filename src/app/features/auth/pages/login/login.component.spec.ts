import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { LoginPageComponent } from "./login.component";
import { AuthService } from "../../../../core/services/auth/auth.service";
import { of, throwError } from "rxjs";
class MockAuthService {
    login = jasmine.createSpy("login");
}

describe("LoginPageComponent", () => {
    let component: LoginPageComponent;
    let fixture: ComponentFixture<LoginPageComponent>;
    let authService: MockAuthService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule],
            declarations: [LoginPageComponent],
            providers: [
                { provide: AuthService, useClass: MockAuthService }
            ]
        }).compileComponents();
        fixture = TestBed.createComponent(LoginPageComponent);
        component = fixture.componentInstance;
        authService = TestBed.inject(AuthService) as any;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should not submit if form is invalid", async () => {
        component.loginForm.setValue({ email: "", password: "" });
        await component.onSubmit();
        expect(authService.login).not.toHaveBeenCalled();
    });
    it("should call AuthService.login on valid form", async () => {
        authService.login.and.returnValue(of({ token: "abc", user: {} }));
        component.loginForm.setValue({ email: "test@example.com", password: "password123" });
        await component.onSubmit();
        expect(authService.login).toHaveBeenCalledWith("test@example.com", "password123");
    });
    it("should set error on login failure", async () => {
        authService.login.and.returnValue(throwError(() => new Error("Login failed")));
        component.loginForm.setValue({ email: "test@example.com", password: "password123" });
        await component.onSubmit();
        expect(component.error).toBe("Login failed");
    });
}); 