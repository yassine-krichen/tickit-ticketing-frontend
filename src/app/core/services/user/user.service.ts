import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface UserResponseDTO {
  email?: string;
  userFingerPrint?: string;
  fingerprint?: string; // Updated field name from userFingerPrint to match backend
  avatarUrl?: string;
  message?: string; // For error messages from the backend
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Updated to match the new API version in UserController
  private readonly baseUrl = `${environment.apiUrl}/api/v1/users`;

  constructor(private http: HttpClient) { }

  /**
   * Get the current user's profile
   * @returns Observable of UserResponseDTO
   */
  getCurrentUser(): Observable<UserResponseDTO> {
    return this.http.get<UserResponseDTO>(`${this.baseUrl}/me`).pipe(
      map((user: UserResponseDTO) => {
        if (!user.avatarUrl || user.avatarUrl === 'No Photo Available') {
          user.avatarUrl = 'assets/images/avatars/DefaultAvatar.png';
        }
        return user;
      }),
      catchError(error => {
        console.error('Error fetching user data:', error);
        return Observable.throw({
          message: 'Failed to load user profile. Please try again later.'
        });
      })
    );
  }
}



