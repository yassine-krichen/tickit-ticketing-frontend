import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketPriorityBadgeComponent } from './ticket-priority-badge.component';

describe('TicketPriorityBadgeComponent', () => {
  let component: TicketPriorityBadgeComponent;
  let fixture: ComponentFixture<TicketPriorityBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketPriorityBadgeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketPriorityBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
