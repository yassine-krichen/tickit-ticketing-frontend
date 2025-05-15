import { NotificationEventService } from './core/services/notification/notification-event.service';
import { Component, OnInit } from "@angular/core";
import { AuthService } from "./core/services/auth/auth.service";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
    title = "TickIT";
    
    constructor(
        private authService: AuthService,
        private notificationEventService: NotificationEventService
    ) {}
    
    ngOnInit(): void {
        // Initialize notification service if user is logged in
        if (this.authService.isAuthenticated()) {
            this.notificationEventService.triggerInitialize();
        }
    }
}
