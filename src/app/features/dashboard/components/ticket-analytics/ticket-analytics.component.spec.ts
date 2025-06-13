import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketAnalyticsComponent } from './ticket-analytics.component';

describe('TicketAnalyticsComponent', () => {
  let component: TicketAnalyticsComponent;
  let fixture: ComponentFixture<TicketAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketAnalyticsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
