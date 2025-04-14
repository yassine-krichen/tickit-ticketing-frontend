import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketCreateUpdateComponent } from './ticket-create-update.component';

describe('TicketCreateUpdateComponent', () => {
  let component: TicketCreateUpdateComponent;
  let fixture: ComponentFixture<TicketCreateUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketCreateUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketCreateUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
