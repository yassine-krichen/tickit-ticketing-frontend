import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { AuthService } from "./auth.service";
import { environment } from "../../../../environments/environment";

describe("AuthService", () => {
    let service: AuthService;
    let httpMock: HttpTestingController;
    const apiUrl = environment.apiUrl + "/api/auth";

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AuthService]
        });
        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });

    it("should login successfully", async () => {
        const mockResponse = { token: "jwt", user: { id: 1 } };
        const promise = service.login("test@example.com", "password123");
        const req = httpMock.expectOne(`${apiUrl}/signin`);
        expect(req.request.method).toBe("POST");
        expect(req.request.body).toEqual({ username: "test@example.com", password: "password123" });
        req.flush(mockResponse);
        const result = await promise;
        expect(result).toEqual(mockResponse);
    });

    it("should handle login error", async () => {
        const promise = service.login("fail@example.com", "badpass");
        const req = httpMock.expectOne(`${apiUrl}/signin`);
        req.flush({ message: "Invalid credentials" }, { status: 401, statusText: "Unauthorized" });
        await expectAsync(promise).toBeRejectedWith(jasmine.objectContaining({ message: "Invalid credentials" }));
    });

    it("should signup successfully", async () => {
        const mockResponse = { success: true };
        const data = { fullName: "John Doe", email: "john@example.com", password: "password123" };
        const promise = service.signup(data);
        const req = httpMock.expectOne(`${apiUrl}/signup`);
        expect(req.request.method).toBe("POST");
        expect(req.request.body.username).toBe(data.email);
        expect(req.request.body.nom).toBe("Doe");
        expect(req.request.body.prenom).toBe("John");
        req.flush(mockResponse);
        const result = await promise;
        expect(result).toEqual(mockResponse);
    });

    it("should handle signup error", async () => {
        const data = { fullName: "Jane Doe", email: "jane@example.com", password: "badpass" };
        const promise = service.signup(data);
        const req = httpMock.expectOne(`${apiUrl}/signup`);
        req.flush({ message: "Email already used" }, { status: 400, statusText: "Bad Request" });
        await expectAsync(promise).toBeRejectedWith(jasmine.objectContaining({ message: "Email already used" }));
    });
}); 