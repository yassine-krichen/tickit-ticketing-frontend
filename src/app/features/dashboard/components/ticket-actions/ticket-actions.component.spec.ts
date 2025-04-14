import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketActionsComponent } from './ticket-actions.component';

describe('TicketActionsComponent', () => {
  let component: TicketActionsComponent;
  let fixture: ComponentFixture<TicketActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketActionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
