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
            catchError((error: HttpErrorResponse) => {
                // Only handle 401 errors (unauthorized), pass through all other errors
                if (error.status === 401) {
                    console.log("Authentication error:", error.message);
                    
                    // Clear the token and disconnect WebSocket
                    this.authService.logout();
                    
                    // Redirect to login page
                    this.router.navigate(["/auth/login"]);
                }
                
                // Return the original HttpErrorResponse to preserve its type
                return throwError(() => error);
            })
        );
    }
}