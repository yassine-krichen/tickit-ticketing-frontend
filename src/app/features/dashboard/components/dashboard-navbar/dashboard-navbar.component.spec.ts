import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DashboardNavbarComponent } from "./dashboard-navbar.component";
import { UserService } from "src/app/core/services/user/user.service";
import { of, throwError } from "rxjs";
import { NO_ERRORS_SCHEMA } from "@angular/core";

describe("DashboardNavbarComponent", () => {
  let component: DashboardNavbarComponent;
  let fixture: ComponentFixture<DashboardNavbarComponent>;
  let userServiceMock: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    userServiceMock = jasmine.createSpyObj("UserService", ["getCurrentUser"]);
    userServiceMock.getCurrentUser.and.returnValue(of({ 
      fingerprint: "doe.john.developer.frontend" 
    }));

    await TestBed.configureTestingModule({
      declarations: [ DashboardNavbarComponent ],
      providers: [
        { provide: UserService, useValue: userServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignore unknown elements
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should load user data on init", () => {
    expect(userServiceMock.getCurrentUser).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
    expect(component.currentUser).toBeDefined();
  });

  it("should format user name correctly from fingerprint", () => {
    component.currentUser = { fingerprint: "doe.john.developer.frontend" };
    expect(component.getUserName()).toBe("John Doe");
  });

  it("should toggle notification dropdown", () => {
    const event = new MouseEvent("click");
    spyOn(event, "preventDefault");
    spyOn(event, "stopPropagation");
    
    component.toggleNotifications(event);
    expect(component.notificationsOpen).toBeTrue();
    expect(component.userMenuOpen).toBeFalse();
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it("should toggle user menu dropdown", () => {
    const event = new MouseEvent("click");
    spyOn(event, "preventDefault");
    spyOn(event, "stopPropagation");
    
    component.toggleUserMenu(event);
    expect(component.userMenuOpen).toBeTrue();
    expect(component.notificationsOpen).toBeFalse();
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });
});
