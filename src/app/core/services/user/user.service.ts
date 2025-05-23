import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface UserResponseDTO {
  email?: string;
  userFingerPrint?: string;
  fingerprint?: string; // Updated field name from userFingerPrint to match backend
  avatarUrl?: string;
  message?: string; // For error messages from the backend
}

export interface UserInfoDTO {
  username: string;
  roles: string[];
  highestRole: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Updated to match the new API version in UserController
  private readonly baseUrl = `${environment.apiUrl}/api/v1/users`;
  
  // Cache the user info to avoid multiple requests
  private userInfoCache$: Observable<UserInfoDTO> | null = null;

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
  
  /**
   * Get detailed user info including roles
   * @returns Observable of UserInfoDTO
   */
  getUserInfo(): Observable<UserInfoDTO> {
    // Return cached response if available
    if (this.userInfoCache$) {
      return this.userInfoCache$;
    }
    
    // Otherwise fetch from API and cache
    this.userInfoCache$ = this.http.get<UserInfoDTO>(`${this.baseUrl}/info`).pipe(
      shareReplay(1),
      catchError(error => {
        console.error('Error fetching user info:', error);
        return throwError({
          message: 'Failed to load user permissions. Please try again later.'
        });
      })
    );
    
    return this.userInfoCache$;
  }
  
  /**
   * Check if current user has admin or direction roles
   * @returns Observable boolean indicating if user has elevated permissions
   */
  hasAdminPermissions(): Observable<boolean> {
    return this.getUserInfo().pipe(
      map(userInfo => {
        const adminRoles = ['ROLE_ADMIN', 'ROLE_DIRECTION'];
        return userInfo.roles.some(role => adminRoles.includes(role.toUpperCase()));
      }),
      catchError(error => {
        console.error('Error checking admin permissions:', error);
        return throwError(false);
      })
    );
  }
  
  /**
   * Check if user can delete a specific comment
   * @param commentUsername Username of the comment author
   * @returns Observable boolean indicating if user can delete the comment
   */
  canDeleteComment(commentUsername: string): Observable<boolean> {
    console.log('Checking if user can delete comment by:', commentUsername);
    return this.getUserInfo().pipe(
      map(userInfo => {
        // User can delete if they are admin/direction or the comment owner
        const adminRoles = ['ROLE_ADMIN', 'ROLE_DIRECTION'];
        const isAdmin = userInfo.roles.some(role => adminRoles.includes(role.toUpperCase()));
        const isCommentOwner = userInfo.username === commentUsername;
        
        return isAdmin || isCommentOwner;
      }),
      catchError(error => {
        console.error('Error checking comment delete permissions:', error);
        return throwError(false);
      })
    );
  }
}



