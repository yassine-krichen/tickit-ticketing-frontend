import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpisMetricsComponent } from './kpis-metrics.component';

describe('KpisMetricsComponent', () => {
  let component: KpisMetricsComponent;
  let fixture: ComponentFixture<KpisMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KpisMetricsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KpisMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
