import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "../../../../environments/environment";

export interface LoginResponse {
    token: string;
    user: any;
}

@Injectable({ providedIn: "root" })
export class AuthService {
    private readonly _apiUrl = environment.apiUrl + "/api/v1/auth";
    private readonly _tokenKey = "auth_token";

    constructor(private http: HttpClient) {}

    /**
     * Logs in the user with email and password.
     * @param email User email
     * @param password User password
     */
    login(email: string, password: string): Promise<LoginResponse> {
        const payload = { username: email, password };
        return this.http.post<LoginResponse>(`${this._apiUrl}/signin`, payload)
            .pipe(
                map(res => {
                    this._setToken(res.token);
                    return res;
                }),
                catchError(this._handleError)
            ).toPromise();
    }

    /**
     * Registers a new user.
     * @param data Signup data
     */
    signup(data: { username: string; nom: string; prenom: string; email: string; password: string; idEquipe?: number | 1; telephone?: number | null }): Promise<any> {
        const payload: any = {
            username: data.username,
            nom: data.nom,
            prenom: data.prenom,
            email: data.email,
            password: data.password,
            idEquipe: 1,
            telephone: null
        };
        return this.http.post(`${this._apiUrl}/signup`, payload)
            .pipe(
                map(res => res),
                catchError(this._handleError)
            ).toPromise();
    }



    /**
     * Gets the current auth token
     */
    getToken(): string | null {
        return localStorage.getItem(this._tokenKey);
    }


    /**
     * Sets the auth token
     */
    private _setToken(token: string): void {
        localStorage.setItem(this._tokenKey, token);
    }

    /**
     * Removes the auth token
     */
    logout(): void {
        localStorage.removeItem(this._tokenKey);
    }

    /**
     * Checks if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    /**
     * Handles HTTP errors securely.
     */
    private _handleError(error: HttpErrorResponse) {
        let message = "An error occurred. Please try again.";
        if (error.error && typeof error.error === "string") {
            message = error.error;
        } else if (error.error && error.error.message) {
            message = error.error.message;
        }
        return throwError(() => new Error(message));
    }
}
