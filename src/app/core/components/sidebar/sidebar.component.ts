import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth/auth.service';
import { UserResponseDTO, UserService } from '../../services/user/user.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
    user: UserResponseDTO | null = null;
    loading: boolean = true;
    error: string | null = null;

    activeItem: string = 'dashboard';

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }

  setActiveItem(item: string): void {
    this.activeItem = item;
  }

  toggleTheme(): void {
    document.body.classList.toggle('dark-mode');
  }



    // Extract username from fingerprint for display purposes
    get userName(): string {
        if (!this.user?.fingerprint) return 'User';

        // Fingerprint format is expected to be: lastName.firstName.role.team
        const parts = this.user.fingerprint.split('.');
        if (parts.length >= 2) {
            // Capitalize first letters and combine first and last name
            return this.capitalize(parts[1]) + ' ' + this.capitalize(parts[0]);
        }
        return 'User';
    }

    // Extract role from fingerprint
    get userRole(): string {
        if (!this.user?.fingerprint) return 'User';

        const parts = this.user.fingerprint.split('.');
        if (parts.length >= 3) {
            return this.capitalize(parts[2]);
        }
        return 'User';
    }

    constructor(
        private router: Router,
        private authService: AuthService,
        private userService: UserService,
        private translate: TranslateService
    ) {
      // Set the default language
    translate.setDefaultLang('en');
    // Use default language
    translate.use('en');
    }

    ngOnInit(): void {
        this.loadUserData();
    }

    private loadUserData(): void {
        this.loading = true;
        this.userService.getCurrentUser().subscribe({
            next: (userData) => {
                this.user = userData;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading user data:', err);
                this.error = 'Failed to load user profile';
                this.loading = false;
            }
        });
    }

    // Helper method to capitalize first letter
    private capitalize(str: string): string {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(["/auth/login"]);
    }
}

