import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginPageComponent } from "./pages/login/login.component";
import { SignupPageComponent } from "./pages/signup/signup.component";

const routes: Routes = [
    { path: "login", component: LoginPageComponent },
    { path: "signup", component: SignupPageComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthRoutingModule {} 