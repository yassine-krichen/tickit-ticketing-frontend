import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketMetadataComponent } from './ticket-metadata.component';

describe('TicketMetadataComponent', () => {
  let component: TicketMetadataComponent;
  let fixture: ComponentFixture<TicketMetadataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketMetadataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
