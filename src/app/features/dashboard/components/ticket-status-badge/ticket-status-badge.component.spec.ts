import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketStatusBadgeComponent } from './ticket-status-badge.component';

describe('TicketStatusBadgeComponent', () => {
  let component: TicketStatusBadgeComponent;
  let fixture: ComponentFixture<TicketStatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketStatusBadgeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketStatusBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
