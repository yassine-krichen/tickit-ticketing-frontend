import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketTreatmentActComponent } from './ticket-treatment-act.component';

describe('TicketTreatmentActComponent', () => {
  let component: TicketTreatmentActComponent;
  let fixture: ComponentFixture<TicketTreatmentActComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketTreatmentActComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketTreatmentActComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
