import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketAssigneeComponent } from './ticket-assignee.component';

describe('TicketAssigneeComponent', () => {
  let component: TicketAssigneeComponent;
  let fixture: ComponentFixture<TicketAssigneeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketAssigneeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketAssigneeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
