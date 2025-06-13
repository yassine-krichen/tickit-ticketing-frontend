import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { AuthService } from "../services/auth/auth.service";
import { Router } from "@angular/router";

/**
 * Interceptor that adds authentication token to outgoing requests
 * and handles authentication errors (401)
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService, private router: Router) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.authService.getToken();

        if (token) {
            req = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        return next.handle(req).pipe(
            catchError((error: any) => {
                // Check if error is HttpErrorResponse
                if (error instanceof HttpErrorResponse) {
                    if (error.status === 401) {
                        console.log("Authentication error:", error.message);
                        this.authService.logout();
                        this.router.navigate(["/auth/login"]);
                    }
                    return throwError(() => error);
                }

                // For non-HTTP errors, create a proper error object
                return throwError(() => new Error(error.message || 'An unknown error occurred'));
            })
        );
    }
}
