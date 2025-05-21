import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { NotificationsRoutingModule } from "./notifications-routing.module";
import { NotificationsPageComponent } from "./pages/notifications-page/notifications-page.component";
import { NotificationListComponent } from "./components/notification-list/notification-list.component";
import { NotificationItemComponent } from "./components/notification-item/notification-item.component";
import { NotificationFiltersComponent } from "./components/notification-filters/notification-filters.component";
import { SharedModule } from "../../shared/shared.module";
import { CoreModule } from "src/app/core/core.module";

@NgModule({
    declarations: [
        NotificationsPageComponent,
        NotificationListComponent,
        NotificationItemComponent,
        NotificationFiltersComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        NotificationsRoutingModule,
        SharedModule,
        CoreModule
    ],
    exports: [
        NotificationsPageComponent,
        NotificationListComponent,
        NotificationItemComponent,
        NotificationFiltersComponent
    ],
})
export class NotificationsModule { }