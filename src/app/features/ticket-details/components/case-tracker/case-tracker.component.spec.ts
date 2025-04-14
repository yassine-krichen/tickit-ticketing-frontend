import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseTrackerComponent } from './case-tracker.component';

describe('CaseTrackerComponent', () => {
  let component: CaseTrackerComponent;
  let fixture: ComponentFixture<CaseTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaseTrackerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
