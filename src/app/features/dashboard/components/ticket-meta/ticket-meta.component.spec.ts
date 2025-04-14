import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketMetaComponent } from './ticket-meta.component';

describe('TicketMetaComponent', () => {
  let component: TicketMetaComponent;
  let fixture: ComponentFixture<TicketMetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketMetaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketMetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
