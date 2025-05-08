import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AuthRoutingModule } from "./auth.routes";
import { LoginPageComponent } from "./pages/login/login.component";
import { SignupPageComponent } from "./pages/signup/signup.component";
import { LoginFormComponent } from "./components/login-form/login-form.component";
import { SignupFormComponent } from "./components/signup-form/signup-form.component";

@NgModule({
    declarations: [
        LoginPageComponent,
        SignupPageComponent,
        LoginFormComponent,
        SignupFormComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        AuthRoutingModule
    ]
})
export class AuthModule {} 